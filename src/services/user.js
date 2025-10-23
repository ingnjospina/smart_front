import axios from 'axios'

const url = 'http://localhost:8000/api/usuarios/'

export const getUsers = async (idRequest, token) => {
	const config = {
		headers: {
			authorization: 'Bearer '+token,
			idRequest
		},
		body: {
			idRequest
		},
	}
	const { data } = await axios.get(url, config, {idRequest})
	return data
}