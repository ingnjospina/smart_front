import axios from 'axios'

const url = 'http://127.0.0.1:8000/api/mediciones/'

export const createMedicion = async (token, body) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}
	const { data } = await axios.post(url+'create/', body, config)
	return data
}

export const getMediciones = async(token) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const { data } = await axios.get(url, config) 
	return data
}

export const getMedicionComplemento = async(token, idMedicion) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const { data } = await axios.get(url+'total/'+idMedicion+'/', config) 
	return data
}

export const editMedicion = async (token, body, idMedicion) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}
	const { data } = await axios.put(url + idMedicion + '/', body, config)
	return data
}

export const downloadFile = async (token, id) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		}
	}

	const { data } = await axios.get(url + 'file/' + id, config)
	return data
}