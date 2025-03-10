import {  useNavigate } from 'react-router-dom'

export const UseLogout = () => {
	const nav = useNavigate()

	const logOut = () => {
		window.localStorage.removeItem('loggedAppUser')
		nav('/')
		window.location.reload()
	}

	return {
		logOut,
	}
}