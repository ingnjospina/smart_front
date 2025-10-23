import React, { useState } from 'react'
import { Alert } from 'react-bootstrap'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { Col, Container, Form,  Row   } from 'react-bootstrap'
import { DivForm, LabelForm, InputForm, PButton2, StyledForm, SButton2, StyledFormSelect } from '../tools/styleContent'
import { newAction } from '../../services/actions.services'
import { PropTypes } from 'prop-types'
import { Spinner } from '../tools/spinner'
import { useNavigate } from 'react-router'
import { UseRefreshToken } from '../../hooks/useRefreshToken'
import { useUser } from '../../hooks/useUser'

export const NewActionForm = (props) => {
	console.log(props.type)
	const user = useUser()
	const refreshToken = UseRefreshToken()
	const nav = useNavigate()

	const [showAlert, setShowAlert] = useState(false)
	const [formError, setFormError] = useState(false)
	const [showSpinner, setShowSpinner] = useState(false)
	const [accion, setAccion] = useState('')
	const [estado, setEstado] = useState('')
	const [descripcionAccion, setDescripcionAccion] = useState('')
	const [show, setShow] = useState(false)
	const [title, setTitle] = useState(false)
	const [subTitle, setSubTitle] = useState(false)
	const [message, setMessage] = useState(false)

	const handleCloseModal = () => { setShow(false) }

	const handleConfirmSubmit = (text) => {
		if (text === 'Cancel') {
			props.handleCloseModal()
		}

		if (text === 'Acept') {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			props.handleCloseModal()
			props.handleConfirm(text)
		}

		if (text === 'Error') {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			props.handleCloseModal()
			props.handleConfirm(text)
		}
	}

	const createAction = async (event) => {
		setShowSpinner(true)
		event.preventDefault()
		if (
			!accion || !estado || !descripcionAccion) {
			setShowAlert(true)
			setFormError(true)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			setShowSpinner(false)
			return
		}

		try {


			const respond = await newAction(
				user.user.token,
				user.user.idUsuario,
				accion,
				estado,
				descripcionAccion,
				props.type
			)
			setTitle('Tarea registrada')
			setMessage('')
			setSubTitle('El proveedor fue registrado correctamente')
			await refreshToken.refreshToken(respond)
			props.newActionR(respond.action)
		}

		catch (e) {
			console.log(e)
			setTitle('Error')
			setSubTitle('')
			console.log(e)
			if (e.response?.data?.error?.name === 'TokenExpiredError' || e.response?.data?.error?.name === 'JsonWebTokenError') {
				//logout.logOut()
				window.localStorage.removeItem('loggedAppUser')
				nav('/')
			}
			setMessage('No puedes realizar esta acción.')
		}
		setShow(true)
		setShowSpinner(false)
	}

	const showCancelModal = (event) => {
		event.preventDefault()
		setShow(true)
		setTitle('Cancelar Reporte')
		setSubTitle('')
		setMessage('¿Estás seguro de que deseas cancelar el registro?')
	}

	return (
		<DivForm className='newReportContent'>
			<Col xs={12} className={'formBackground'}>
				<Container>
					<StyledForm onSubmit={createAction}>
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
							<Col xs={12} md={6} className={`${!estado && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Estado de Tarea</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={estado}
										name='estado'
										placeholder='tipo'
										onChange={({ target }) => setEstado(target.value)}
									>
										<option></option>
										<option value="RECHAZADO">Rechazado</option>
										<option value="APROBADO">Aprobado</option>
										<option value="PENDIENTE">Pendiente</option>
									</StyledFormSelect>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${!accion && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Nombre de la Tarea</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={accion}
										name='accion'
										placeholder=''
										onChange={({ target }) => setAccion(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={12} md={12} className={`${!descripcionAccion && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Descripción de la Tarea</LabelForm>
								</Col>
								<Col xs={12}>
									<Form.Control
										as="textarea"
										rows={3}
										value={descripcionAccion}
										name='descripcionAccion'
										placeholder=''
										onChange={({ target }) => setDescripcionAccion(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={0} lg={1}>
							</Col>
							<Col xs={12} lg={5}>
								<SButton2 onClick={showCancelModal}>Cancelar</SButton2>
							</Col>
							<Col xs={12} lg={5}>
								<PButton2>Enviar</PButton2>
							</Col>
							<Col xs={0} lg={1}>
							</Col>
						</Row>
					</StyledForm>
				</Container>
			</Col >
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

NewActionForm.propTypes = {
	type: PropTypes.string.isRequired,
	idProvider: PropTypes.string.isRequired,
	close: PropTypes.func.isRequired,
	handleConfirm: PropTypes.func.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	newActionR: PropTypes.func.isRequired
}