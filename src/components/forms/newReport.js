import '../../styles/spinner.css'
import React, { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { createReport } from '../../services/report.services'
import { DivForm, InputForm, LabelForm, PButton, SButton, StyledForm, StyledFormSelect, StyledTH, StyledTD } from '../tools/styleContent'
import { DropZone } from '../tools/dropZone'
import { Alert, Container, Form, Table } from 'react-bootstrap'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { Spinner } from '../tools/spinner'
import { useNavigate } from 'react-router-dom'
import { useUser } from '../../hooks/useUser'
import { UseLogout } from '../../hooks/useLogout'
import { UseRefreshToken } from '../../hooks/useRefreshToken'

export const NewReport = () => {
	const user = useUser()
	const nav = useNavigate()
	const logout = UseLogout()
	const refreshToken = UseRefreshToken()

	const [edificio, setEdificio] = useState('')
	const [ubicacion, setUbicacion] = useState('')
	const [descripcionLugar, setDescripcionLugar] = useState('')
	const [tipoDanio, setTipoDanio] = useState('')
	const [tipoReporte, setTipoReporte] = useState('')
	const [descripcionDanio, setDescripcionDanio] = useState('')
	const [listState, setList] = useState([])
	const [formError, setFormError] = useState(false)
	const [show, setShow] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const [title, setTitle] = useState('')
	const [subTitle, setSubTitle] = useState('')
	const [message, setMessage] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)

	const handleCloseModal = () => { setShow(false) }

	const createReq = async (event) => {
		setShowSpinner(true)
		event.preventDefault()
		if (!edificio || !ubicacion || !descripcionLugar || !tipoDanio || !descripcionDanio || listState.length === 0) {
			setShowAlert(true)
			setFormError(true)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			setShowSpinner(false)
			return
		}

		try {
			const respond = await createReport(user.user.token, user.user.idUsuario, edificio, ubicacion, descripcionLugar, tipoDanio, descripcionDanio, listState, tipoReporte)
			setTitle('Reporte Realizado')
			setSubTitle('EL ticket asignado a tu report es:')
			await refreshToken.refreshToken(respond)
			setMessage(respond.ticket)
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
		setList((prevList) => [...prevList, ...list])
	}

	const deleteFile = (key, e) => {
		e.preventDefault()
		const updatedList = listState.filter((file, index) => index !== key)
		setList(updatedList)
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
							<Col xs={12} md={6} className={`${!edificio && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Seleccione un Edificio</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={edificio}
										name='edificio'
										placeholder='Edificio'
										onChange={({ target }) => setEdificio(target.value)}
									>
										<option></option>
										<option value="Principe">Principe</option>
										<option value="Victoria">Victoria</option>
										<option value="Villa Campestre">Villa Campestre</option>
									</StyledFormSelect>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${!ubicacion && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Escribe la Ubicación</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={ubicacion}
										name='ubicacion'
										placeholder='EJ: salón8 o pasillo'
										onChange={({ target }) => setUbicacion(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} className={`${!descripcionLugar && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Descripción detallada del lugar</LabelForm>
								</Col>
								<Col xs={12}>
									<Form.Control
										as="textarea"
										rows={3}
										value={descripcionLugar}
										name='descripcionLugar'
										placeholder='Descripcion del lugar'
										onChange={({ target }) => setDescripcionLugar(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} md={6} className={`${!tipoDanio && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Tipo de Daño</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={tipoDanio}
										name='tipoDanio'
										placeholder='Tipo de Daño'
										onChange={({ target }) => setTipoDanio(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${!tipoReporte && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Tipo de reporte</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={tipoReporte}
										name='tipoReporte'
										placeholder='Tipo'
										onChange={({ target }) => setTipoReporte(target.value)}
									>
										<option></option>
										<option value="INFRAESTRUCTURA">Infraestructura</option>
										<option value="MANTENIMIENTO">Mantenimiento</option>
									</StyledFormSelect>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} className={`${!descripcionDanio && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Descripción detallada del daño</LabelForm>
								</Col>
								<Col xs={12}>
									<Form.Control
										as="textarea"
										rows={3}
										value={descripcionDanio}
										name='descripcionDanio'
										placeholder='Descripcion del daño'
										onChange={({ target }) => setDescripcionDanio(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<DropZone loadFile={loadFile} type={'image/*'} />
						</Row>
						<Row xs={12}>
							<Table responsive="sm">
								<thead>
									<tr>
										<StyledTH>Nombre</StyledTH>
										<StyledTH>Tamaño</StyledTH>
										<StyledTH>Acción</StyledTH>
									</tr>
								</thead>
								<tbody>
									{
										listState.map((file, key) => {
											return (
												<tr id={key} key={key}>
													<StyledTD>{file.name}</StyledTD>
													<StyledTD>{Math.ceil(file.size / 1024 / 1024)}MB</StyledTD>
													<StyledTD>
														<a href='' onClick={() => deleteFile(key, event)}>
															<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" key={key}>
																<path d="M3.75 6.00004H2.25C2.05109 6.00004 1.86032 5.92102 1.71967 5.78036C1.57902 5.63971 1.5 5.44895 1.5 5.25004C1.5 5.05112 1.57902 4.86036 1.71967 4.71971C1.86032 4.57905 2.05109 4.50004 2.25 4.50004H8.25V2.24854C8.25 2.04962 8.32902 1.85886 8.46967 1.71821C8.61032 1.57755 8.80109 1.49854 9 1.49854H15C15.1989 1.49854 15.3897 1.57755 15.5303 1.71821C15.671 1.85886 15.75 2.04962 15.75 2.24854V4.50004H21.75C21.9489 4.50004 22.1397 4.57905 22.2803 4.71971C22.421 4.86036 22.5 5.05112 22.5 5.25004C22.5 5.44895 22.421 5.63971 22.2803 5.78036C22.1397 5.92102 21.9489 6.00004 21.75 6.00004H20.25V21.75C20.25 21.9489 20.171 22.1397 20.0303 22.2804C19.8897 22.421 19.6989 22.5 19.5 22.5H4.5C4.30109 22.5 4.11032 22.421 3.96967 22.2804C3.82902 22.1397 3.75 21.9489 3.75 21.75V6.00004ZM14.25 4.50004V3.00004H9.75V4.50004H14.25ZM5.25 21H18.75V6.00004H5.25V21ZM9.75 18C9.55109 18 9.36032 17.921 9.21967 17.7804C9.07902 17.6397 9 17.4489 9 17.25V9.75004C9 9.55112 9.07902 9.36036 9.21967 9.21971C9.36032 9.07905 9.55109 9.00004 9.75 9.00004C9.94891 9.00004 10.1397 9.07905 10.2803 9.21971C10.421 9.36036 10.5 9.55112 10.5 9.75004V17.25C10.5 17.4489 10.421 17.6397 10.2803 17.7804C10.1397 17.921 9.94891 18 9.75 18ZM14.25 18C14.0511 18 13.8603 17.921 13.7197 17.7804C13.579 17.6397 13.5 17.4489 13.5 17.25V9.75004C13.5 9.55112 13.579 9.36036 13.7197 9.21971C13.8603 9.07905 14.0511 9.00004 14.25 9.00004C14.4489 9.00004 14.6397 9.07905 14.7803 9.21971C14.921 9.36036 15 9.55112 15 9.75004V17.25C15 17.4489 14.921 17.6397 14.7803 17.7804C14.6397 17.921 14.4489 18 14.25 18Z" fill="#E40613" />
															</svg>
														</a>
													</StyledTD>
												</tr>
											)
										})
									}
								</tbody>
							</Table>
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