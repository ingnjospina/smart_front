import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/pronosticos/'

export const createPronostico = async (token, info) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	const { data } = await axios.post(baseUrl + 'create/', info, config)
	return data
}

export const getPronosticos = async (token, params = '') => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const endpoint = params ? `${baseUrl}?${params}` : baseUrl
	const { data } = await axios.get(endpoint, config)
	return data
}
