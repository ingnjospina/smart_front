import JSZip from 'jszip'
import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Table } from 'react-bootstrap'
import { ButtonBox, ButtonCreate, DivForm, PTitleFilter, PButton, StyledForm, SButton, StyledTD, StyledTH, StyledFormSelect, InputForm, LabelForm } from '../tools/styleContent'
import { downloadFile, getMediciones, getMedicionComplemento } from '../../services/mediciones.services'
import { getTransformadores } from '../../services/transformer.services'
import { ModalProvider } from '../modals/modalProvider'
import { Spinner } from '../tools/spinner'
import { UseLogout } from '../../hooks/useLogout'

export const ViewMeasurement = () => {

	const logout = UseLogout()
	const [idTransfo, setIdTransfo] = useState('')
	const [fechaDesde, setFechaDesde] = useState('')
	const [fechaHasta, setFechaHasta] = useState('')
	const [transformadores, setTransformadores] = useState([]);
	const [showSpinner, setShowSpinner] = useState(false)
	const [loadingTransfo, setLoadingTransfo] = useState(true)
	const [mediciones, setMediciones] = useState([])
	const [medicionesOriginales, setMedicionesOriginales] = useState([])
	const [type, setType] = useState('')
	const [show, setShow] = useState(false)
	const [refresh, setRefresh] = useState(false)
	const [idProvider, setIdProvider] = useState('')
	const [base64Files, setBase64Files] = useState([])

	useEffect(() => {

		const fetchTransformadores = async () => {

			try {
				const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
				const response = await getTransformadores(user.token)
				setTransformadores(response)
				setLoadingTransfo(false)
				return response
			} catch (error) {
				console.error('Error al cargar los transformadores:', error)
			}
		}

		const fetchData = async () => {
			try {
				setShowSpinner(true)
				const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
				const respond = await getMediciones(user.token)

				setMediciones(respond)
				setMedicionesOriginales(respond)
				setShowSpinner(false)
			} catch (error) {
				logout.logOut()
			}
		}

		fetchTransformadores().then(()=> {})
		fetchData().then(()=>{})
	}, [refresh])

	const fetchMedicionComplete = async (medicion) => {
		const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
		const response = await getMedicionComplemento(user.token, medicion.idmediciones_transformadores)

		return {...response, ...medicion}
	}

	const handleCloseModal = () => { setShow(false) }

	const getDate = (dateStr) => {
		const fecha = new Date(dateStr)

		const dia = fecha.getDate()
		const mes = fecha.getMonth() + 1
		const anio = fecha.getFullYear()

		return `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`
	}

	const clear = (e) => {
		e.preventDefault()
		setIdTransfo('')
		setFechaDesde('')
		setFechaHasta('')
		setMediciones(medicionesOriginales)
	}

	const filterData = (e) => {
		e.preventDefault()
		setMediciones(medicionesOriginales)

		const filteredMediciones = medicionesOriginales.filter((medicion) => {

			const idMatch = medicion.transformadores.toString().includes(idTransfo)
			let fechaMatch 

			if(fechaDesde === '' && fechaHasta === '') {
				fechaMatch = true
			}

			if(fechaDesde !== '' && fechaHasta === '') {
				fechaMatch = getDate(medicion.fecha_hora) >= fechaDesde
			}

			if(fechaDesde === '' && fechaHasta !== '') {
				fechaMatch = getDate(medicion.fecha_hora) <= fechaHasta
			}

			if(fechaDesde !== '' && fechaHasta !== '') {
				fechaMatch = getDate(medicion.fecha_hora) <= fechaHasta && getDate(medicion.fecha_hora) >= fechaDesde
			}
			return idMatch && fechaMatch
		})

		// Actualizar el estado de mediciones con los resultados filtrados
		setMediciones(filteredMediciones)
	}

	const editMedicion = async (e, medicion) => {
		e.preventDefault()
		const complemento = await fetchMedicionComplete(medicion)
		setType('Editar')
		setShow(true)
		setIdProvider(JSON.stringify(complemento).toString())
	}

	const viewMeasurement = async (medicion) => {
		const complemento = await fetchMedicionComplete(medicion)
		setIdProvider(JSON.stringify(complemento).toString())
		setShow(true)
	}

	const handleConfirmSubmit = (text) => {
		if (text === 'Acept') {
			setRefresh(!refresh)
		}
	}

	const dowloadFile = async (e, id) => {
		e.preventDefault()
		const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
		const response = await downloadFile(user.token, id)

		setBase64Files(response)

		await handleDownload(id)
	}

	//Función para pasar de base64 a excel
	const base64ToBlob = (base64, mimeType) => {
		const byteCharacters = atob(base64)  // decodifica base64 a una cadena de bytes
		const byteArrays = []

		for (let offset = 0; offset < byteCharacters.length; offset += 1024) {
			const slice = byteCharacters.slice(offset, offset + 1024)
			const byteNumbers = new Array(slice.length)

			for (let i = 0; i < slice.length; i++) {
				byteNumbers[i] = slice.charCodeAt(i)
			}

			byteArrays.push(new Uint8Array(byteNumbers))
		}

		return new Blob(byteArrays, { type: mimeType })
	}

	// Función para comprimir los archivos
	const compressFiles = (files, extenciones) => {
		const zip = new JSZip()

		files.forEach((blob, index) => {
			zip.file(`${extenciones[index]}`, blob)
		})

		return zip.generateAsync({ type: 'blob' })
	}

	// Función para manejar la descarga
	const handleDownload = async (id) => {
		// Crear blobs para cada archivo
		const blobs = base64Files.map(data => base64ToBlob(data.base64, 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'))
		const extenciones = base64Files.map(data => data.ext)

		// Comprimir los archivos y ofrecerlos para descarga
		const zipBlob = await compressFiles(blobs, extenciones)

		const link = document.createElement('a')
		link.href = URL.createObjectURL(zipBlob)
		link.download = 'medición_'+id+'.zip'
		link.click()
	}

	return (
		<DivForm >
			<Col xs={12} className={'formBackground'}>
				<Container>
					<PTitleFilter>
						<svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 30 24" fill="none">
							<g clipPath="url(#clip0_1559_364)">
								<path d="M28.6172 17.4984C28.7391 16.8375 28.7391 16.1625 28.6172 15.5016L29.8266 14.8031C29.9672 14.7234 30.0281 14.5594 29.9812 14.4047C29.6672 13.3922 29.1281 12.4734 28.425 11.7141C28.3172 11.5969 28.1438 11.5687 28.0031 11.6484L26.7937 12.3469C26.2828 11.9109 25.6969 11.5734 25.0641 11.3484V9.95156C25.0641 9.79219 24.9516 9.65156 24.7969 9.61875C23.7516 9.38437 22.6875 9.39375 21.6937 9.61875C21.5391 9.65156 21.4266 9.79219 21.4266 9.95156V11.3484C20.7938 11.5734 20.2078 11.9109 19.6969 12.3469L18.4875 11.6484C18.3516 11.5687 18.1734 11.5969 18.0656 11.7141C17.3625 12.4734 16.8234 13.3922 16.5094 14.4047C16.4625 14.5594 16.5281 14.7234 16.6641 14.8031L17.8734 15.5016C17.7516 16.1625 17.7516 16.8375 17.8734 17.4984L16.6641 18.1969C16.5234 18.2766 16.4625 18.4406 16.5094 18.5953C16.8234 19.6078 17.3625 20.5219 18.0656 21.2859C18.1734 21.4031 18.3469 21.4313 18.4875 21.3516L19.6969 20.6531C20.2078 21.0891 20.7938 21.4266 21.4266 21.6516V23.0484C21.4266 23.2078 21.5391 23.3484 21.6937 23.3812C22.7391 23.6156 23.8031 23.6062 24.7969 23.3812C24.9516 23.3484 25.0641 23.2078 25.0641 23.0484V21.6516C25.6969 21.4266 26.2828 21.0891 26.7937 20.6531L28.0031 21.3516C28.1391 21.4313 28.3172 21.4031 28.425 21.2859C29.1281 20.5266 29.6672 19.6078 29.9812 18.5953C30.0281 18.4406 29.9625 18.2766 29.8266 18.1969L28.6172 17.4984ZM23.25 18.7734C21.9938 18.7734 20.9766 17.7516 20.9766 16.5C20.9766 15.2484 21.9984 14.2266 23.25 14.2266C24.5016 14.2266 25.5234 15.2484 25.5234 16.5C25.5234 17.7516 24.5062 18.7734 23.25 18.7734ZM10.5 12C13.8141 12 16.5 9.31406 16.5 6C16.5 2.68594 13.8141 0 10.5 0C7.18594 0 4.5 2.68594 4.5 6C4.5 9.31406 7.18594 12 10.5 12ZM19.9313 22.6172C19.8234 22.5609 19.7156 22.4953 19.6125 22.4344L19.2422 22.65C18.9609 22.8094 18.6422 22.8984 18.3234 22.8984C17.8125 22.8984 17.3203 22.6828 16.9688 22.3078C16.1109 21.3797 15.4547 20.25 15.0844 19.0453C14.8266 18.2156 15.1734 17.3391 15.9234 16.9031L16.2938 16.6875C16.2891 16.5656 16.2891 16.4438 16.2938 16.3219L15.9234 16.1063C15.1734 15.675 14.8266 14.7937 15.0844 13.9641C15.1266 13.8281 15.1875 13.6922 15.2344 13.5563C15.0563 13.5422 14.8828 13.5 14.7 13.5H13.9172C12.8766 13.9781 11.7188 14.25 10.5 14.25C9.28125 14.25 8.12813 13.9781 7.08281 13.5H6.3C2.82187 13.5 0 16.3219 0 19.8V21.75C0 22.9922 1.00781 24 2.25 24H18.75C19.2234 24 19.6641 23.85 20.025 23.6016C19.9688 23.4234 19.9313 23.2406 19.9313 23.0484V22.6172Z" fill="#E40613" />
							</g>
							<defs>
								<clipPath id="clip0_1559_364">
									<rect width="30" height="24" fill="white" />
								</clipPath>
							</defs>
						</svg>
						Mediciones Registradas.
					</PTitleFilter>
					<StyledForm onSubmit={filterData}>
						<Row xs={12}>
							<Col xs={12} md={3}>
								<Col xs={12}>
									<LabelForm>Transformador</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={idTransfo}
										name='idTransfo'
										placeholder='Transformador'
										onChange={({ target }) => setIdTransfo(target.value)}
									>
										<option value=""></option>
										{loadingTransfo ? (
											<option disabled>Cargando...</option>
										) : (
											transformadores.map((item) => (
												<option key={item.idtransformadores} value={item.idtransformadores}>
													{item.nombre}
												</option>
											))
										)}
									</StyledFormSelect>
								</Col>
							</Col>
							<Col xs={12} md={2}>
								<Col xs={12}>
									<LabelForm>
										Fecha Desde
									</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='date'
										value={fechaDesde}
										name='fechaDesde'
										placeholder=''
										onChange={({ target }) => setFechaDesde(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={12} md={2}>
								<Col xs={12}>
									<LabelForm>
										Fecha Hasta
									</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='date'
										value={fechaHasta}
										name='fechaHasta'
										placeholder=''
										onChange={({ target }) => setFechaHasta(target.value)}
									/>
								</Col>
							</Col>
							<ButtonBox xs={12} md={2}>
								<SButton onClick={clear}>
									Limpiar
								</SButton>
							</ButtonBox>
							<ButtonBox xs={2}>
								<PButton>
									Filtrar
								</PButton>
							</ButtonBox>
						</Row>
					</StyledForm>
					<ButtonCreate xs={12}>
						<Col xs={12} md={3}>
						</Col>
					</ButtonCreate>
					<Table responsive="sm">
						<thead>
							<tr>
								<StyledTH>Transformador</StyledTH>
								<StyledTH># Medición</StyledTH>
								<StyledTH>HI. Dieléctrico</StyledTH>
								<StyledTH>HI. Funcional</StyledTH>
								<StyledTH>HI. Ponderado</StyledTH>
								<StyledTH>Fecha</StyledTH>
								<StyledTH>Ver</StyledTH>
								<StyledTH>Editar</StyledTH>
								<StyledTH>Archivos</StyledTH>
							</tr>
						</thead>
						<tbody>
							{
								mediciones.map((medicion, key) => {
									return (
										<tr id={key} key={key}>
											<StyledTD>
												{medicion.transformadores} - 
												{(() => {
													const transformador = transformadores.find(t => t.idtransformadores === medicion.transformadores)
													return transformador ? transformador.nombre : 'No disponible'
												})()}
											</StyledTD>
											<StyledTD>
												{medicion.idmediciones_transformadores}
											</StyledTD>
											<StyledTD>
												{medicion.hi_dielectrico}
											</StyledTD>
											<StyledTD>
												{medicion.hi_funcional}
											</StyledTD>
											<StyledTD>
												{medicion.hi_ponderado}
											</StyledTD>
											<StyledTD>
												{getDate(medicion.fecha_hora)}
											</StyledTD>
											<StyledTD>
												<a href='#' onClick={() => viewMeasurement(medicion)}>
													<svg xmlns="http://www.w3.org/2000/svg" width="27" height="20" viewBox="0 0 27 20" fill="none">
														<path d="M25.9154 9.70601C23.1415 3.8626 18.9484 0.921875 13.3273 0.921875C7.7034 0.921875 3.51323 3.8626 0.739294 9.70893C0.513985 10.183 0.513985 10.7389 0.739294 11.2159C3.51323 17.0593 7.70632 20 13.3273 20C18.9513 20 23.1415 17.0593 25.9154 11.2129C26.1407 10.7389 26.1407 10.1888 25.9154 9.70601ZM13.3273 17.8932C8.60756 17.8932 5.15184 15.4997 2.71441 10.4609C5.15184 5.42221 8.60756 3.02866 13.3273 3.02866C18.0471 3.02866 21.5028 5.42221 23.9403 10.4609C21.5058 15.4997 18.0501 17.8932 13.3273 17.8932Z" fill="#99ABB4" />
														<path d="M13.2105 5.31104C10.3663 5.31104 8.06055 7.6168 8.06055 10.461C8.06055 13.3051 10.3663 15.6109 13.2105 15.6109C16.0546 15.6109 18.3604 13.3051 18.3604 10.461C18.3604 7.6168 16.0546 5.31104 13.2105 5.31104ZM13.2105 13.7382C11.3992 13.7382 9.93325 12.2722 9.93325 10.461C9.93325 8.64971 11.3992 7.18373 13.2105 7.18373C15.0217 7.18373 16.4877 8.64971 16.4877 10.461C16.4877 12.2722 15.0217 13.7382 13.2105 13.7382Z" fill="#99ABB4" />
													</svg>
												</a>
											</StyledTD>
											<StyledTD>
												<a href='#' onClick={(event) => editMedicion(event, medicion)}>
													<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
														<path d="M9.0971 14.2644C9.08195 14.2837 9.0668 14.304 9.06 14.3285L7.89074 18.6153C7.82256 18.8649 7.8924 19.1339 8.07716 19.3235C8.21536 19.4585 8.39744 19.5327 8.59138 19.5327C8.65542 19.5327 8.7196 19.525 8.78276 19.5082L13.0392 18.3473C13.046 18.3473 13.0493 18.3533 13.0545 18.3533C13.1034 18.3533 13.1514 18.3355 13.1877 18.2984L24.5696 6.9182C24.9076 6.57968 25.093 6.11854 25.093 5.61682C25.093 5.04833 24.8519 4.48007 24.4297 4.05894L23.3547 2.98231C22.9332 2.56007 22.3641 2.31851 21.7959 2.31851C21.2943 2.31851 20.8332 2.50395 20.4942 2.84162L9.11404 14.2249C9.10222 14.2357 9.10554 14.2518 9.0971 14.2644ZM23.4558 5.80366L22.3253 6.93335L20.4926 5.07153L21.6071 3.95699C21.7832 3.77992 22.1247 3.80575 22.327 4.00882L23.4027 5.08546C23.5149 5.19752 23.5789 5.34671 23.5789 5.49424C23.5782 5.61516 23.5351 5.72488 23.4558 5.80366ZM11.1213 14.4432L19.3343 6.2298L21.1679 8.09286L12.9702 16.2902L11.1213 14.4432ZM9.62493 17.7732L10.2184 15.5947L11.8016 17.178L9.62493 17.7732ZM23.5532 10.3134C23.1223 10.3134 22.7431 10.6637 22.7414 11.1004V21.7495C22.7414 22.3059 22.2896 22.7374 21.7323 22.7374H4.22569C3.66927 22.7374 3.25457 22.306 3.25457 21.7495V4.22398C3.25457 3.66716 3.66925 3.24793 4.22569 3.24793H16.2401C16.6734 3.24793 17.0249 2.86292 17.0249 2.42954C17.0249 1.99701 16.6734 1.62512 16.2401 1.62512H4.10596C2.74947 1.62512 1.62207 2.74779 1.62207 4.10509V21.8693C1.62207 23.2267 2.7495 24.3683 4.10596 24.3683H21.8511C23.2085 24.3683 24.3639 23.2267 24.3639 21.8693V11.0955C24.3622 10.6637 23.9839 10.3134 23.5532 10.3134Z" fill="#99ABB4" />
													</svg>
												</a>
											</StyledTD>
											<StyledTD>
												{
													medicion.haveFiles ? 
														(
															<a href='#' onClick={(event) => dowloadFile(event, medicion.idmediciones_transformadores)}>
																<svg width="35" height="35" viewBox="0 0 26 26" fill="none" xmlns="http://www.w3.org/2000/svg">
																	<path d="M1.37615 15.25H12.6262C12.7823 15.2497 12.933 15.3079 13.0484 15.4131C13.1638 15.5184 13.2356 15.663 13.2497 15.8185C13.2639 15.9741 13.2192 16.1293 13.1246 16.2535C13.03 16.3778 12.8923 16.4622 12.7387 16.49L12.6262 16.5H1.37615C1.21997 16.5003 1.06934 16.4421 0.953923 16.3369C0.838507 16.2316 0.76667 16.087 0.752558 15.9315C0.738446 15.7759 0.783082 15.6207 0.877677 15.4965C0.972271 15.3722 1.10997 15.2878 1.26365 15.26L1.37615 15.25H12.6262H1.37615ZM6.88865 0.26L7.00115 0.25C7.14743 0.249951 7.2891 0.301214 7.40148 0.394862C7.51385 0.488509 7.58982 0.618607 7.61615 0.7625L7.62615 0.875V11.865L10.9787 8.51375C11.0821 8.41022 11.2185 8.34625 11.3643 8.333C11.51 8.31975 11.6558 8.35806 11.7762 8.44125L11.8637 8.51375C11.967 8.61732 12.0307 8.75386 12.0437 8.89959C12.0568 9.04532 12.0182 9.191 11.9349 9.31125L11.8624 9.3975L7.44365 13.8175C7.34008 13.9208 7.20354 13.9846 7.05781 13.9976C6.91208 14.0106 6.7664 13.9721 6.64615 13.8888L6.55865 13.8175L2.1399 9.3975C2.02917 9.28726 1.96375 9.13955 1.95652 8.98347C1.9493 8.82739 2.0008 8.67427 2.10087 8.55427C2.20094 8.43428 2.34233 8.35612 2.49717 8.3352C2.65201 8.31428 2.80907 8.35211 2.9374 8.44125L3.02365 8.51375L6.37615 11.865V0.875C6.3761 0.728718 6.42737 0.587053 6.52101 0.474676C6.61466 0.3623 6.74476 0.286331 6.88865 0.26L7.00115 0.25L6.88865 0.26Z" fill="#99ABB4"/>
																</svg>
															</a>): (<></>)
												}
											</StyledTD>
										</tr>
									)
								})
							}
						</tbody>
					</Table>
				</Container>
			</Col>
			<ModalProvider
				showModal={show}
				handleCloseModal={handleCloseModal}
				handleConfirmSubmit={handleConfirmSubmit}
				type={type}
				idProvider={idProvider}
			/>			
			{
				showSpinner ? (
					<div className={'divSpinner'}>
						<Spinner />
					</div>
				) :
					(
						<></>
					)
			}
		</DivForm >
	)
}