const TOKEN_ENDPOINT = "https://id.twitch.tv/oauth2/token";
const IGDB_GAMES_ENDPOINT = "https://api.igdb.com/v4/games";

const clientId = import.meta.env.VITE_TWITCH_CLIENT_ID;
const clientSecret = import.meta.env.VITE_TWITCH_CLIENT_SECRET;

let cachedToken;
let tokenExpiry = 0;

const requireCredentials = () => {
  if (!clientId || !clientSecret) {
    throw new Error(
      "Missing Twitch credentials. Set VITE_TWITCH_CLIENT_ID and VITE_TWITCH_CLIENT_SECRET."
    );
  }
};

const fetchAppAccessToken = async () => {
  requireCredentials();
  if (cachedToken && Date.now() < tokenExpiry) {
    return cachedToken;
  }

  const params = new URLSearchParams({
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: "client_credentials",
  });

  const response = await fetch(`${TOKEN_ENDPOINT}?${params.toString()}`, {
    method: "POST",
  });

  if (!response.ok) {
    throw new Error("Unable to authenticate with Twitch");
  }

  const data = await response.json();
  cachedToken = data.access_token;
  tokenExpiry = Date.now() + (data.expires_in - 60) * 1000; // refresh one minute early
  return cachedToken;
};

const queryIGDB = async (query) => {
  const token = await fetchAppAccessToken();

  const response = await fetch(IGDB_GAMES_ENDPOINT, {
    method: "POST",
    headers: {
      "Client-ID": clientId,
      Authorization: `Bearer ${token}`,
      "Content-Type": "text/plain",
    },
    body: query,
  });

  if (response.status === 401) {
    cachedToken = undefined;
    tokenExpiry = 0;
    return queryIGDB(query);
  }

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`IGDB request failed: ${error}`);
  }

  return response.json();
};

const normalizeCoverUrl = (cover) => {
  if (!cover?.url) return null;
  const upgraded = cover.url.replace("t_thumb", "t_cover_big");
  return upgraded.startsWith("//") ? `https:${upgraded}` : upgraded;
};

const normalizePlatforms = (platforms = []) =>
  platforms.map((platform) => ({
    platform: {
      id: platform.id ?? platform.name,
      name: platform.name,
    },
  }));

const normalizeGenres = (genres = []) =>
  genres.map((genre) => ({
    id: genre.id ?? genre.name,
    name: genre.name,
  }));

const normalizeGames = (games = []) =>
  games.map((game) => ({
    ...game,
    background_image: normalizeCoverUrl(game.cover),
    platforms: normalizePlatforms(game.platforms),
    genres: normalizeGenres(game.genres),
  }));

export const fetchTrendingGames = async (limit = 24) => {
  const query = `
    fields name, cover.url, cover.image_id, genres.id, genres.name, platforms.id, platforms.name, summary, hypes;
    sort hypes desc;
    where hypes != null & cover != null;
    limit ${limit};
  `;
  const data = await queryIGDB(query);
  return normalizeGames(data);
};

export const fetchTopRatedGames = async (limit = 24) => {
  const query = `
    fields name, cover.url, cover.image_id, genres.id, genres.name, platforms.id, platforms.name, rating, rating_count;
    sort rating desc;
    where rating != null & rating_count >= 100 & cover != null;
    limit ${limit};
  `;
  const data = await queryIGDB(query);
  return normalizeGames(data);
};

export const fetchRecentGames = async (limit = 24) => {
  const now = Math.floor(Date.now() / 1000);
  const ninetyDaysAgo = now - 90 * 24 * 60 * 60;
  const query = `
    fields name, cover.url, cover.image_id, genres.id, genres.name, platforms.id, platforms.name, first_release_date;
    sort first_release_date desc;
    where first_release_date != null & first_release_date >= ${ninetyDaysAgo} & cover != null;
    limit ${limit};
  `;
  const data = await queryIGDB(query);
  return normalizeGames(data);
};

