/** @format */

import { useState, useEffect } from "react";
import Switch from "react-switch";
import supabase from "../../supabase";
import AvatarModal from "./AvatarModal";

const timezones = [
	"Eastern (UTC-5)",
	"Central (UTC-6)",
	"Mountain (UTC-7)",
	"Pacific (UTC-8)",
];

const CreateUserForm = () => {
	const [formData, setFormData] = useState({
		platform: {
			pc: false,
			playstation: false,
			xbox: false,
			switch: false,
		},
		gamertag: "",
		timezone: "",
	});

	useEffect(() => {
		async function fetchUserProfile() {
			const {
				data: { user },
			} = await supabase.auth.getUser();
			if (user) {
				const { data, error } = await supabase
					.from("profiles")
					.select("pc, playstation, xbox, switch, gamertag, timezone")
					.eq("id", user.id)
					.single();

				if (error) {
					console.error("Error fetching user profile:", error);
				} else {
					setFormData((prevData) => ({
						...prevData,
						platform: {
							pc: data.pc,
							playstation: data.playstation,
							xbox: data.xbox,
							switch: data.switch,
						},
						gamertag: data.gamertag,
						timezone: data.timezone,
					}));
				}
			}
		}

		fetchUserProfile();
	}, []); // Empty dependency array means this effect runs once after the component mounts

	const [showModal, setShowModal] = useState(false);
	const [selectedAvatar, setSelectedAvatar] = useState(null);
	const handleOpenModal = () => {
		setShowModal(true);
	};

	const handleCloseModal = () => {
		setShowModal(false);
	};

	const handleSaveAvatar = (avatar) => {
		setSelectedAvatar(avatar);
	};
	const handleChange = (e) => {
		const { name, value } = e.target;
		setFormData((prevData) => ({ ...prevData, [name]: value }));
	};

	const platformOptions = [
		{ value: "pc", label: "PC" },
		{ value: "playstation", label: "Playstation" },
		{ value: "xbox", label: "Xbox" },
		{ value: "switch", label: "Nintendo Switch" },
	];

	const handlePlatformChange = async (platform) => {
		try {
			// Fetch the user's profile data
			const {
				data: { user },
			} = await supabase.auth.getUser();

			const userId = user.id;

			// Fetch the current platform value
			const { data, error } = await supabase
				.from("profiles")
				.select(platform)
				.eq("id", userId)
				.single();

			if (error) {
				console.error("Error fetching platform data:", error);
				return;
			}

			// Toggle the platform value
			const updatedValue = !data[platform];
			const { error: updateError } = await supabase
				.from("profiles")
				.update({ [platform]: updatedValue })
				.eq("id", userId);

			if (updateError) {
				console.error("Error updating platform value:", updateError);
			} else {
				// Update the form data state
				setFormData((prevData) => ({
					...prevData,
					platform: {
						...prevData.platform,
						[platform]: updatedValue,
					},
				}));
			}
		} catch (error) {
			console.error("Error handling platform change:", error);
		}
	};

	const updateGamertagInDatabase = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		try {
			const { data, error } = await supabase
				.from("profiles")
				.update({ gamertag: formData.gamertag })
				.eq("id", user.id);

			if (error) {
				console.error("Error updating gamertag:", error);
			} else {
				console.log("Gamertag updated successfully:", data);
			}
		} catch (error) {
			console.error("Error updating gamertag:", error);
		}
	};
	const updateTimezoneInDatabase = async () => {
		const {
			data: { user },
		} = await supabase.auth.getUser();

		try {
			const { data, error } = await supabase
				.from("profiles")
				.update({ timezone: formData.timezone })
				.eq("id", user.id);

			if (error) {
				console.error("Error updating timezone:", error);
			} else {
				console.log("timezone updated successfully:", data);
			}
		} catch (error) {
			console.error("Error updating timezone:", error);
		}
		window.location.reload(); // Refresh the page
	};

	return (
		<form
			className='createUserForm'
			onSubmit={(event) => {
				event.preventDefault();
				updateGamertagInDatabase();
				updateTimezoneInDatabase();
			}}>
			{platformOptions.map((platformOption) => (
				<div key={platformOption.value} className='form-toggle'>
					<label className='form-label'>{platformOption.label}</label>
					<Switch
						onChange={() => handlePlatformChange(platformOption.value)}
						checked={formData.platform[platformOption.value]}
						onColor='#e50914'
						offColor='#262626'
						uncheckedIcon={false}
						checkedIcon={false}
					/>
				</div>
			))}

			<div className='form-field'>
				<label className='form-label' htmlFor='gamertag'>
					Gamertag
				</label>
				<input
					id='gamertag'
					type='text'
					name='gamertag'
					value={formData.gamertag}
					onChange={handleChange}
					placeholder='Enter your gamertag'
					className='form-control'
				/>
			</div>

			<div className='form-field'>
				<label className='form-label' htmlFor='timezone'>
					Timezone
				</label>
				<select
					id='timezone'
					name='timezone'
					value={formData.timezone}
					onChange={handleChange}
					className='form-control'>
					<option value=''>Choose your timezone</option>
					{timezones.map((timezone) => (
						<option key={timezone} value={timezone}>
							{timezone}
						</option>
					))}
				</select>
			</div>

			<div className='form-actions'>
				{selectedAvatar && (
					<div className='selected-avatar'>
						<img src={selectedAvatar.image} alt={selectedAvatar.label} />
						<p>{selectedAvatar.label}</p>
					</div>
				)}

				<div className='ButtonRow'>
					<button
						className='Button Button--ghost'
						type='button'
						onClick={handleOpenModal}>
						Select Avatar
					</button>
					<button className='Button Button--primary' type='submit'>
						Save Profile
					</button>
				</div>
			</div>

			{showModal && (
				<div className='modal-overlay' onClick={handleCloseModal}>
					<div
						className='avatar-modal'
						onClick={(event) => event.stopPropagation()}>
						<AvatarModal onClose={handleCloseModal} onSave={handleSaveAvatar} />
					</div>
				</div>
			)}
		</form>
	);
};

export default CreateUserForm;
