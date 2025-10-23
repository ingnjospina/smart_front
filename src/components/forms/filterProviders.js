import React, { useEffect, useState } from 'react'
import { Col, Container, Row, Table } from 'react-bootstrap'
import { ButtonBox, ButtonCreate, DivForm, PTitleFilter, PButton, StyledForm, SButton, StyledTD, StyledTH, InputForm, LabelForm } from '../tools/styleContent'
import { getProvider } from '../../services/provider.services'
import { ModalActions } from '../modals/modalActions'
import { ModalProvider } from '../modals/modalProvider'
import { Spinner } from '../tools/spinner'
import { UseRefreshToken } from '../../hooks/useRefreshToken'
import { UseLogout } from '../../hooks/useLogout'

export const FilterProviders = () => {

	const logout = UseLogout()
	const refreshToken = UseRefreshToken()
	const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
	const [id, setId] = useState('')
	const [nombre, setNombre] = useState('')
	const [fecha, setFecha] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)
	const [proveedores, setProveedores] = useState([])
	const [originalProveedores, setOriginalProveedores] = useState([])
	const [type, setType] = useState('')
	const [show, setShow] = useState(false)
	const [refresh, setRefresh] = useState(false)
	const [showActions, setShowActions] = useState(false)
	const [ idView, setIdView] = useState('')
	const [clicked, setClicked] = useState(false)
	const [nameProvider, setNameProvider] = useState('')
	const [idProvider, setIdProvider] = useState(false)

	useEffect(() => {
		const fetchData = async () => {
			try {
				setShowSpinner(true)
				const respond = await getProvider(user.idUsuario, user.token)
				await refreshToken.refreshToken(respond)
				setProveedores(respond.proveedores)
				setOriginalProveedores(respond.proveedores)
				setShowSpinner(false)
			} catch (error) {
				logout.logOut()
			}
		}

		fetchData()
	}, [refresh])

	const handleCloseModal = () => { setShow(false) }
	const handleCloseModalActions = () => { setShowActions(false) } 

	const formatInput = (str) => {
		const currentValue = str.replace(/[^0-9]/g, '')

		setId(currentValue)
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
		setId('')
		setNombre('')
		setFecha('')
		setProveedores(originalProveedores)
	}

	const filterData = (e) => {
		e.preventDefault()
		setProveedores(originalProveedores)

		const filteredProveedores = originalProveedores.filter((proveedor) => {

			const idMatch = proveedor.idProveedor.toString().includes(id)
			const nombreMatch = proveedor.nombreTitular.toLowerCase().includes(nombre.toLowerCase())
			const fechaMatch = fecha === '' || getDate(proveedor.fechaInicioContrato) === fecha

			return idMatch && nombreMatch && fechaMatch
		})

		// Actualizar el estado de proveedores con los resultados filtrados
		setProveedores(filteredProveedores)
	}

	const newProvider = (e) => {
		e.preventDefault()
		setType('Crear')
		setShow(true)
		setIdProvider('')
	}

	const editProvider = (e, idProvider) => {
		e.preventDefault()
		setType('Editar')
		setShow(true)
		setIdProvider(idProvider)
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
						Proveedores registrados
					</PTitleFilter>
					<StyledForm onSubmit={filterData}>
						<Row xs={12}>
							<Col xs={12} md={2}>
								<Col xs={12}>
									<LabelForm>
										Nit o CC
									</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={id}
										name='id'
										placeholder=''
										onChange={({ target }) => formatInput(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={12} md={3}>
								<Col xs={12}>
									<LabelForm>
										Nombre
									</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={nombre}
										name='nombre'
										placeholder=''
										onChange={({ target }) => setNombre(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={12} md={3}>
								<Col xs={12}>
									<LabelForm>
										Fecha de Ingreso
									</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='date'
										value={fecha}
										name='fecha'
										placeholder=''
										onChange={({ target }) => setFecha(target.value)}
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
							<PButton onClick={newProvider}>
								<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
									<g clipPath="url(#clip0_1567_367)">
										<path d="M9.6924 0.144043C6.90748 0.144043 4.67271 2.05666 4.67271 5.71204C4.67271 8.09912 5.62348 10.5305 7.06717 12.0287C7.63025 13.5268 6.61486 14.0844 6.4044 14.1637C3.49025 15.2327 0.0859375 17.1711 0.0859375 19.0967V19.8167C0.0859375 22.441 5.08348 23.0474 9.72009 23.0474C10.7307 23.0457 11.7409 23.0076 12.7487 22.933C11.4867 21.6009 10.7848 19.8349 10.7881 18C10.7881 16.3468 11.3512 14.832 12.2872 13.6154C12.1487 13.2905 12.0933 12.7782 12.3453 12C13.7807 10.5 14.7112 8.08989 14.7112 5.71112C14.7112 2.05666 12.4736 0.144966 9.69148 0.144966L9.6924 0.144043ZM18.0001 12.1727C16.4547 12.1727 14.9726 12.7866 13.8798 13.8793C12.7871 14.9721 12.1732 16.4542 12.1732 17.9996C12.1732 19.545 12.7871 21.0271 13.8798 22.1198C14.9726 23.2126 16.4547 23.8265 18.0001 23.8265C19.5455 23.8265 21.0276 23.2126 22.1203 22.1198C23.2131 21.0271 23.827 19.545 23.827 17.9996C23.827 16.4542 23.2131 14.9721 22.1203 13.8793C21.0276 12.7866 19.5455 12.1727 18.0001 12.1727ZM17.1924 14.7693H18.8078V17.1637H21.2022V18.8364H18.8078V21.2308H17.1924V18.8364H14.7693V17.1637H17.1924V14.7693Z" fill="white" />
									</g>
									<defs>
										<clipPath id="clip0_1567_367">
											<rect width="24" height="24" fill="white" />
										</clipPath>
									</defs>
								</svg>
								Nuevo Proveedor
							</PButton>
						</Col>
					</ButtonCreate>
					<Table responsive="sm">
						<thead>
							<tr>
								<StyledTH>Identificación</StyledTH>
								<StyledTH>Tipo</StyledTH>
								<StyledTH>Titular</StyledTH>
								<StyledTH>Empresa</StyledTH>
								<StyledTH>Ingreso</StyledTH>
								<StyledTH>Ver</StyledTH>
								<StyledTH>Editar</StyledTH>
							</tr>
						</thead>
						<tbody>
							{
								proveedores.map((proveedor, key) => {
									return (
										<tr id={key} key={key}>
											<StyledTD>
												{proveedor.idProveedor}
												{
													proveedor.digito ? '-' + proveedor.digito : ''
												}
											</StyledTD>
											<StyledTD>
												{proveedor.tipoProveedoor}
											</StyledTD>
											<StyledTD>
												{proveedor.nombreTitular}
											</StyledTD>
											<StyledTD>
												{proveedor.nombreEmpresa}
											</StyledTD>
											<StyledTD>
												{getDate(proveedor.fechaInicioContrato)}
											</StyledTD>
											<StyledTD>
												<a href='#' onClick={() => viewProvider(proveedor.idProveedor, (proveedor.empresa ? proveedor.empresa : proveedor.nombreTitular) )}>
													<svg xmlns="http://www.w3.org/2000/svg" width="27" height="20" viewBox="0 0 27 20" fill="none">
														<path d="M25.9154 9.70601C23.1415 3.8626 18.9484 0.921875 13.3273 0.921875C7.7034 0.921875 3.51323 3.8626 0.739294 9.70893C0.513985 10.183 0.513985 10.7389 0.739294 11.2159C3.51323 17.0593 7.70632 20 13.3273 20C18.9513 20 23.1415 17.0593 25.9154 11.2129C26.1407 10.7389 26.1407 10.1888 25.9154 9.70601ZM13.3273 17.8932C8.60756 17.8932 5.15184 15.4997 2.71441 10.4609C5.15184 5.42221 8.60756 3.02866 13.3273 3.02866C18.0471 3.02866 21.5028 5.42221 23.9403 10.4609C21.5058 15.4997 18.0501 17.8932 13.3273 17.8932Z" fill="#99ABB4" />
														<path d="M13.2105 5.31104C10.3663 5.31104 8.06055 7.6168 8.06055 10.461C8.06055 13.3051 10.3663 15.6109 13.2105 15.6109C16.0546 15.6109 18.3604 13.3051 18.3604 10.461C18.3604 7.6168 16.0546 5.31104 13.2105 5.31104ZM13.2105 13.7382C11.3992 13.7382 9.93325 12.2722 9.93325 10.461C9.93325 8.64971 11.3992 7.18373 13.2105 7.18373C15.0217 7.18373 16.4877 8.64971 16.4877 10.461C16.4877 12.2722 15.0217 13.7382 13.2105 13.7382Z" fill="#99ABB4" />
													</svg>
												</a>
											</StyledTD>
											<StyledTD>
												<a href='#' onClick={(event) => editProvider(event, JSON.stringify(proveedor))}>
													<svg xmlns="http://www.w3.org/2000/svg" width="26" height="26" viewBox="0 0 26 26" fill="none">
														<path d="M9.0971 14.2644C9.08195 14.2837 9.0668 14.304 9.06 14.3285L7.89074 18.6153C7.82256 18.8649 7.8924 19.1339 8.07716 19.3235C8.21536 19.4585 8.39744 19.5327 8.59138 19.5327C8.65542 19.5327 8.7196 19.525 8.78276 19.5082L13.0392 18.3473C13.046 18.3473 13.0493 18.3533 13.0545 18.3533C13.1034 18.3533 13.1514 18.3355 13.1877 18.2984L24.5696 6.9182C24.9076 6.57968 25.093 6.11854 25.093 5.61682C25.093 5.04833 24.8519 4.48007 24.4297 4.05894L23.3547 2.98231C22.9332 2.56007 22.3641 2.31851 21.7959 2.31851C21.2943 2.31851 20.8332 2.50395 20.4942 2.84162L9.11404 14.2249C9.10222 14.2357 9.10554 14.2518 9.0971 14.2644ZM23.4558 5.80366L22.3253 6.93335L20.4926 5.07153L21.6071 3.95699C21.7832 3.77992 22.1247 3.80575 22.327 4.00882L23.4027 5.08546C23.5149 5.19752 23.5789 5.34671 23.5789 5.49424C23.5782 5.61516 23.5351 5.72488 23.4558 5.80366ZM11.1213 14.4432L19.3343 6.2298L21.1679 8.09286L12.9702 16.2902L11.1213 14.4432ZM9.62493 17.7732L10.2184 15.5947L11.8016 17.178L9.62493 17.7732ZM23.5532 10.3134C23.1223 10.3134 22.7431 10.6637 22.7414 11.1004V21.7495C22.7414 22.3059 22.2896 22.7374 21.7323 22.7374H4.22569C3.66927 22.7374 3.25457 22.306 3.25457 21.7495V4.22398C3.25457 3.66716 3.66925 3.24793 4.22569 3.24793H16.2401C16.6734 3.24793 17.0249 2.86292 17.0249 2.42954C17.0249 1.99701 16.6734 1.62512 16.2401 1.62512H4.10596C2.74947 1.62512 1.62207 2.74779 1.62207 4.10509V21.8693C1.62207 23.2267 2.7495 24.3683 4.10596 24.3683H21.8511C23.2085 24.3683 24.3639 23.2267 24.3639 21.8693V11.0955C24.3622 10.6637 23.9839 10.3134 23.5532 10.3134Z" fill="#99ABB4" />
													</svg>
												</a>
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