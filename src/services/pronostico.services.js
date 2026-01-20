import axios from 'axios'

const baseUrl = 'http://127.0.0.1:8000/api/pronosticos/'

// ===== PRONOSTICOS INTERRUPTORES =====
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

// ===== PRONOSTICOS TRANSFORMADORES =====
export const createPronosticoTransformador = async (token, info) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	const { data } = await axios.post(baseUrl + 'transformadores/create/', info, config)
	return data
}

export const getPronosticosTransformadores = async (token, params = '') => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const endpoint = params ? `${baseUrl}transformadores/?${params}` : `${baseUrl}transformadores/`
	const { data } = await axios.get(endpoint, config)
	return data
}

export const getPronosticoTransformadorDetail = async (token, id) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const { data } = await axios.get(`${baseUrl}transformadores/${id}/`, config)
	return data
}

export const sendPronosticoTransformadorEmail = async (token, id) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const { data } = await axios.post(`${baseUrl}transformadores/${id}/email/`, {}, config)
	return data
}
