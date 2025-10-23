import axios from 'axios'

const url = 'http://127.0.0.1:8000/api/alertas/'

export const getAlertas = async(token) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const { data } = await axios.get(url, config) 
	return data
}