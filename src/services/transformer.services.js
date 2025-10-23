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

export const getTransformadorById = async (token,id) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	let urlById = url+id+'/'

	const { data } = await axios.get(urlById, config)
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

export const updateTransformadores = async (token,id,info) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	let urlUpdate = url +id+'/'

	const { data } = await axios.put(urlUpdate,info, config)
	return data
}

export const deleteTransformador = async (token,id) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token
		},
	}
	let urlDelete = url +id+'/'
	const { data } = await axios.delete(urlDelete, config)
	return data
}