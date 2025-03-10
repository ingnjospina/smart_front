import '../../styles/spinner.css'
import React, { useState } from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import { DivForm, InputForm, LabelForm, PButton, SButton, StyledForm } from '../tools/styleContent'
import { Alert, Container } from 'react-bootstrap'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { createTransformadores } from '../../services/transformer.services'
import { Spinner } from '../tools/spinner'
import { useNavigate } from 'react-router-dom'
import { UseLogout } from '../../hooks/useLogout'

export const NewTransfo = () => { 

	const nav = useNavigate()
	const logout = UseLogout()

	const [nombreTransfo, setNombreTransfo] = useState('')
	const [descripcionTransfo, setDescripcionTransfo] = useState('')

	const [formError, setFormError] = useState(false)
	const [show, setShow] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const [title, setTitle] = useState('')
	const [subTitle, setSubTitle] = useState('')
	const [message, setMessage] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)

	const handleCloseModal = () => { setShow(false) }

	const createMeasurement = async (event) => {
		setShowSpinner(true)
		event.preventDefault()
		if (
			!nombreTransfo || !descripcionTransfo
		) {
			setShowAlert(true)
			setFormError(true)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			setShowSpinner(false)
			return
		}

		try {
			const data = {
				nombre: nombreTransfo,
				descripcion: descripcionTransfo,
			}
			const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
			const respond = await createTransformadores(user.token, data)
			setTitle('Transformador Registrado')
			setSubTitle(respond.data.message)
			setMessage('Transformador #'+ respond.data.idtransformadores + ' Registrado')
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

	const handleConfirmSubmit = (text) => {
		if (text === 'Cancel') {
			nav('/')
		}

		if (text === 'Acept') {
			window.location.reload()
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const showCancelModal = (event) => {
		event.preventDefault()
		setShow(true)
		setTitle('Cancelar Registro')
		setSubTitle('')
		setMessage('¿Estás seguro de que deseas cancelar el registro del transformador?')
	}

	return (
		<DivForm className='newReportContent'>
			<Col xs={12} className={'formBackground'}>
				<Container>
					<StyledForm onSubmit={createMeasurement}>
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
							<Col xs={6} md={6} className={`${!nombreTransfo && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Nombre Transformador</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={nombreTransfo}
										name='nombreTransfo'
										placeholder='texto'
										onChange={({ target }) => setNombreTransfo(target.value)}
									/>
								</Col>
							</Col>
							<Col xs={6} md={6} className={`${!descripcionTransfo && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>descripción Transformador</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='text'
										value={descripcionTransfo}
										name='descripcionTransfo'
										placeholder='texto'
										onChange={({ target }) => setDescripcionTransfo(target.value)}
									/>
								</Col>
							</Col>
						</Row>
						<br></br>
						<Row xs={12}>
							<Col xs={0} lg={3}>
							</Col>
							<Col xs={12} lg={3}>
								<SButton onClick={showCancelModal}>Cancelar</SButton>
							</Col>
							<Col xs={12} lg={3}>
								<PButton>Guardar</PButton>
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