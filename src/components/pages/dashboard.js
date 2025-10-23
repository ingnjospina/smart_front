/* eslint-disable react/prop-types */
import React, { useState, useEffect } from 'react'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { Col, Container, Row, Table } from 'react-bootstrap'
import { ButtonBox, DivForm, PTitleFilter, PButton, PEstadoApproved, PEstadoBueno, PEstadoPobre, PEstadoRejected, PEstadoSupervision, 
	StyledForm, SButton, StyledTD, StyledTH, StyledFormSelect, InputForm, LabelForm } from '../tools/styleContent'
import { getAlertas } from '../../services/alertas.services'
import { getTransformadores } from '../../services/transformer.services'
import { Spinner } from '../tools/spinner'
import { UseLogout } from '../../hooks/useLogout'

export const Dashboard = () => {

	const logout = UseLogout()
	const [idTransfo, setIdTransfo] = useState('')
	const [fechaDesde, setFechaDesde] = useState('')
	const [fechaHasta, setFechaHasta] = useState('')
	const [condicion, setCondicion] = useState('')
	const [alertaColor, setAlertaColor] = useState('')
	const [transformadores, setTransformadores] = useState([]);
	const [showSpinner, setShowSpinner] = useState(false)
	const [loadingTransfo, setLoadingTransfo] = useState(true)
	const [alertas, setAlertas] = useState([])
	const [alertasOriginales, setAlertasOriginales] = useState([])
	const [tiposAlerta, setTiposAlerta] = useState([])
	const [tiposAlertaOriginal, setTiposAlertaOriginal] = useState([])
	const [condicionesAlerta, setCondicionesAlerta] = useState([])
	const [condicionesAlertaOriginal, setCondicionesAlertaOriginal] = useState([])

	const [show, setShow] = useState(false)
	const [title, setTitle] = useState('')
	const [message, setMessage] = useState('')

	const handleCloseModal = () => { setShow(false) }

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
				const respond = await getAlertas(user.token)

				const tiposSet = new Set([])
				const condicionesSet = new Set([])

				respond.forEach(element => {
					tiposSet.add(element.alerta.color_alerta)
					condicionesSet.add(element.alerta.mensaje_condicion)
				})

				setAlertas(respond)
				setAlertasOriginales(respond)
				setTiposAlerta([...tiposSet])
				setTiposAlertaOriginal([...tiposSet])
				setCondicionesAlerta([...condicionesSet])
				setCondicionesAlertaOriginal([...condicionesSet])
				setShowSpinner(false)
			} catch (error) {
				logout.logOut()
			}
		}

		fetchTransformadores().then(()=> {})
		fetchData().then(()=>{})
	// eslint-disable-next-line react-hooks/exhaustive-deps
	}, [])

	const clear = (e) => {
		e.preventDefault()
		setIdTransfo('')
		setFechaDesde('')
		setFechaHasta('')
		setCondicion('')
		setAlertaColor('')
		setAlertas(alertasOriginales)
		setTiposAlerta(tiposAlertaOriginal)
		setCondicionesAlerta(condicionesAlertaOriginal)
	}


	const filterData = (e) => {
		e.preventDefault()
		setAlertas(alertasOriginales)

		const filteredAlertas = alertasOriginales.filter((alerta) => {

			const idMatch = alerta.medicion.transformadores.toString().includes(idTransfo)
			const tipoMatch = alerta.alerta.color_alerta.toString().includes(alertaColor)
			const condicionMAtch = alerta.alerta.mensaje_condicion.toString().includes(condicion)
			let fechaMatch

			if(fechaDesde === '' && fechaHasta === '') {
				fechaMatch = true
			}

			if(fechaDesde !== '' && fechaHasta === '') {
				fechaMatch = getDate(alerta.alerta.fecha_generacion) >= fechaDesde
			}

			if(fechaDesde === '' && fechaHasta !== '') {
				fechaMatch = getDate(alerta.alerta.fecha_generacion) <= fechaHasta
			}

			if(fechaDesde !== '' && fechaHasta !== '') {
				fechaMatch = getDate(alerta.alerta.fecha_generacion) <= fechaHasta && getDate(alerta.alerta.fecha_generacion) >= fechaDesde
			}
			return idMatch && fechaMatch && tipoMatch && condicionMAtch
		})

		// Actualizar el estado de alertas con los resultados filtrados
		setAlertas(filteredAlertas)
	}

	const getDate = (dateStr) => {
		const fecha = new Date(dateStr)

		const dia = fecha.getDate()
		const mes = fecha.getMonth() + 1
		const anio = fecha.getFullYear()

		return `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`
	}

	const viewRecomendation = (msj) => {
		setTitle('RECOMENDACIÓN')
		setMessage(msj)
		setShow(true)
	}

	// Función para descargar CSV
	const downloadCSV = () => {
		if (alertas.length === 0) {
			alert('No hay datos para descargar')
			return
		}

		// Crear encabezados del CSV
		const headers = ['# Medición', 'Transformador', 'Valor Medición', 'Tipo Alerta', 'Condición', 'Vida Útil', 'Recomendación', 'Fecha']

		// Crear filas con los datos filtrados
		const rows = alertas.map(alerta => {
			const transformador = transformadores.find(t => t.idtransformadores === alerta.medicion.transformadores)
			const transformadorNombre = transformador ? `${alerta.medicion.transformadores} - ${transformador.nombre}` : alerta.medicion.transformadores

			return [
				alerta.alerta.mediciones_transformadores,
				transformadorNombre,
				alerta.medicion.hi_ponderado,
				alerta.alerta.color_alerta,
				alerta.alerta.mensaje_condicion,
				alerta.alerta.vida_util_remanente,
				alerta.alerta.recomendacion,
				getDate(alerta.alerta.fecha_generacion)
			]
		})

		// Combinar encabezados y filas
		const csvContent = [
			headers.join(','),
			...rows.map(row => row.map(cell => `"${cell}"`).join(','))
		].join('\n')

		// Crear blob y descargar
		const blob = new Blob(['\ufeff' + csvContent], { type: 'text/csv;charset=utf-8;' })
		const link = document.createElement('a')
		const url = URL.createObjectURL(blob)

		link.setAttribute('href', url)
		link.setAttribute('download', `alertas_transformadores_${new Date().toISOString().split('T')[0]}.csv`)
		link.style.visibility = 'hidden'

		document.body.appendChild(link)
		link.click()
		document.body.removeChild(link)
	}

	return (
		<div className='dash'>
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
								<Col xs={12} md={4}>
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
								<Col xs={12} md={4}>
									<Col xs={12}>
										<LabelForm>Tipo Alerta</LabelForm>
									</Col>
									<Col xs={12}>
										<StyledFormSelect
											aria-label="Default select example"
											value={alertaColor}
											name='alertaColor'
											placeholder='Transformador'
											onChange={({ target }) => setAlertaColor(target.value)}
										>
											<option value=""></option>
											{loadingTransfo ? (
												<option disabled>Cargando...</option>
											) : (
												tiposAlerta.map((item) => (
													<option key={item} value={item}>
														{item}
													</option>
												))
											)}
										</StyledFormSelect>
									</Col>
								</Col>
								<Col xs={12} md={4}>
									<Col xs={12}>
										<LabelForm>Condición del Transformador</LabelForm>
									</Col>
									<Col xs={12}>
										<StyledFormSelect
											aria-label="Default select example"
											value={condicion}
											name='condicion'
											placeholder='Transformador'
											onChange={({ target }) => setCondicion(target.value)}
										>
											<option value=""></option>
											{loadingTransfo ? (
												<option disabled>Cargando...</option>
											) : (
												condicionesAlerta.map((item) => (
													<option key={item} value={item}>
														{item}
													</option>
												))
											)}
										</StyledFormSelect>
									</Col>
								</Col>
							</Row>
							<Row xs={12}>
								<Col xs={12} md={3}>
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
								<Col xs={12} md={3}>
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
								<ButtonBox xs={12} md={2}>
									<PButton>
										Filtrar
									</PButton>
								</ButtonBox>
								<ButtonBox xs={12} md={2}>
									<PButton type="button" onClick={downloadCSV}>
										<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '5px'}}>
											<path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
											<polyline points="7 10 12 15 17 10"></polyline>
											<line x1="12" y1="15" x2="12" y2="3"></line>
										</svg>
										CSV
									</PButton>
								</ButtonBox>
							</Row>
						</StyledForm>
						<Table responsive="sm">
							<thead>
								<tr>
									<StyledTH># Medición</StyledTH>
									<StyledTH>Transformador</StyledTH>
									<StyledTH>Valor Medición</StyledTH>
									<StyledTH>Tipo Alerta</StyledTH>
									<StyledTH>Condicion</StyledTH>
									<StyledTH>Vida Util</StyledTH>
									<StyledTH>Recomendación</StyledTH>
									<StyledTH>Fecha</StyledTH>
								</tr>
							</thead>
							<tbody>
								{
									alertas.map((alerta, key) => {
										return (
											<tr id={key} key={key}>
												<StyledTD>
													{alerta.alerta.mediciones_transformadores}
												</StyledTD>
												<StyledTD>
													{alerta.medicion.transformadores} - 
													{(() => {
														const transformador = transformadores.find(t => t.idtransformadores === alerta.medicion.transformadores)
														return transformador ? transformador.nombre : 'No disponible'
													})()}
												</StyledTD>
												<StyledTD>
													{alerta.medicion.hi_ponderado}
												</StyledTD>
												<StyledTD>
													{
														alerta.alerta.color_alerta === 'Verde' ?
															<PEstadoApproved>{alerta.alerta.color_alerta}</PEstadoApproved>
															:
															alerta.alerta.color_alerta === 'Rojo' ?
																<PEstadoRejected>{alerta.alerta.color_alerta}</PEstadoRejected>
																:
																alerta.alerta.color_alerta === 'Amarillo' ?
																	<PEstadoSupervision>{alerta.alerta.color_alerta}</PEstadoSupervision>
																	:
																	alerta.alerta.color_alerta === 'Azul' ?
																		<PEstadoBueno>{alerta.alerta.color_alerta}</PEstadoBueno>
																		:
																		alerta.alerta.color_alerta === 'Naranja' ?
																			<PEstadoPobre>{alerta.alerta.color_alerta}</PEstadoPobre>
																			:
																			(
																				<></>
																			)
													}
												</StyledTD>
												<StyledTD>
													{alerta.alerta.mensaje_condicion}
												</StyledTD>
												<StyledTD>
													{alerta.alerta.vida_util_remanente}
												</StyledTD>
												<StyledTD>
													<button
														onClick={() => viewRecomendation(alerta.alerta.recomendacion)}
														style={{background: 'none', border: 'none', cursor: 'pointer', padding: 0}}
														aria-label="Ver recomendación"
													>
														<svg xmlns="http://www.w3.org/2000/svg" width="27" height="20" viewBox="0 0 27 20" fill="none">
															<path d="M25.9154 9.70601C23.1415 3.8626 18.9484 0.921875 13.3273 0.921875C7.7034 0.921875 3.51323 3.8626 0.739294 9.70893C0.513985 10.183 0.513985 10.7389 0.739294 11.2159C3.51323 17.0593 7.70632 20 13.3273 20C18.9513 20 23.1415 17.0593 25.9154 11.2129C26.1407 10.7389 26.1407 10.1888 25.9154 9.70601ZM13.3273 17.8932C8.60756 17.8932 5.15184 15.4997 2.71441 10.4609C5.15184 5.42221 8.60756 3.02866 13.3273 3.02866C18.0471 3.02866 21.5028 5.42221 23.9403 10.4609C21.5058 15.4997 18.0501 17.8932 13.3273 17.8932Z" fill="#99ABB4" />
															<path d="M13.2105 5.31104C10.3663 5.31104 8.06055 7.6168 8.06055 10.461C8.06055 13.3051 10.3663 15.6109 13.2105 15.6109C16.0546 15.6109 18.3604 13.3051 18.3604 10.461C18.3604 7.6168 16.0546 5.31104 13.2105 5.31104ZM13.2105 13.7382C11.3992 13.7382 9.93325 12.2722 9.93325 10.461C9.93325 8.64971 11.3992 7.18373 13.2105 7.18373C15.0217 7.18373 16.4877 8.64971 16.4877 10.461C16.4877 12.2722 15.0217 13.7382 13.2105 13.7382Z" fill="#99ABB4" />
														</svg>
													</button>
												</StyledTD>
												<StyledTD>
													{getDate(alerta.alerta.fecha_generacion)}
												</StyledTD>
											</tr>
										)
									})
								}
							</tbody>
						</Table>
					</Container>
				</Col>
				<CancelAceptModal
					showModal={show}
					handleCloseModal={handleCloseModal}
					title={title}
					message={message}
					handleConfirmSubmit={handleCloseModal}
					subTitle={''}
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
		</div>
	)
}