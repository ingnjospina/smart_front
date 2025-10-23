import { useUser } from './useUser'

export const UseRefreshToken = () => {

	const user = useUser()


	const refreshToken = async (obj) => {
		const newUser = await user.getUser()
		newUser.token = obj.token
		const userStr = JSON.stringify(newUser)
		window.localStorage.setItem('loggedAppUser', userStr)
	}

	return {
		refreshToken,
	}
}