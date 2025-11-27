/** @format */
import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import placeholderAvatar from "../assets/icons/image0copy.png";
import speechBubbleIcon from "../assets/icons/speechbubble.png";
import Login from "./Login";
import Logout from "./Logout";
import supabase from "../../supabase";
import Search from "./Search";
import Avatar1 from "../assets/Avatars/Avatar1.png";
import Avatar2 from "../assets/Avatars/Avatar2.png";
import Avatar3 from "../assets/Avatars/Avatar3.png";
import Avatar4 from "../assets/Avatars/Avatar4.png";
import Avatar5 from "../assets/Avatars/Avatar5.png";
import Avatar6 from "../assets/Avatars/Avatar6.png";
import Avatar7 from "../assets/Avatars/Avatar7.png";
import Avatar8 from "../assets/Avatars/Avatar8.png";
import Avatar9 from "../assets/Avatars/Avatar9.png";
import Avatar10 from "../assets/Avatars/Avatar10.png";
import Avatar11 from "../assets/Avatars/Avatar11.png";
import Avatar12 from "../assets/Avatars/Avatar12.png";

const avatarOptions = {
	Avatar1,
	Avatar2,
	Avatar3,
	Avatar4,
	Avatar5,
	Avatar6,
	Avatar7,
	Avatar8,
	Avatar9,
	Avatar10,
	Avatar11,
	Avatar12,
};

const Navbar = () => {
	const [showLoginModal, setShowLoginModal] = useState(false);
	const [session, setSession] = useState(null);
	const [userAvatar, setUserAvatar] = useState(null);

	useEffect(() => {
		supabase.auth.getSession().then(({ data: { session } }) => {
			setSession(session);
		});

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
		async function fetchUserProfile() {
			if (session) {
				const { data: user, error } = await supabase
					.from("profiles")
					.select("avatar")
					.eq("id", session.user.id)
					.single();

				if (error) {
					console.error("Error fetching user profile:", error);
				} else {
					setUserAvatar(avatarOptions[user?.avatar]);
				}
			}
		}

		fetchUserProfile();
	}, [session]);

	const closeModal = () => {
		setShowLoginModal(false);
	};

	return (
		<>
			<nav className='SiteNav'>
				<div className='SiteNav__brand'>
					<Link to='/' className='SiteNav__logo'>
						GAMERNET
					</Link>
					<Search session={session} />
				</div>

				<div className='SiteNav__actions'>
					{session && (
						<Link to='/chat' className='SiteNav__icon' aria-label='Open chat'>
							<img src={speechBubbleIcon} alt='Chat' />
						</Link>
					)}

					{session && (
						<Link
							to='/profile'
							className='SiteNav__avatar'
							aria-label='Profile'>
							<img src={userAvatar || placeholderAvatar} alt='Avatar' />
						</Link>
					)}

					{session ? (
						<div className='SiteNav__auth'>
							<Logout onClick={() => setSession(null)} />
						</div>
					) : (
						<button
							className='Button Button--primary'
							onClick={() => setShowLoginModal(true)}>
							Log In · Sign Up
						</button>
					)}
				</div>
			</nav>

			{showLoginModal && !session && (
				<div className='modal-overlay' onClick={closeModal}>
					<div
						className='login-modal'
						onClick={(event) => event.stopPropagation()}>
						<Login />
					</div>
				</div>
			)}
		</>
	);
};

export default Navbar;
