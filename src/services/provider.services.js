import axios from 'axios'
import { UseBase64 } from '../hooks/useBase64'

const url = 'http://localhost:3001/api/provider'


export const getProvider = async (idRequest, token) => {

	const config = {
		headers: {
			authorization: 'Bearer ' + token,
			idRequest
		}
	}

	const { data } = await axios.get(url, config)
	return data
}

export const newProvider = async (
	token,
	idUsuario,
	tipoProveedor,
	idProveedor,
	digito,
	nombreTitular,
	nombreEmpresa,
	direccion,
	telefono,
	correo,
	doc,
	fechaInicioContrato,
	fechaFinContrato,
	descripcion,
	services,) => {

	try {

		const conver = UseBase64()


		let descripcionServicios = ''

		for (let i = 0; i < services.length; i++)
			descripcionServicios += services[i] + ';'

		descripcionServicios += '//' + descripcion


		const obj = {
			tipoProveedor,
			idProveedor,
			digito,
			nombreTitular,
			nombreEmpresa,
			direccion,
			telefono,
			correo,
			fechaInicioContrato,
			fechaFinContrato,
			descripcionServicios
		}

		if (doc.length > 0)
			obj.documento = await conver.getBase64(doc[0])

		const config = {
			headers: {
				authorization: 'Bearer ' + token,
				idRequest: idUsuario
			}
		}
		console.log({config, obj})
		const { data } = await axios.post(url, obj, config)
		
		return data
	}
	catch (error) {
		console.log(error)
		throw Error(error)
	}
}

export const pathProvider = async (idRequest, token, obj) => {
	try {
		const config = {
			headers: {
				authorization: 'Bearer ' + token,
				idRequest
			}
		}
		console.log('aqui')
		const conver = UseBase64()


		let descripcionServicios = ''

		for (let i = 0; i < obj.services.length; i++)
			descripcionServicios += obj.services[i] + ';'

		descripcionServicios += '//' + obj.descripcion

		obj.descripcionServicios = descripcionServicios

		if (obj.doc.length > 0)
			obj.documento = await conver.getBase64(obj.doc[0])

		console.log({ config, obj })

		const { data } = await axios.patch(`${url}/${obj.id}`, obj, config)
		return data
	}
	catch (error) {
		console.log(error)
		throw Error(error)
	}
}
