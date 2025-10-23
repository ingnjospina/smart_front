import { useState, useEffect } from 'react'

export const useUser = () => {
	const [user, setUser] = useState(null)

	useEffect(() => {
		const loggedUserJson = window.localStorage.getItem('loggedAppUser')
		if (loggedUserJson) {
			const user = JSON.parse(loggedUserJson)
			setUser(user)
		}
	}, [])

	const updateUser = (newUser) => {
		setUser(newUser)
	}

	const getUser = async () => {
		const loggedUserJson = await window.localStorage.getItem('loggedAppUser')
		if (loggedUserJson) {
			const user = JSON.parse(loggedUserJson)
			return user
		}
		return {}
	}


	return {
		getUser,
		user,
		updateUser
	}
}
