import axios from 'axios'
import { UseBase64 } from '../hooks/useBase64'

const url = 'http://localhost:3001/api/request'

export const createRequest = async (token, idUsuario, tipo, productoSolicitado, descripcionSolicitud, fechaEntrega, urgencia, especificaciones, listLink, doc) => {
	const conver = UseBase64()
	const obj = { idUsuario, tipo, productoSolicitado, descripcionSolicitud, fechaEntrega, urgencia, especificaciones, listLink, doc }

	let linksProducto = ''

	for (let i = 0; i < listLink.length; i++) {
		linksProducto += listLink[i] + ';'
	}
	obj.linksProducto = linksProducto
	if(doc.length > 0)
		obj.documento = await conver.getBase64(doc[0])

	const config = {
		headers: {
			authorization: 'Bearer ' + token,
			idRequest: idUsuario
		}
	}
	const { data } = await axios.post(url, obj, config)

	return data
}


export const getAll = async (idRequest, token) => {
	const config = {
		headers: {
			authorization: 'Bearer '+token,
			idRequest
		}
	}
	const { data } = await axios.get(`${url}/getAll`, config)
	return data
}