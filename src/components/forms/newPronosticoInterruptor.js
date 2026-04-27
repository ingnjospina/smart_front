import '../../styles/spinner.css'
import React, {useEffect, useState} from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {
    DivForm,
    InputForm,
    LabelForm,
    PButton,
    SButton,
    StyledForm,
    StyledFormSelect,
} from '../tools/styleContent'
import {Alert, Container, Table, Button} from 'react-bootstrap'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {getInterruptores, getMedicionesByInterruptor} from '../../services/interruptor.services'
import {createPronostico} from '../../services/pronostico.services'
import {Spinner} from '../tools/spinner'
import {useNavigate} from 'react-router-dom'
import {UseLogout2} from '../../hooks/useLogout2'
import RequiredLabel from "../tools/requiredLabel"

export const NewPronosticoInterruptor = () => {

    const nav = useNavigate()
    const {logOut} = UseLogout2()

    const [interruptor, setInterruptor] = useState('')
    const [interruptores, setInterruptores] = useState([])
    const [loadingInterruptores, setLoadingInterruptores] = useState(true)
    const [fechaMantenimiento, setFechaMantenimiento] = useState('')

    const [mediciones, setMediciones] = useState([])
    const [loadingMediciones, setLoadingMediciones] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const ROWS_PER_PAGE = 5

    const [formError, setFormError] = useState(false)
    const [show, setShow] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [title, setTitle] = useState('')
    const [subTitle, setSubTitle] = useState('')
    const [message, setMessage] = useState('')
    const [showSpinner, setShowSpinner] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const handleCloseModal = () => setShow(false)

    useEffect(() => {
        const fetchInterruptores = async () => {
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const response = await getInterruptores(user.token)
                setInterruptores(response)
                setLoadingInterruptores(false)
            } catch (error) {
                console.error('Error al cargar los interruptores:', error)
                logOut()
            }
        }
        fetchInterruptores()
    }, [logOut])

    useEffect(() => {
        if (!interruptor) {
            setMediciones([])
            setCurrentPage(1)
            return
        }
        const fetchMediciones = async () => {
            setLoadingMediciones(true)
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const response = await getMedicionesByInterruptor(user.token, interruptor)
                setMediciones(response)
            } catch {
                setMediciones([])
            }
            setLoadingMediciones(false)
            setCurrentPage(1)
        }
        fetchMediciones()
    }, [interruptor])

    const generarPronostico = async (event) => {
        setShowSpinner(true)
        event.preventDefault()

        if (!interruptor || !fechaMantenimiento) {
            setShowAlert(true)
            setFormError(true)
            window.scrollTo({top: 0, behavior: 'smooth'})
            setShowSpinner(false)
            return
        }

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
            const data = {
                interruptor: parseInt(interruptor),
                fecha_mantenimiento: fechaMantenimiento,
            }
            const response = await createPronostico(user.token, data)
            setIsSuccess(true)
            setTitle('Pronóstico Realizado')
            setSubTitle('ID: ' + response.data.idpronostico)
            setMessage(
                `Pmant: ${response.data.Pmant}% | I_M: ${response.data.I_M} | ΔIM: ${response.data.delta_IM}\nFecha recomendada de mantenimiento: ${response.data.fecha_recomendada}`
            )
        } catch (e) {
            setIsSuccess(false)
            setTitle('Error')
            setSubTitle('')
            if (e.response?.data?.error?.name === 'TokenExpiredError') {
                logOut()
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
            if (isSuccess) {
                nav('/pronosticosInterruptores')
            } else {
                setShow(false)
            }
        }
        if (text === 'Edit') {
            nav('/pronosticosInterruptores')
        }
    }

    const showCancelModal = (event) => {
        event.preventDefault()
        setShow(true)
        setTitle('Cancelar Pronóstico')
        setSubTitle('')
        setMessage('¿Estás seguro de que deseas cancelar la generación de pronóstico?')
    }

    const totalPages = Math.ceil(mediciones.length / ROWS_PER_PAGE)

    return (
        <DivForm className='newReportContent'>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <StyledForm onSubmit={generarPronostico}>
                        {showAlert && (
                            <Alert variant="danger" onClose={() => setShowAlert(false)} dismissible className='alert-center'>
                                <p>Por favor diligencie todos los campos del formulario.</p>
                            </Alert>
                        )}

                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!interruptor && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Interruptor</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <StyledFormSelect
                                        value={interruptor}
                                        name='interruptor'
                                        onChange={({target}) => setInterruptor(target.value)}
                                    >
                                        <option value=""></option>
                                        {loadingInterruptores ? (
                                            <option disabled>Cargando...</option>
                                        ) : (
                                            interruptores.map((item) => (
                                                <option key={item.idinterruptores} value={item.idinterruptores}>
                                                    {item.nombre}
                                                </option>
                                            ))
                                        )}
                                    </StyledFormSelect>
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${!fechaMantenimiento && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Fecha del último mantenimiento</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='date'
                                        value={fechaMantenimiento}
                                        name='fechaMantenimiento'
                                        onChange={({target}) => setFechaMantenimiento(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>

                        {interruptor && (
                            <Row xs={12} style={{marginTop: '16px', marginBottom: '8px'}}>
                                <Col xs={12}>
                                    <LabelForm>Histórico de Mediciones</LabelForm>
                                    {loadingMediciones ? (
                                        <p style={{color: '#666', fontSize: '0.9rem'}}>Cargando...</p>
                                    ) : mediciones.length === 0 ? (
                                        <p style={{color: '#666', fontSize: '0.9rem'}}>No hay mediciones registradas para este interruptor.</p>
                                    ) : (
                                        <>
                                            <Table responsive="sm" bordered hover size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>ID Medición</th>
                                                        <th>I_DM</th>
                                                        <th>I_EE</th>
                                                        <th>I_M (Salud)</th>
                                                        <th>N° Operaciones</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {mediciones
                                                        .slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)
                                                        .map((m) => (
                                                            <tr key={m.idMediciones_Interruptores}>
                                                                <td>{m.idMediciones_Interruptores}</td>
                                                                <td>{m.I_DM ?? '—'}</td>
                                                                <td>{m.I_EE ?? '—'}</td>
                                                                <td>{m.I_M ?? '—'}</td>
                                                                <td>{m.numero_operaciones}</td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </Table>
                                            {totalPages > 1 && (
                                                <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'}}>
                                                    <Button size="sm" variant="outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</Button>
                                                    <span style={{fontSize: '0.9rem'}}>{currentPage} / {totalPages}</span>
                                                    <Button size="sm" variant="outline-secondary" disabled={currentPage === totalPages} onClick={() => setCurrentPage(p => p + 1)}>›</Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Col>
                            </Row>
                        )}

                        <br/>
                        <Row xs={12}>
                            <Col xs={0} lg={3}/>
                            <Col xs={12} lg={3}>
                                <SButton onClick={showCancelModal}>Cancelar</SButton>
                            </Col>
                            <Col xs={12} lg={3}>
                                <PButton disabled={!interruptor}>Generar Pronóstico</PButton>
                            </Col>
                            <Col xs={0} lg={3}/>
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
            {showSpinner && <div className='divSpinner'><Spinner/></div>}
        </DivForm>
    )
}
