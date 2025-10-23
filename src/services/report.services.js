import axios from 'axios'
import { UseBase64 } from '../hooks/useBase64'

const url = 'http://localhost:3001/api/report'

export const createReport = async (token, idUsuario, edificio, ubicacion, descripcionLugar, tipoDanio, descripcionDanio, listState, tipoReporte) => {
	const conver = UseBase64()
	const obj = { idUsuario, edificio, ubicacion, descripcionLugar, tipoDanio, descripcionDanio, tipoReporte }

	const documents = []

	for(let i=0 ; i<listState.length ; i++)
	{
		const base64 = await conver.getBase64(listState[i])
		documents.push({ nombre: listState[i].name, base64 })
	}
	obj.documentos = documents

	const config = {
		headers: {
			authorization: 'Bearer ' + token,
			idRequest: idUsuario
		}
	}
	const { data } = await axios.post(url, obj, config)

	return data
}

export const getReport = async (idRequest, token, ticket) => {
	const config = {
		headers: {
			authorization: 'Bearer '+token,
			idRequest
		}
	}
	console.log({idRequest, token, ticket})
	const { data } = await axios.get(`${url}/${ticket}`, config)
	return data
}

export const assign =  async (idRequest, token, Proveedores_idProveedor, idReport) => {
	const config = {
		headers: {
			authorization: 'Bearer '+token,
			idRequest
		}
	}

	const { data } = await axios.patch(`${url}/${idReport}`, {Proveedores_idProveedor}, config)
	
	return data
} 

export const addDoc = async (idRequest, token, doc, ticket) => {
	const conver = UseBase64()
	const config = {
		headers: {
			authorization: 'Bearer '+token,
			idRequest
		}
	}

	const base64 = await conver.getBase64(doc)
	

	const { data } = await axios.post(`${url}/doc/${ticket}`, {doc: base64}, config)
	return data
}