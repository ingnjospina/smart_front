import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Table } from 'react-bootstrap'
import { ButtonBox, ButtonCreate, DivForm, PTitleFilter, PButton, StyledForm, SButton, StyledTD, StyledTH, StyledFormSelect, InputForm, LabelForm } from '../tools/styleContent'
import { getAll } from '../../services/request.services'
import { ModalActions } from '../modals/modalActions'
import { ModalProvider } from '../modals/modalProvider'
import { Spinner } from '../tools/spinner'
import { UseRefreshToken } from '../../hooks/useRefreshToken'
//import { UseLogout } from '../../hooks/useLogout'

export const FilterRequest = () => {

	//const logout = UseLogout()
	const refreshToken = UseRefreshToken()
	const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
	const [ticket, setTicket] = useState('')
	const [estado, setEstado] = useState('')
	const [tipo, setTipo] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)
	const [request, setRequest] = useState([])
	const [originalRequest, setOriginalRequest] = useState([])
	const [type/* , setType */] = useState('')
	const [show, setShow] = useState(false)
	const [refresh, setRefresh] = useState(false)
	const [showActions, setShowActions] = useState(false)
	const [idView, setIdView] = useState('')
	const [clicked, setClicked] = useState(false)
	const [nameProvider, setNameProvider] = useState('')
	const [idProvider/* , setIdProvider */] = useState(false)

	useEffect(() => {
		const fetchData = async () => {
			try {
				setShowSpinner(true)
				const respond = await getAll(user.idUsuario, user.token)
				console.log(respond)
				await refreshToken.refreshToken(respond)
				setRequest(respond.data)
				setOriginalRequest(respond.data)
				setShowSpinner(false)
			} catch (error) {
				console.log(error)
				//logout.logOut()
			}
		}

		fetchData()
	}, [refresh])

	const handleCloseModal = () => { setShow(false) }
	const handleCloseModalActions = () => { setShowActions(false) }

	const formatInput = (str) => {
		const currentValue = str.replace(/[^0-9]/g, '')

		setTicket(currentValue)
	}

	const getDate = (dateStr) => {
		const fecha = new Date(dateStr)

		const dia = fecha.getDate()
		const mes = fecha.getMonth() + 1
		const anio = fecha.getFullYear()

		return `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`
	}

	const clear = (e) => {
		e.preventDefault()
		setTicket('')
		setEstado('')
		setTipo('')
		setRequest(originalRequest)
	}

	const filterData = (e) => {
		e.preventDefault()
		setRequest(originalRequest)

		const filteredRequest = originalRequest.filter((req) => {

			const ticketMatch = req.ticket.toString().includes(ticket)
			const estadoMatch = req.estado.toLowerCase().includes(estado.toLowerCase())
			const tipoMatch = req.tipo.toLowerCase().includes(tipo.toLowerCase())

			return ticketMatch && estadoMatch && tipoMatch
		})

		setRequest(filteredRequest)
	}

	const viewProvider = (idProvider, provider) => {
		setIdView(idProvider)
		setShowActions(true)
		setClicked(true)
		setNameProvider(provider)
	}

	const updateClicked = (val) => {
		setClicked(val)
	}

	const handleConfirmSubmit = (text) => {
		if (text === 'Acept') {
			setRefresh(!refresh)
		}
	}


	return (
		<DivForm >
			<Col xs={12} className={'formBackground'}>
				<Container>
					<PTitleFilter>
						<svg xmlns="http://www.w3.org/2000/svg" width="34" height="39" viewBox="0 0 34 39" fill="none">
							<g filter="url(#filter0_d_1354_1385)">
								<path d="M26.9909 23.7137C26.9909 21.0773 24.836 18.9357 22.1963 18.9557C19.6098 18.9756 17.4948 21.0873 17.4749 23.6771C17.4549 26.3168 19.5965 28.4717 22.2329 28.4717C23.1127 28.4717 23.9362 28.2326 24.6434 27.8143L25.759 28.9797C26.0745 29.3117 26.6024 29.3217 26.9311 29.0062C27.2631 28.6908 27.2731 28.1629 26.9577 27.8342L25.9051 26.7352C26.5825 25.9117 26.9909 24.8592 26.9909 23.7137ZM22.2329 26.8082C20.5262 26.8082 19.135 25.4203 19.135 23.7104C19.135 22.0004 20.5229 20.6125 22.2329 20.6125C23.9395 20.6125 25.3307 22.0004 25.3307 23.7104C25.3307 25.4203 23.9395 26.8082 22.2329 26.8082ZM23.6805 14.709C23.6805 14.1412 23.2456 13.6797 22.711 13.6797H10.6715C10.137 13.6797 9.702 14.1412 9.702 14.709C9.702 15.2768 10.137 15.7383 10.6715 15.7383H22.711C23.2389 15.7383 23.6739 15.2768 23.6805 14.709ZM10.6583 17.5943C10.1237 17.5943 9.68872 18.0559 9.68872 18.6236C9.68872 19.1914 10.1237 19.6529 10.6583 19.6529H15.4096C15.9409 19.6529 16.3758 19.1914 16.3791 18.6236C16.3791 18.0559 15.9442 17.5943 15.4096 17.5943H10.6583ZM22.711 9.44629H10.6715C10.137 9.44629 9.702 9.90781 9.702 10.4756C9.702 11.0434 10.137 11.5049 10.6715 11.5049H22.711C23.2422 11.5049 23.6772 11.0434 23.6805 10.4756C23.6805 9.90781 23.2456 9.44629 22.711 9.44629Z" fill="#E40613" />
								<path d="M17.3088 28.2725H7.58364C7.58364 28.2725 7.58032 28.2691 7.58032 28.2725V5.66445C7.58032 5.66445 7.58364 5.66113 7.58032 5.66113H26.4032C26.4032 5.66113 26.4065 5.66445 26.4065 5.66113V17.498C26.4065 18.0492 26.8514 18.4941 27.4026 18.4941C27.9538 18.4941 28.3987 18.0492 28.3987 17.498V5.66113C28.3987 4.56211 27.5055 3.66895 26.4065 3.66895H7.58032C6.4813 3.66895 5.58813 4.56211 5.58813 5.66113V28.2725C5.58813 29.3715 6.4813 30.2646 7.58032 30.2646H17.3088C17.86 30.2646 18.3049 29.8197 18.3049 29.2686C18.3049 28.7174 17.86 28.2725 17.3088 28.2725Z" fill="#E40613" />
							</g>
							<defs>
								<filter id="filter0_d_1354_1385" x="-4" y="0" width="42" height="42" filterUnits="userSpaceOnUse" colorInterpolationFilters="sRGB">
									<feFlood floodOpacity="0" result="BackgroundImageFix" />
									<feColorMatrix in="SourceAlpha" type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0" result="hardAlpha" />
									<feOffset dy="4" />
									<feGaussianBlur stdDeviation="2" />
									<feComposite in2="hardAlpha" operator="out" />
									<feColorMatrix type="matrix" values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.25 0" />
									<feBlend mode="normal" in2="BackgroundImageFix" result="effect1_dropShadow_1354_1385" />
									<feBlend mode="normal" in="SourceGraphic" in2="effect1_dropShadow_1354_1385" result="shape" />
								</filter>
							</defs>
						</svg>
						Solicitudes y Reportes
					</PTitleFilter>
					<StyledForm onSubmit={filterData}>
						<Row xs={12}>
							<Col xs={12} md={2}>
								<Col xs={12}>
									<LabelForm>
										Ticket
									</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={ticket}
										name='ticket'
										placeholder=''
										onChange={({ target }) => formatInput(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={12} md={3}>
								<Col xs={12}>
									<LabelForm>
										Estado
									</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={estado}
										name='estado'
										placeholder='Tipo'
										onChange={({ target }) => setEstado(target.value)}
									>
										<option></option>
										<option value="RECHAZADO">Rechazado</option>
										<option value="APROBADO">Aprobado</option>
										<option value="SUPSUPERVISION">Supervición</option>
									</StyledFormSelect>
								</Col>
							</Col>
							<Col xs={12} md={3}>
								<Col xs={12}>
									<LabelForm>
										Tipo
									</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={tipo}
										name='tipo'
										placeholder='Tipo'
										onChange={({ target }) => setTipo(target.value)}
									>
										<option></option>
										<option value="report">Reporte</option>
										<option value="request">Solicitud</option>
									</StyledFormSelect>
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
					</ButtonCreate>
					<Table responsive="sm">
						<thead>
							<tr>
								<StyledTH>N° Ticket</StyledTH>
								<StyledTH>Estado</StyledTH>
								<StyledTH>Fecha Ingreso</StyledTH>
								<StyledTH>Etapa</StyledTH>
								<StyledTH>Tipo</StyledTH>
								<StyledTH>Detalles</StyledTH>
								<StyledTH>Prioridad</StyledTH>
							</tr>
						</thead>
						<tbody>
							{
								request.map((req, key) => {
									return (
										<tr id={key} key={key}>
											<StyledTD>
												{req.ticket}
											</StyledTD>
											<StyledTD>
												{req.estado}
											</StyledTD>
											<StyledTD>
												{getDate(req.fechaCreacion)}
											</StyledTD>
											<StyledTD>
												{req.etapa}
											</StyledTD>
											<StyledTD>
												{
													req.tipo === 'request' ? 'Solicitud' : 'Reporte'
												}
											</StyledTD>
											<StyledTD>
												<a href='#' onClick={() => viewProvider(req.idProveedor, (req.empresa ? req.empresa : req.nombreTitular))}>
													<svg xmlns="http://www.w3.org/2000/svg" width="27" height="20" viewBox="0 0 27 20" fill="none">
														<path d="M25.9154 9.70601C23.1415 3.8626 18.9484 0.921875 13.3273 0.921875C7.7034 0.921875 3.51323 3.8626 0.739294 9.70893C0.513985 10.183 0.513985 10.7389 0.739294 11.2159C3.51323 17.0593 7.70632 20 13.3273 20C18.9513 20 23.1415 17.0593 25.9154 11.2129C26.1407 10.7389 26.1407 10.1888 25.9154 9.70601ZM13.3273 17.8932C8.60756 17.8932 5.15184 15.4997 2.71441 10.4609C5.15184 5.42221 8.60756 3.02866 13.3273 3.02866C18.0471 3.02866 21.5028 5.42221 23.9403 10.4609C21.5058 15.4997 18.0501 17.8932 13.3273 17.8932Z" fill="#99ABB4" />
														<path d="M13.2105 5.31104C10.3663 5.31104 8.06055 7.6168 8.06055 10.461C8.06055 13.3051 10.3663 15.6109 13.2105 15.6109C16.0546 15.6109 18.3604 13.3051 18.3604 10.461C18.3604 7.6168 16.0546 5.31104 13.2105 5.31104ZM13.2105 13.7382C11.3992 13.7382 9.93325 12.2722 9.93325 10.461C9.93325 8.64971 11.3992 7.18373 13.2105 7.18373C15.0217 7.18373 16.4877 8.64971 16.4877 10.461C16.4877 12.2722 15.0217 13.7382 13.2105 13.7382Z" fill="#99ABB4" />
													</svg>
												</a>
											</StyledTD>
											<StyledTD>
												{req.urgencia}
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
				idProvider={idProvider.toString()}
			/>

			<ModalActions
				showModal={showActions}
				handleCloseModal={handleCloseModalActions}
				idProvider={idView.toString()}
				nameProvider={nameProvider}
				clicked={clicked}
				updateClicked={updateClicked}
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