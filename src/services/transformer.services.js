import axios from 'axios'

const url = 'http://127.0.0.1:8000/api/tranformadores/'

export const getTransformadores = async (token) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	const { data } = await axios.get(url, config)
	return data
}

export const createTransformadores = async (token, info) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	const { data } = await axios.post(url,info, config)
	return data
}
