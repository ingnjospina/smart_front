/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {Col, Container, Row, Table} from 'react-bootstrap'
import {
    DivForm,
    InputForm,
    LabelForm,
    PButton,
    PTitleFilter,
    SButton,
    StyledFormSelect,
    StyledTD,
    StyledTH
} from '../tools/styleContent'
import {getPronosticosTransformadores, sendPronosticoTransformadorEmail} from '../../services/pronostico.services'
import {getTransformadores} from '../../services/transformer.services'
import {Spinner} from '../tools/spinner'
import {UseLogout} from '../../hooks/useLogout'

export const PronosticosTransformadoresTable = () => {
    const logout = UseLogout()
    const [pronosticos, setPronosticos] = useState([])
    const [transformadores, setTransformadores] = useState([])
    const [showSpinner, setShowSpinner] = useState(false)

    // Estados para filtros
    const [idTransformador, setIdTransformador] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')

    // Estado para el modal de detalle
    const [show, setShow] = useState(false)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')
    const [sendingEmail, setSendingEmail] = useState(null)

    const handleCloseModal = () => setShow(false)

    // Función para enviar email
    const handleSendEmail = async (pronosticoId) => {
        try {
            setSendingEmail(pronosticoId)
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
            const response = await sendPronosticoTransformadorEmail(user.token, pronosticoId)
            setTitle('Correo Enviado')
            setMessage(response.message || 'El correo ha sido enviado exitosamente.')
            setShow(true)
        } catch (error) {
            console.error('Error al enviar correo:', error)
            setTitle('Error')
            setMessage(error.response?.data?.message || 'Error al enviar el correo.')
            setShow(true)
        } finally {
            setSendingEmail(null)
        }
    }

    useEffect(() => {
        const fetchData = async () => {
            try {
                setShowSpinner(true)
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))

                const pronosticosResponse = await getPronosticosTransformadores(user.token)
                const transformadoresResponse = await getTransformadores(user.token)

                setPronosticos(pronosticosResponse)
                setTransformadores(transformadoresResponse)
                setShowSpinner(false)
            } catch (error) {
                console.error('Error al obtener datos:', error)
                logout.logOut()
            }
        }

        fetchData().then(() => {
        })
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    // Aplicar filtros
    const filterData = async (e) => {
        e.preventDefault()
        setShowSpinner(true)

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))

            // Construcción dinámica de los parámetros de la URL
            let params = new URLSearchParams()

            if (idTransformador) params.append('idTransformador', idTransformador)
            if (fechaDesde) params.append('fecha_desde', fechaDesde)
            if (fechaHasta) params.append('fecha_hasta', fechaHasta)

            // Llamada al endpoint con los filtros aplicados
            const pronosticosResponse = await getPronosticosTransformadores(user.token, params.toString())

            // Actualizar estado con los datos filtrados desde la API
            setPronosticos(pronosticosResponse)
        } catch (error) {
            console.error('Error al obtener pronósticos con filtros:', error)
            logout.logOut()
        } finally {
            setShowSpinner(false)
        }
    }

    // Resetear filtros
    const clear = async (e) => {
        e.preventDefault()
        setShowSpinner(true)

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))

            // Llamar al endpoint sin filtros
            const pronosticosResponse = await getPronosticosTransformadores(user.token)

            // Restablecer los estados a vacío
            setIdTransformador('')
            setFechaDesde('')
            setFechaHasta('')

            // Actualizar estado con datos limpios desde la API
            setPronosticos(pronosticosResponse)
        } catch (error) {
            console.error('Error al obtener pronósticos sin filtros:', error)
            logout.logOut()
        } finally {
            setShowSpinner(false)
        }
    }

    // Función para descargar CSV
    const downloadCSV = () => {
        if (pronosticos.length === 0) {
            alert('No hay datos para descargar')
            return
        }

        // Crear encabezados del CSV
        const headers = ['ID', 'Transformador', 'HI Total', 'HI Funcional', 'HI Dieléctrico',
                        'RM Actual', 'Condición', 'Color Alerta', 'Fecha Últ. Mant.',
                        'Fecha Programada', 'Fecha Óptima Sugerida', 'Recomendación', 'Fecha Creación']

        // Crear filas con los datos filtrados
        const rows = pronosticos.map(item => [
            item.pronostico.idpronostico_transformador,
            item.transformador ? item.transformador.nombre : 'N/A',
            item.pronostico.hi_total || 'N/A',
            item.pronostico.hi_funcional || 'N/A',
            item.pronostico.hi_dielectrico || 'N/A',
            item.pronostico.rm_actual || 'N/A',
            item.pronostico.condicion_hi || 'N/A',
            item.pronostico.color_alerta || 'N/A',
            item.pronostico.fecha_ultimo_mantenimiento || 'N/A',
            item.pronostico.fecha_programada || 'N/A',
            item.pronostico.fecha_optima_sugerida || 'N/A',
            item.pronostico.recomendacion || 'N/A',
            item.pronostico.fecha_creacion
        ])

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
        link.setAttribute('download', `pronosticos_transformadores_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DivForm>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <PTitleFilter className="mb-4">📊 Pronósticos Registrados - Transformadores</PTitleFilter>

                    {/* Filtros */}
                    <form onSubmit={filterData} className="mb-4">
                        <Row className="g-3">
                            <Col xs={12} md={4}>
                                <LabelForm>Transformador</LabelForm>
                                <StyledFormSelect value={idTransformador}
                                                  onChange={(e) => setIdTransformador(e.target.value)}>
                                    <option value="">Todos</option>
                                    {transformadores.map((item) => (
                                        <option key={item.idtransformadores} value={item.idtransformadores}>
                                            {item.nombre}
                                        </option>
                                    ))}
                                </StyledFormSelect>
                            </Col>
                            <Col xs={12} md={4}>
                                <LabelForm>Fecha Desde</LabelForm>
                                <InputForm type='date' value={fechaDesde}
                                           onChange={(e) => setFechaDesde(e.target.value)}/>
                            </Col>
                            <Col xs={12} md={4}>
                                <LabelForm>Fecha Hasta</LabelForm>
                                <InputForm type='date' value={fechaHasta}
                                           onChange={(e) => setFechaHasta(e.target.value)}/>
                            </Col>
                        </Row>

                        <Row className="g-3 mt-3">
                            <Col xs={12} md={4} className="d-flex align-items-end">
                                <SButton onClick={clear} className="w-100">Limpiar</SButton>
                            </Col>
                            <Col xs={12} md={4} className="d-flex align-items-end">
                                <PButton type="submit" className="w-100">Filtrar</PButton>
                            </Col>
                            <Col xs={12} md={4} className="d-flex align-items-end">
                                <PButton type="button" className="w-100" onClick={downloadCSV}>
                                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '5px'}}>
                                        <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                                        <polyline points="7 10 12 15 17 10"></polyline>
                                        <line x1="12" y1="15" x2="12" y2="3"></line>
                                    </svg>
                                    CSV
                                </PButton>
                            </Col>
                        </Row>
                    </form>

                    {/* Tabla */}
                    <Table responsive="sm">
                        <thead>
                        <tr>
                            <StyledTH>ID</StyledTH>
                            <StyledTH>Transformador</StyledTH>
                            <StyledTH>HI Total</StyledTH>
                            <StyledTH>Condición</StyledTH>
                            <StyledTH>RM Actual</StyledTH>
                            <StyledTH>Alerta</StyledTH>
                            <StyledTH>Fecha Óptima</StyledTH>
                            <StyledTH>Fecha Creación</StyledTH>
                            <StyledTH>Acciones</StyledTH>
                        </tr>
                        </thead>
                        <tbody>
                        {pronosticos.length ? pronosticos.map((item) => (
                            <tr key={item.pronostico.idpronostico_transformador}>
                                <StyledTD>{item.pronostico.idpronostico_transformador}</StyledTD>
                                <StyledTD>{item.transformador ? item.transformador.nombre : 'N/A'}</StyledTD>
                                <StyledTD>{item.pronostico.hi_total != null ? Number(item.pronostico.hi_total).toFixed(2) : 'N/A'}</StyledTD>
                                <StyledTD>{item.pronostico.condicion_hi || 'N/A'}</StyledTD>
                                <StyledTD>{item.pronostico.rm_actual != null ? Number(item.pronostico.rm_actual).toFixed(4) : 'N/A'}</StyledTD>
                                <StyledTD>
                                    <span style={{
                                        display: 'inline-block',
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        backgroundColor: item.pronostico.color_alerta === 'verde' ? '#28a745' :
                                                        item.pronostico.color_alerta === 'amarillo' ? '#ffc107' :
                                                        item.pronostico.color_alerta === 'naranja' ? '#fd7e14' :
                                                        item.pronostico.color_alerta === 'rojo' ? '#dc3545' :
                                                        item.pronostico.color_alerta === 'azul' ? '#007bff' : '#6c757d',
                                        marginRight: '5px'
                                    }}></span>
                                    {item.pronostico.color_alerta || 'N/A'}
                                </StyledTD>
                                <StyledTD>{item.pronostico.fecha_optima_sugerida || 'N/A'}</StyledTD>
                                <StyledTD>{new Date(item.pronostico.fecha_creacion).toLocaleString()}</StyledTD>
                                <StyledTD>
                                    <button
                                        onClick={() => handleSendEmail(item.pronostico.idpronostico_transformador)}
                                        disabled={sendingEmail === item.pronostico.idpronostico_transformador}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: sendingEmail === item.pronostico.idpronostico_transformador ? 'wait' : 'pointer',
                                            padding: '5px',
                                            borderRadius: '4px',
                                            transition: 'background-color 0.2s'
                                        }}
                                        title="Enviar por correo"
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            width="20"
                                            height="20"
                                            viewBox="0 0 24 24"
                                            fill="none"
                                            stroke={sendingEmail === item.pronostico.idpronostico_transformador ? '#6c757d' : '#007bff'}
                                            strokeWidth="2"
                                            strokeLinecap="round"
                                            strokeLinejoin="round"
                                        >
                                            <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"></path>
                                            <polyline points="22,6 12,13 2,6"></polyline>
                                        </svg>
                                    </button>
                                </StyledTD>
                            </tr>
                        )) : <tr><StyledTD colSpan="9" className="text-center">No hay pronósticos disponibles.</StyledTD>
                        </tr>}
                        </tbody>
                    </Table>

                    {/* Modal */}
                    <CancelAceptModal
                        showModal={show}
                        handleCloseModal={handleCloseModal}
                        title={title}
                        message={message}
                        handleConfirmSubmit={handleCloseModal}
                        subTitle=""
                    />
                </Container>
            </Col>
            {
                showSpinner ? (
                        <div className={'divSpinner'}>
                            <Spinner/>
                        </div>
                    ) :
                    (
                        <></>
                    )
            }
        </DivForm>
    )
}
