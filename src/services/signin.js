import axios from 'axios'

const url = 'http://localhost:8000/api/login/'

export const signin = async (username, password) => {
	const {data} = await axios.post(url, {username, password})
	return data
}