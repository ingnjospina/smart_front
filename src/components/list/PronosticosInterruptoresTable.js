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
import {getPronosticos} from '../../services/pronostico.services'
import {getInterruptores} from '../../services/interruptor.services'
import {Spinner} from '../tools/spinner'
import {UseLogout2} from '../../hooks/useLogout2'

export const PronosticosInterruptoresTable = () => {
    const {logOut} = UseLogout2()
    const [pronosticos, setPronosticos] = useState([])
    const [interruptores, setInterruptores] = useState([])
    const [showSpinner, setShowSpinner] = useState(false)

    // Estados para filtros
    const [idInterruptor, setIdInterruptor] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')

    // Estado para el modal de detalle
    const [show, setShow] = useState(false)
    const [title] = useState('')
    const [message] = useState('')

    const handleCloseModal = () => setShow(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setShowSpinner(true)
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))

                // Filtrar solo interruptores
                const params = new URLSearchParams()
                params.append('tipo_equipo', 'interruptor')

                const pronosticosResponse = await getPronosticos(user.token, params.toString())
                const interruptoresResponse = await getInterruptores(user.token)

                setPronosticos(pronosticosResponse)
                setInterruptores(interruptoresResponse)
                setShowSpinner(false)
            } catch (error) {
                console.error('Error al obtener datos:', error)
                logOut()
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
            params.append('tipo_equipo', 'interruptor')

            if (idInterruptor) params.append('idInterruptor', idInterruptor)
            if (fechaDesde) params.append('fecha_desde', fechaDesde)
            if (fechaHasta) params.append('fecha_hasta', fechaHasta)

            // Llamada al endpoint con los filtros aplicados
            const pronosticosResponse = await getPronosticos(user.token, params.toString())

            // Actualizar estado con los datos filtrados desde la API
            setPronosticos(pronosticosResponse)
        } catch (error) {
            console.error('Error al obtener pronósticos con filtros:', error)
            logOut()
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

            // Llamar al endpoint sin filtros (solo tipo_equipo)
            const params = new URLSearchParams()
            params.append('tipo_equipo', 'interruptor')
            const pronosticosResponse = await getPronosticos(user.token, params.toString())

            // Restablecer los estados a vacío
            setIdInterruptor('')
            setFechaDesde('')
            setFechaHasta('')

            // Actualizar estado con datos limpios desde la API
            setPronosticos(pronosticosResponse)
        } catch (error) {
            console.error('Error al obtener pronósticos sin filtros:', error)
            logOut()
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
        const headers = ['ID', 'Interruptor', 'Tiempo Apertura (ms)', 'Tiempo Cierre (ms)', 'Núm. Operaciones',
                        'Corriente Falla (kA)', 'Resistencia Contactos (µΩ)', 'Fecha Mantenimiento',
                        'Prob. Mantenimiento (%)', 'Fecha Programada', 'Fecha Óptima Sugerida', 'Fecha Creación']

        // Crear filas con los datos filtrados
        const rows = pronosticos.map(item => [
            item.pronostico.idpronostico,
            item.equipo ? item.equipo.nombre : 'N/A',
            item.pronostico.tiempo_apertura,
            item.pronostico.tiempo_cierre,
            item.pronostico.numero_operaciones,
            item.pronostico.corriente_falla,
            item.pronostico.resistencia_contactos,
            item.pronostico.fecha_mantenimiento,
            item.pronostico.probabilidad_mantenimiento || 'N/A',
            item.pronostico.fecha_programada || 'N/A',
            item.pronostico.fecha_optima_sugerida || 'N/A',
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
        link.setAttribute('download', `pronosticos_interruptores_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DivForm>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <PTitleFilter className="mb-4">📊 Pronósticos Registrados - Interruptores</PTitleFilter>

                    {/* Filtros */}
                    <form onSubmit={filterData} className="mb-4">
                        <Row className="g-3">
                            <Col xs={12} md={4}>
                                <LabelForm>Interruptor</LabelForm>
                                <StyledFormSelect value={idInterruptor}
                                                  onChange={(e) => setIdInterruptor(e.target.value)}>
                                    <option value="">Todos</option>
                                    {interruptores.map((item) => (
                                        <option key={item.idinterruptores} value={item.idinterruptores}>
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
                            <StyledTH>Interruptor</StyledTH>
                            <StyledTH>Fecha Mant.</StyledTH>
                            <StyledTH>Prob. Mant. (%)</StyledTH>
                            <StyledTH>Fecha Programada</StyledTH>
                            <StyledTH>Fecha Óptima</StyledTH>
                            <StyledTH>Fecha Creación</StyledTH>
                        </tr>
                        </thead>
                        <tbody>
                        {pronosticos.length ? pronosticos.map((item) => (
                            <tr key={item.pronostico.idpronostico}>
                                <StyledTD>{item.pronostico.idpronostico}</StyledTD>
                                <StyledTD>{item.equipo ? item.equipo.nombre : 'N/A'}</StyledTD>
                                <StyledTD>{item.pronostico.fecha_mantenimiento}</StyledTD>
                                <StyledTD>{item.pronostico.probabilidad_mantenimiento || 'N/A'}</StyledTD>
                                <StyledTD>{item.pronostico.fecha_programada || 'N/A'}</StyledTD>
                                <StyledTD>{item.pronostico.fecha_optima_sugerida || 'N/A'}</StyledTD>
                                <StyledTD>{new Date(item.pronostico.fecha_creacion).toLocaleString()}</StyledTD>
                            </tr>
                        )) : <tr><StyledTD colSpan="7" className="text-center">No hay pronósticos disponibles.</StyledTD>
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
