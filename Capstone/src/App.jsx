/** @format */

import "./App.css";
import React from "react";
import { Helmet } from "react-helmet";
import { BrowserRouter as Router, Route, Routes } from "react-router-dom";
import Navbar from "./components/Navbar";
import HomePage from "./components/HomePage";
import UsersPage from "./components/UsersPage";
import FriendSearchPage from "./components/FriendSearchPage";
import ChatMessagePage from "./components/ChatMessagePage";
import ProfilePage from "./components/ProfilePage";

function App() {
	return (
		<Router>
			<div className='AppShell'>
				<Helmet>
					<title>GamerNet</title>
					<link rel='icon' href='/icons/mario2.png' />
				</Helmet>
				<Navbar />
				<main className='AppLayout'>
					<Routes>
						<Route path='/' element={<HomePage />} />
						<Route path='/users' element={<UsersPage />} />
						<Route path='/profile' element={<ProfilePage />} />
						<Route path='/friend_search' element={<FriendSearchPage />} />
						<Route path='/chat' element={<ChatMessagePage />} />
					</Routes>
				</main>
			</div>
		</Router>
	);
}

export default App;
