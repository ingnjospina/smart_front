import '../../styles/spinner.css'
import React, {useState} from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {DivForm, InputForm, PButton, SButton, StyledForm} from '../tools/styleContent'
import {Alert, Container, Form} from 'react-bootstrap'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {Spinner} from '../tools/spinner'
import {useNavigate} from 'react-router-dom'
import {UseLogout} from '../../hooks/useLogout'
import {createInterruptores} from "../../services/interruptor.services"
import RequiredLabel from "../tools/requiredLabel";

export const NewInterru = () => {

    const nav = useNavigate()
    const logout = UseLogout()

    const [nombre, setNombre] = useState('')
    const [descripcion, setDescripcion] = useState('')
    const [nivelesTension, setNivelesTension] = useState('')
    const [subestacion, setSubestacion] = useState('')

    const [formError, setFormError] = useState(false)
    const [show, setShow] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [title, setTitle] = useState('')
    const [subTitle, setSubTitle] = useState('')
    const [message, setMessage] = useState('')
    const [showSpinner, setShowSpinner] = useState(false)

    // Datos quemados para los selectores
    const nivelesTensionOptions = ["115kV", "34.5kV", "13.8kV"];
    const subestacionesOptions = ["Calima"];

    const handleCloseModal = () => {
        setShow(false)
    }

    const createMeasurement = async (event) => {
        setShowSpinner(true)
        event.preventDefault()
        if (!nombre || !descripcion || !nivelesTension || !subestacion) {
            setShowAlert(true)
            setFormError(true)
            window.scrollTo({top: 0, behavior: 'smooth'})
            setShowSpinner(false)
            return
        }

        try {
            const data = {
                nombre: nombre,
                descripcion: descripcion,
                niveles_tension: nivelesTension,
                subestacion: subestacion
            }
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
            const respond = await createInterruptores(user.token, data)
            setTitle('Interruptor Registrado')
            setSubTitle(respond.message)
            setMessage('Interruptor #' + respond.data.idinterruptores + ' Registrado')
        } catch (e) {
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
            window.scrollTo({top: 0, behavior: 'smooth'})
        }
    }

    const showCancelModal = (event) => {
        event.preventDefault()
        setShow(true)
        setTitle('Cancelar Registro')
        setSubTitle('')
        setMessage('¿Estás seguro de que deseas cancelar el registro del Interruptor?')
    }

    return (
        <DivForm className='newReportContent'>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <StyledForm onSubmit={createMeasurement}>
                        {showAlert && (
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
                        )}
                        <Row xs={12}>
                            <Col xs={6} md={6} className={`${!nombre && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Nombre Interruptor</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='text'
                                        value={nombre}
                                        name='nombre'
                                        placeholder='Texto'
                                        onChange={({target}) => setNombre(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={6} className={`${!descripcion && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Descripción Interruptor</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='text'
                                        value={descripcion}
                                        name='descripcion'
                                        placeholder='Texto'
                                        onChange={({target}) => setDescripcion(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>

                        {/* Selector de Niveles de Tensión */}
                        <Row xs={12}>
                            <Col xs={6} md={6} className={`${!nivelesTension && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Niveles de Tensión</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <Form.Select value={nivelesTension}
                                                 onChange={(e) => setNivelesTension(e.target.value)}>
                                        <option value="">Seleccione un nivel de tensión</option>
                                        {nivelesTensionOptions.map((nivel, index) => (
                                            <option key={index} value={nivel}>{nivel}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Col>

                            {/* Selector de Subestación */}
                            <Col xs={6} md={6} className={`${!subestacion && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Subestación</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <Form.Select value={subestacion} onChange={(e) => setSubestacion(e.target.value)}>
                                        <option value="">Seleccione una subestación</option>
                                        {subestacionesOptions.map((sub, index) => (
                                            <option key={index} value={sub}>{sub}</option>
                                        ))}
                                    </Form.Select>
                                </Col>
                            </Col>
                        </Row>

                        <br></br>
                        <Row xs={12}>
                            <Col xs={0} lg={3}></Col>
                            <Col xs={12} lg={3}>
                                <SButton onClick={showCancelModal}>Cancelar</SButton>
                            </Col>
                            <Col xs={12} lg={3}>
                                <PButton>Guardar</PButton>
                            </Col>
                            <Col xs={0} lg={3}></Col>
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
            {showSpinner && (
                <div className='divSpinner'>
                    <Spinner/>
                </div>
            )}
        </DivForm>
    )
}
