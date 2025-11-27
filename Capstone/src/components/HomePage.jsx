/** @format */

import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import HomeCarouselOne from "./HomeCarouselOne";
import HomeCarouselTwo from "./HomeCarouselTwo";
import HomeCarouselThree from "./HomeCarouselThree";
import supabase from "../../supabase";
import ChatBox from "./ChatBox";
import Login from "./Login";

const HomePage = () => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [session, setSession] = useState(null);

	useEffect(() => {
		// Check if there's an existing session
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

		// Subscribe to auth state changes
		const {
			data: { subscription },
		} = supabase.auth.onAuthStateChange((_event, session) => {
			setSession(session);
		});

		return () => {
			subscription.unsubscribe();
		};
	}, []);

	useEffect(() => {
		if (!session) {
			const timer = setTimeout(() => {
				setShowLoginModal(true);
			}, 5000);

			return () => clearTimeout(timer);
		}
	}, [session]);

	return (
		<div className='HomePage'>
			<div className='HomeContainer'>
				<section className='HomeHero'>
					<div className='HomeHero__content'>
						<p className='HomeHero__eyebrow'>Play together</p>
						<h1>Discover squads. Build your library. Stay in the loop.</h1>
						<p>
							A minimalist hub for multiplayer gamers—track what you play, see
							who&rsquo;s online, and drop into conversations without the
							clutter.
						</p>
						<div className='HomeHero__cta'>
							<Link className='Button Button--primary' to='/friend_search'>
								Find teammates
							</Link>
							<Link className='Button Button--ghost' to='/users'>
								Explore profiles
							</Link>
						</div>
					</div>

					<div className='HomeHero__stats'>
						<article>
							<span>1200+</span>
							<p>Tracked multiplayer titles</p>
						</article>
						<article>
							<span>240</span>
							<p>Active LFG rooms</p>
						</article>
						<article>
							<span>99.9%</span>
							<p>Uptime on live chat</p>
						</article>
					</div>
				</section>

				<section>
					<h2 className='HomepageHeader'>New & Trending</h2>
					<HomeCarouselOne />
				</section>

				<section>
					<h2 className='HomepageHeader'>Top Rated</h2>
					<HomeCarouselTwo />
				</section>

				<section>
					<h2 className='HomepageHeader'>Recently Released</h2>
					<HomeCarouselThree />
				</section>
			</div>

			<aside className='HomeSidebar'>
				<ChatBox />

				{!session && showLoginModal && (
					<div className='HomeLoginPrompt'>
						<h3>Drop in to the conversation</h3>
						<p>
							Sign back in to sync your chats, friends, and session history.
						</p>
						<Login />
					</div>
				)}
			</aside>
		</div>
	);
};

export default HomePage;
