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
import {Alert, Container, Modal, Table, Button} from 'react-bootstrap'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {getTransformadores} from '../../services/transformer.services'
import {createPronosticoTransformador} from '../../services/pronostico.services'
import {getMedicionesByTransformador, getMedicionComplemento} from '../../services/mediciones.services'
import {Spinner} from '../tools/spinner'
import {useNavigate} from 'react-router-dom'
import {UseLogout} from '../../hooks/useLogout'
import RequiredLabel from "../tools/requiredLabel";

export const NewPronosticoTransformador = () => {

    const nav = useNavigate()
    const logout = UseLogout()

    const [userData, setUserData] = useState({})

    const [transformador, setTransformador] = useState('')
    const [transformadores, setTransformadores] = useState([])
    const [loadingTransfo, setLoadingTransfo] = useState(true)

    const [fechaMantenimiento, setFechaMantenimiento] = useState('')

    const [formError, setFormError] = useState(false)
    const [show, setShow] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [title, setTitle] = useState('')
    const [subTitle, setSubTitle] = useState('')
    const [message, setMessage] = useState('')
    const [showSpinner, setShowSpinner] = useState(false)
    const [isSuccess, setIsSuccess] = useState(false)

    const [medicionesHistorico, setMedicionesHistorico] = useState([])
    const [loadingHistorico, setLoadingHistorico] = useState(false)
    const [currentPage, setCurrentPage] = useState(1)
    const [showMedicionModal, setShowMedicionModal] = useState(false)
    const [selectedMedicion, setSelectedMedicion] = useState(null)
    const [loadingMedicion, setLoadingMedicion] = useState(false)
    const ROWS_PER_PAGE = 5

    const handleCloseModal = () => {
        setShow(false)
    }

    useEffect(() => {
        const fetchTransformadores = async () => {
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                setUserData(user)
                const response = await getTransformadores(user.token)
                setTransformadores(response)
                setLoadingTransfo(false)
                return response
            } catch (error) {
                console.error('Error al cargar los transformadores:', error)
            }
        }
        fetchTransformadores()
    }, [])

    useEffect(() => {
        if (!transformador) {
            setMedicionesHistorico([])
            setCurrentPage(1)
            return
        }
        const fetchHistorico = async () => {
            setLoadingHistorico(true)
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const response = await getMedicionesByTransformador(user.token, transformador)
                const sorted = [...response].sort((a, b) => new Date(b.fecha_hora) - new Date(a.fecha_hora))
                setMedicionesHistorico(sorted)
            } catch {
                setMedicionesHistorico([])
            }
            setLoadingHistorico(false)
            setCurrentPage(1)
        }
        fetchHistorico()
    }, [transformador])

    const handleVerMedicion = async (medicion) => {
        setSelectedMedicion({...medicion})
        setShowMedicionModal(true)
        setLoadingMedicion(true)
        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
            const complemento = await getMedicionComplemento(user.token, medicion.idmediciones_transformadores)
            setSelectedMedicion({...medicion, ...complemento})
        } catch {
            // muestra con los datos base
        }
        setLoadingMedicion(false)
    }

    const createForecast = async (event) => {
        setShowSpinner(true)
        event.preventDefault()
        if (!transformador || !fechaMantenimiento) {
            setShowAlert(true)
            setFormError(true)
            window.scrollTo({top: 0, behavior: 'smooth'})
            setShowSpinner(false)
            return
        }

        try {
            const data = {
                transformador: transformador,
                fecha_ultimo_mantenimiento: fechaMantenimiento,
            }
            const respond = await createPronosticoTransformador(userData.token, data)
            setIsSuccess(true)
            setTitle('Pronóstico Realizado')
            setSubTitle('Resumen')
            setMessage(
                `HI Total: ${respond.resumen.hi_total}%  |  Condición: ${respond.resumen.condicion}\n` +
                `RM: ${respond.resumen.rm_actual}  |  Fecha óptima: ${respond.resumen.fecha_optima_sugerida}`
            )
        } catch (e) {
            setIsSuccess(false)
            setTitle('Error')
            setSubTitle('')
            if (e.response?.data?.error?.name === 'TokenExpiredError') {
                logout.logOut()
            }
            const errorMsg = e.response?.data?.message || e.response?.data?.error || 'No puedes realizar esta acción.'
            setMessage(errorMsg)
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
                nav('/pronosticosTransformadores')
            } else {
                setShow(false)
            }
        }
        if (text === 'Edit') {
            nav('/pronosticosTransformadores')
        }
    }

    const showCancelModal = (event) => {
        event.preventDefault()
        setShow(true)
        setTitle('Cancelar Pronóstico')
        setSubTitle('')
        setMessage('¿Estás seguro de que deseas cancelar el registro de pronóstico?')
    }

    return (
        <DivForm className='newReportContent'>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <StyledForm onSubmit={createForecast}>
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
                            ) : (<></>)
                        }
                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!transformador && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Transformador</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <StyledFormSelect
                                        aria-label="Default select example"
                                        value={transformador}
                                        name='transformador'
                                        placeholder='Transformador'
                                        onChange={({target}) => setTransformador(target.value)}
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
                            <Col xs={12} md={6} className={`${!fechaMantenimiento && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Fecha del último mantenimiento</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='date'
                                        value={fechaMantenimiento}
                                        name='fechaMantenimiento'
                                        placeholder='YYYY-MM-DD'
                                        onChange={({target}) => setFechaMantenimiento(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>
                        {transformador && (
                            <Row xs={12} style={{marginTop: '16px', marginBottom: '8px'}}>
                                <Col xs={12}>
                                    <LabelForm>Histórico de Mediciones</LabelForm>
                                    {loadingHistorico ? (
                                        <p style={{color: '#666', fontSize: '0.9rem'}}>Cargando...</p>
                                    ) : medicionesHistorico.length === 0 ? (
                                        <p style={{color: '#666', fontSize: '0.9rem'}}>No hay mediciones registradas para este transformador.</p>
                                    ) : (
                                        <>
                                            <Table responsive="sm" bordered hover size="sm">
                                                <thead>
                                                    <tr>
                                                        <th>ID Medición</th>
                                                        <th>Valor Medición HI</th>
                                                        <th>Fecha</th>
                                                        <th></th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    {medicionesHistorico
                                                        .slice((currentPage - 1) * ROWS_PER_PAGE, currentPage * ROWS_PER_PAGE)
                                                        .map((m) => (
                                                            <tr key={m.idmediciones_transformadores}>
                                                                <td>{m.idmediciones_transformadores}</td>
                                                                <td>{m.hi_ponderado ?? '—'}</td>
                                                                <td>{m.fecha_hora ? new Date(m.fecha_hora).toLocaleDateString('es-CO') : '—'}</td>
                                                                <td>
                                                                    <Button size="sm" variant="outline-primary" onClick={() => handleVerMedicion(m)}>
                                                                        Ver
                                                                    </Button>
                                                                </td>
                                                            </tr>
                                                        ))
                                                    }
                                                </tbody>
                                            </Table>
                                            {Math.ceil(medicionesHistorico.length / ROWS_PER_PAGE) > 1 && (
                                                <div style={{display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '8px'}}>
                                                    <Button size="sm" variant="outline-secondary" disabled={currentPage === 1} onClick={() => setCurrentPage(p => p - 1)}>‹</Button>
                                                    <span style={{fontSize: '0.9rem'}}>{currentPage} / {Math.ceil(medicionesHistorico.length / ROWS_PER_PAGE)}</span>
                                                    <Button size="sm" variant="outline-secondary" disabled={currentPage === Math.ceil(medicionesHistorico.length / ROWS_PER_PAGE)} onClick={() => setCurrentPage(p => p + 1)}>›</Button>
                                                </div>
                                            )}
                                        </>
                                    )}
                                </Col>
                            </Row>
                        )}
                        <br></br>
                        <Row xs={12}>
                            <Col xs={0} lg={3}>
                            </Col>
                            <Col xs={12} lg={3}>
                                <SButton onClick={showCancelModal}>Cancelar</SButton>
                            </Col>
                            <Col xs={12} lg={3}>
                                <PButton disabled={!transformador}>Generar Pronóstico</PButton>
                            </Col>
                            <Col xs={0} lg={3}>
                            </Col>
                        </Row>
                    </StyledForm>
                </Container>
            </Col>
            <Modal show={showMedicionModal} onHide={() => setShowMedicionModal(false)} size="lg" centered>
                <Modal.Header closeButton>
                    <Modal.Title>Medición #{selectedMedicion?.idmediciones_transformadores}</Modal.Title>
                </Modal.Header>
                <Modal.Body>
                    {loadingMedicion ? (
                        <p style={{textAlign: 'center', color: '#666'}}>Cargando...</p>
                    ) : selectedMedicion && (
                        <>
                            <h6>Índice Funcional</h6>
                            <Table size="sm" bordered>
                                <tbody>
                                    <tr><td>Relación Transformación</td><td>{selectedMedicion.relacion_transformacion}</td></tr>
                                    <tr><td>HIF Relación Transformación</td><td>{selectedMedicion.hif_relacion_transformacion ?? '—'}</td></tr>
                                    <tr><td>Resistencia Devanados</td><td>{selectedMedicion.resistencia_devanados}</td></tr>
                                    <tr><td>HIF Resistencia Devanados</td><td>{selectedMedicion.hif_resistencia_devanados ?? '—'}</td></tr>
                                    <tr><td>Corriente Excitación</td><td>{selectedMedicion.corriente_excitacion}</td></tr>
                                    <tr><td>HIF Corriente Excitación</td><td>{selectedMedicion.hif_corriente_excitacion ?? '—'}</td></tr>
                                    <tr><td>Gases Disueltos</td><td>{selectedMedicion.gases_disueltos ?? '—'}</td></tr>
                                    <tr><td>HIF Gases Disueltos</td><td>{selectedMedicion.hif_gases_disueltos ?? '—'}</td></tr>
                                    <tr><td><strong>HI Funcional</strong></td><td><strong>{selectedMedicion.hi_funcional ?? '—'}</strong></td></tr>
                                </tbody>
                            </Table>
                            <h6>Índice Dieléctrico</h6>
                            <Table size="sm" bordered>
                                <tbody>
                                    <tr><td>Factor Potencia</td><td>{selectedMedicion.factor_potencia}</td></tr>
                                    <tr><td>Inhibidor Oxidación</td><td>{selectedMedicion.inhibidor_oxidacion}</td></tr>
                                    <tr><td>Compuestos Furánicos</td><td>{selectedMedicion.compuestos_furanicos}</td></tr>
                                    <tr><td>Calidad Aceite / Humedad</td><td>{selectedMedicion.calidad_aceite_humedad ?? '—'}</td></tr>
                                    <tr><td><strong>HI Dieléctrico</strong></td><td><strong>{selectedMedicion.hi_dielectrico ?? '—'}</strong></td></tr>
                                </tbody>
                            </Table>
                            <h6>Resultado</h6>
                            <Table size="sm" bordered>
                                <tbody>
                                    <tr><td><strong>HI Ponderado</strong></td><td><strong>{selectedMedicion.hi_ponderado ?? '—'}</strong></td></tr>
                                    <tr><td>Fecha</td><td>{selectedMedicion.fecha_hora ? new Date(selectedMedicion.fecha_hora).toLocaleString('es-CO') : '—'}</td></tr>
                                </tbody>
                            </Table>
                            {selectedMedicion.gasesDisueltos && (
                                <>
                                    <h6>Detalle Gases Disueltos</h6>
                                    <Table size="sm" bordered>
                                        <tbody>
                                            {Object.entries(selectedMedicion.gasesDisueltos)
                                                .filter(([k]) => !k.startsWith('id') && !k.includes('Medic'))
                                                .map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                            {selectedMedicion.aceiteFisicoQuimico && (
                                <>
                                    <h6>Detalle Aceite Físico Químico</h6>
                                    <Table size="sm" bordered>
                                        <tbody>
                                            {Object.entries(selectedMedicion.aceiteFisicoQuimico)
                                                .filter(([k]) => !k.startsWith('id') && !k.includes('Medic'))
                                                .map(([k, v]) => <tr key={k}><td>{k}</td><td>{v}</td></tr>)}
                                        </tbody>
                                    </Table>
                                </>
                            )}
                        </>
                    )}
                </Modal.Body>
                <Modal.Footer>
                    <Button variant="secondary" onClick={() => setShowMedicionModal(false)}>Cerrar</Button>
                </Modal.Footer>
            </Modal>
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
                        <Spinner/>
                    </div>
                ) : (<></>)
            }
        </DivForm>
    )
}
