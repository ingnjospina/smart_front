import '../../styles/spinner.css'
import React, { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { createRequest } from '../../services/request.services'
import { DivForm, InputForm, LabelForm, PButton, PButton2, SButton, StyledForm, StyledFormSelect, TitleReport } from '../tools/styleContent'
import { DropZone } from '../tools/dropZone'
import { Alert, Container, Form } from 'react-bootstrap'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { Spinner } from '../tools/spinner'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { UseLogout } from '../../hooks/useLogout'
import { UseRefreshToken } from '../../hooks/useRefreshToken'

export const NewRequest = () => {
	const user = useUser()
	const nav = useNavigate()
	const logout = UseLogout()
	const refreshToken = UseRefreshToken()

	const [tipo, setTipo] = useState('')
	const [productoSolicitado, setProductoSolicitado] = useState('')
	const [descripcionSolicitud, setDescripcionSolicitud] = useState('')
	const [fechaEntrega, setFechaEntrega] = useState('')
	const [urgencia, setUrgencia] = useState('')
	const [especificaciones, setEspecificaciones] = useState('')
	const [listLink, setList] = useState([])
	const [newLink, setNewLink] = useState([])
	const [formError, setFormError] = useState(false)
	const [show, setShow] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const [title, setTitle] = useState('')
	const [subTitle, setSubTitle] = useState('')
	const [message, setMessage] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)
	const [doc, setDoc] = useState([])

	const handleCloseModal = () => { setShow(false) }

	const createReq = async (event) => {
		setShowSpinner(true)
		event.preventDefault()
		if (!tipo || !productoSolicitado || !descripcionSolicitud || !fechaEntrega || !urgencia || !especificaciones || listLink.length === 0) {
			setShowAlert(true)
			setFormError(true)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			setShowSpinner(false)
			return
		}

		try {
			const respond = await createRequest(
				user.user.token,
				user.user.idUsuario,
				tipo,
				productoSolicitado,
				descripcionSolicitud,
				fechaEntrega,
				urgencia,
				especificaciones,
				listLink,
				doc
			)
			setTitle('Solicitud Realizada')
			setSubTitle('EL ticket asignado a tu report es:')
			setMessage(respond.ticket)
			await refreshToken.refreshToken(respond)
		}
		catch (e) {
			setTitle('Error')
			setSubTitle('')
			if (e.response?.data?.error?.name === 'TokenExpiredError') {
				logout.logOut()
			}
			setMessage('No puedes realizar esta acción.')
		}
		setShow(true)
		setShowSpinner(false)
	}

	const loadFile = (list) => {
		setDoc((prevList) => [...prevList, ...list])
	}

	const addLink = () => {
		setList((prevList) => [...prevList, newLink])
		setNewLink('')
	}

	const showCancelModal = (event) => {
		event.preventDefault()
		setShow(true)
		setTitle('Cancelar Reporte')
		setSubTitle('')
		setMessage('¿Estás seguro de que deseas cancelar el reporte?')
	}

	const handleConfirmSubmit = (text) => {
		if (text === 'Cancel') {
			nav('/')
		}

		if (text === 'Acept') {
			window.location.reload()
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const deleteDoc = () => {
		setDoc([])
	}

	return (
		<DivForm className='newReportContent'>
			<Col xs={12} className={'formBackground'}>
				<Container>
					<StyledForm onSubmit={createReq}>
						{
							showAlert ? (
								<Alert
									variant="danger"
									onClose={() => setShowAlert(false)}
									dismissible
									className='alert-center'
								>
									<p>
										Por favor diligencie todos los campos del formulario.
									</p>
								</Alert>
							) :
								(<></>)
						}
						<Row xs={12}>
							<Col xs={12} md={6} className={`${!tipo && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Tipo de Solicitud</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={tipo}
										name='tipo'
										placeholder='tipo'
										onChange={({ target }) => setTipo(target.value)}
									>
										<option></option>
										<option value="BIENES">Bienes</option>
										<option value="SERVICIOS">Servicios</option>
									</StyledFormSelect>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${!productoSolicitado && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Bien o servicio a solicitar</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={productoSolicitado}
										name='productoSolicitado'
										placeholder=''
										onChange={({ target }) => setProductoSolicitado(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} className={`${!descripcionSolicitud && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Descripción detallada de la solicitud</LabelForm>
								</Col>
								<Col xs={12}>
									<Form.Control
										as="textarea"
										rows={3}
										value={descripcionSolicitud}
										name='descripcionSolicitud'
										placeholder=''
										onChange={({ target }) => setDescripcionSolicitud(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} md={6} className={`${!fechaEntrega && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Fecha de entrega</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='date'
										value={fechaEntrega}
										name='fechaEntrega'
										placeholder=''
										onChange={({ target }) => setFechaEntrega(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${!urgencia && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Urgencia</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={urgencia}
										name='urgencia'
										placeholder='Tipo'
										onChange={({ target }) => setUrgencia(target.value)}
									>
										<option></option>
										<option value="URGENTE">Urgente</option>
										<option value="NOURGENTE">No Urgente</option>
									</StyledFormSelect>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} className={`${!especificaciones && formError && tipo === 'BIENES' ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Especificaciones adiocionale (refernncias en caso de ser un bien)</LabelForm>
								</Col>
								<Col xs={12}>
									<Form.Control
										as="textarea"
										rows={3}
										value={especificaciones}
										name='descripcionDanio'
										placeholder=''
										onChange={({ target }) => setEspecificaciones(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} md={6}>
								<Col xs={12}>
									<LabelForm>Agrega imagen de ejemplo o ficha tecnica (Opcional)</LabelForm>
								</Col>
								{
									doc.length > 0 ? (
										<>
											<TitleReport>Ya cargaste documento</TitleReport>
											<SButton onClick={deleteDoc}>
												<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
													<path d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="#E40613" />
												</svg>
											</SButton>
										</>
									) : (
										<Col xs={12}>
											<DropZone loadFile={loadFile} type={'image/*'} />
										</Col>
									)
								}
							</Col>
							<Col xs={12} md={6}>
								<Row xs={12} className={`${!listLink.length === 0 && formError ? 'errorForm' : ''}`}>
									<Col xs={12}>
										<LabelForm>Link de producto</LabelForm>
									</Col>
									{
										listLink.map((link, index) => {
											console.log(link)
											return (
												<a href={link} key={index}>
													{link}
												</a>
											)
										})
									}
									<Col xs={12}>
										<InputForm
											type='text'
											value={newLink}
											name='newLink'
											placeholder=''
											onChange={({ target }) => setNewLink(target.value)}
										/>
									</Col>
									<Col xs={12} >
										<PButton2 type="button" onClick={addLink}>Agregar</PButton2>
									</Col>
								</Row>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={0} lg={3}>
							</Col>
							<Col xs={12} lg={3}>
								<SButton onClick={showCancelModal}>Cancelar</SButton>
							</Col>
							<Col xs={12} lg={3}>
								<PButton>Enviar</PButton>
							</Col>
							<Col xs={0} lg={3}>
							</Col>
						</Row>
					</StyledForm>
				</Container>
			</Col>
			<CancelAceptModal
				showModal={show}
				handleCloseModal={handleCloseModal}
				title={title}
				message={message}
				handleConfirmSubmit={handleConfirmSubmit}
				subTitle={subTitle}
			/>
			{
				showSpinner ? (
					<div className='divSpinner'>
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