import axios from 'axios'

const url = 'http://localhost:3001/api/actions'


export const getActions = async (idRequest, token, idProvider) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token,
			idRequest
		}
	}

	const { data } = await axios.get(`${url}/${idProvider}`, config)
	console.log(data)
	return data
}

export const patchAction = async (idRequest, token, idAction, estado) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token,
			idRequest
		}
	}

	const { data } = await axios.patch(`${url}/${idAction}`, { estado }, config)
	return data
}

export const newAction = async (idRequest, token, estado, accion, descripcionAccion, idReporte) => {
	const config = {
		headers: {
			authorization: 'Bearer ' + token,
			idRequest
		}
	}

	const obj = {estado, accion, descripcionAccion, idReporte}
	console.log(obj, config)
	//const { data } = await axios.post(url, obj, config)
	//return data
}