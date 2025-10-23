/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {Col, Container, Row, Table} from 'react-bootstrap'
import {
    DivForm,
    InputForm,
    LabelForm,
    PButton, PEstadoApproved, PEstadoBueno, PEstadoPobre, PEstadoRejected, PEstadoSupervision,
    PTitleFilter,
    SButton,
    StyledFormSelect,
    StyledTD,
    StyledTH
} from '../tools/styleContent'
import {getAlertasInterruptores, getInterruptores} from "../../services/interruptor.services"
import {Spinner} from "../tools/spinner";
import {UseLogout2} from "../../hooks/useLogout2";

export const AlertasInterruptoresTable = () => {
    const {logOut} = UseLogout2();
    const [alertas, setAlertas] = useState([])
    const [interruptores, setInterruptores] = useState([])
    const [showSpinner, setShowSpinner] = useState(false)

    // Estados para filtros
    const [idInterruptor, setIdInterruptor] = useState('')
    const [tipoAlerta, setTipoAlerta] = useState('')
    const [condicion, setCondicion] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')

    // Opciones fijas para Tipo de Alerta y Condición
    const tiposAlerta = ["Verde", "Amarillo", "Rojo", "Azul", "Naranja"]
    const condiciones = ["Normal", "Sobrevoltaje", "Subvoltaje", "Falla", "Advertencia"]

    // Estado para el modal de recomendación
    const [show, setShow] = useState(false)
    const [title, setTitle] = useState('')
    const [message, setMessage] = useState('')

    const handleCloseModal = () => setShow(false)

    useEffect(() => {
        const fetchData = async () => {
            try {
                setShowSpinner(true)
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const alertasResponse = await getAlertasInterruptores(user.token)
                const interruptoresResponse = await getInterruptores(user.token)

                setAlertas(alertasResponse)
                setInterruptores(interruptoresResponse)
                setShowSpinner(false)
            } catch (error) {
                console.error('Error al obtener datos:', error)
                logOut()
            }
        }

        fetchData().then(() => {
        })
    }, [logOut])

    // Aplicar filtros
    const filterData = async (e) => {
        e.preventDefault();
        setShowSpinner(true);

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'));

            // Construcción dinámica de los parámetros de la URL
            let params = new URLSearchParams();

            if (idInterruptor) params.append("idInterruptor", idInterruptor);
            if (tipoAlerta) params.append("tipo_alerta", tipoAlerta);
            if (condicion) params.append("condicion", condicion);
            if (fechaDesde) params.append("fecha_inicio", fechaDesde);
            if (fechaHasta) params.append("fecha_fin", fechaHasta);

            // Llamada al endpoint con los filtros aplicados
            const alertasResponse = await getAlertasInterruptores(user.token, params.toString());

            // Actualizar estado con los datos filtrados desde la API
            setAlertas(alertasResponse);
        } catch (error) {
            console.error('Error al obtener alertas con filtros:', error);
            logOut();
        } finally {
            setShowSpinner(false);
        }
    };


    // Resetear filtros
    const clear = async (e) => {
        e.preventDefault();
        setShowSpinner(true);

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'));

            // Llamar al endpoint sin filtros
            const alertasResponse = await getAlertasInterruptores(user.token);

            // Restablecer los estados a vacío
            setIdInterruptor('');
            setTipoAlerta('');
            setCondicion('');
            setFechaDesde('');
            setFechaHasta('');

            // Actualizar estado con datos limpios desde la API
            setAlertas(alertasResponse);
        } catch (error) {
            console.error('Error al obtener alertas sin filtros:', error);
            logOut();
        } finally {
            setShowSpinner(false);
        }
    };


    // Función para abrir el modal con la recomendación
    const viewRecomendation = (recomendacion) => {
        setTitle('RECOMENDACIÓN')
        setMessage(recomendacion)
        setShow(true)
    }

    // Función para descargar CSV
    const downloadCSV = () => {
        if (alertas.length === 0) {
            alert('No hay datos para descargar')
            return
        }

        // Crear encabezados del CSV
        const headers = ['ID', 'Interruptor', 'Valor Medición', 'Tipo Alerta', 'Condición', 'Recomendación', 'Fecha']

        // Crear filas con los datos filtrados
        const rows = alertas.map(alerta => [
            alerta.alerta.id,
            alerta.interruptor.nombre,
            alerta.alerta.valor_medicion,
            alerta.alerta.tipo_alerta,
            alerta.alerta.condicion,
            alerta.alerta.recomendacion,
            alerta.alerta.fecha_medicion
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
        link.setAttribute('download', `alertas_interruptores_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'

        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DivForm>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <PTitleFilter className="mb-4">🚨 Alertas Registradas</PTitleFilter>

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
                                <LabelForm>Tipo Alerta</LabelForm>
                                <StyledFormSelect value={tipoAlerta} onChange={(e) => setTipoAlerta(e.target.value)}>
                                    <option value="">Todos</option>
                                    {tiposAlerta.map((item, index) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </StyledFormSelect>
                            </Col>
                            <Col xs={12} md={4}>
                                <LabelForm>Condición</LabelForm>
                                <StyledFormSelect value={condicion} onChange={(e) => setCondicion(e.target.value)}>
                                    <option value="">Todos</option>
                                    {condiciones.map((item, index) => (
                                        <option key={index} value={item}>{item}</option>
                                    ))}
                                </StyledFormSelect>
                            </Col>
                        </Row>

                        <Row className="g-3 mt-3">
                            <Col xs={12} md={3}>
                                <LabelForm>Fecha Desde</LabelForm>
                                <InputForm type='date' value={fechaDesde}
                                           onChange={(e) => setFechaDesde(e.target.value)}/>
                            </Col>
                            <Col xs={12} md={3}>
                                <LabelForm>Fecha Hasta</LabelForm>
                                <InputForm type='date' value={fechaHasta}
                                           onChange={(e) => setFechaHasta(e.target.value)}/>
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-end">
                                <SButton onClick={clear} className="w-100">Limpiar</SButton>
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-end">
                                <PButton type="submit" className="w-100">Filtrar</PButton>
                            </Col>
                            <Col xs={12} md={2} className="d-flex align-items-end">
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
                            <StyledTH>Valor Medición</StyledTH>
                            <StyledTH>Tipo Alerta</StyledTH>
                            <StyledTH>Condición</StyledTH>
                            <StyledTH>Recomendación</StyledTH>
                            <StyledTH>Fecha</StyledTH>
                        </tr>
                        </thead>
                        <tbody>
                        {alertas.length ? alertas.map((alerta) => (
                            <tr key={alerta.alerta.id}>
                                <StyledTD>{alerta.alerta.id}</StyledTD>
                                <StyledTD>{alerta.interruptor.nombre}</StyledTD>
                                <StyledTD>{alerta.alerta.valor_medicion}</StyledTD>
                                <StyledTD>
                                    {
                                        alerta.alerta.tipo_alerta === 'Verde' ?
                                            <PEstadoApproved>{alerta.alerta.tipo_alerta}</PEstadoApproved>
                                            :
                                            alerta.alerta.tipo_alerta === 'Rojo' ?
                                                <PEstadoRejected>{alerta.alerta.tipo_alerta}</PEstadoRejected>
                                                :
                                                alerta.alerta.tipo_alerta === 'Amarillo' ?
                                                    <PEstadoSupervision>{alerta.alerta.tipo_alerta}</PEstadoSupervision>
                                                    :
                                                    alerta.alerta.tipo_alerta === 'Azul' ?
                                                        <PEstadoBueno>{alerta.alerta.tipo_alerta}</PEstadoBueno>
                                                        :
                                                        alerta.alerta.tipo_alerta === 'Naranja' ?
                                                            <PEstadoPobre>{alerta.alerta.tipo_alerta}</PEstadoPobre>
                                                            :
                                                            (
                                                                <></>
                                                            )
                                    }
                                </StyledTD>
                                <StyledTD>{alerta.alerta.condicion}</StyledTD>
                                <StyledTD>
                                    <button
                                        onClick={() => viewRecomendation(alerta.alerta.recomendacion)}
                                        style={{background: 'none', border: 'none', cursor: 'pointer'}}
                                        aria-label="Ver recomendación"
                                    >
                                        <svg xmlns="http://www.w3.org/2000/svg" width="27" height="20"
                                             viewBox="0 0 27 20" fill="none">
                                            <path
                                                d="M25.9154 9.70601C23.1415 3.8626 18.9484 0.921875 13.3273 0.921875C7.7034 0.921875 3.51323 3.8626 0.739294 9.70893C0.513985 10.183 0.513985 10.7389 0.739294 11.2159C3.51323 17.0593 7.70632 20 13.3273 20C18.9513 20 23.1415 17.0593 25.9154 11.2129C26.1407 10.7389 26.1407 10.1888 25.9154 9.70601ZM13.3273 17.8932C8.60756 17.8932 5.15184 15.4997 2.71441 10.4609C5.15184 5.42221 8.60756 3.02866 13.3273 3.02866C18.0471 3.02866 21.5028 5.42221 23.9403 10.4609C21.5058 15.4997 18.0501 17.8932 13.3273 17.8932Z"
                                                fill="#99ABB4"/>
                                            <path
                                                d="M13.2105 5.31104C10.3663 5.31104 8.06055 7.6168 8.06055 10.461C8.06055 13.3051 10.3663 15.6109 13.2105 15.6109C16.0546 15.6109 18.3604 13.3051 18.3604 10.461C18.3604 7.6168 16.0546 5.31104 13.2105 5.31104ZM13.2105 13.7382C11.3992 13.7382 9.93325 12.2722 9.93325 10.461C9.93325 8.64971 11.3992 7.18373 13.2105 7.18373C15.0217 7.18373 16.4877 8.64971 16.4877 10.461C16.4877 12.2722 15.0217 13.7382 13.2105 13.7382Z"
                                                fill="#99ABB4"/>
                                        </svg>
                                    </button>
                                </StyledTD>
                                <StyledTD>{alerta.alerta.fecha_medicion}</StyledTD>
                            </tr>
                        )) : <tr><StyledTD colSpan="7" className="text-center">No hay alertas disponibles.</StyledTD>
                        </tr>}
                        </tbody>
                    </Table>

                    {/* Modal de Recomendación */}
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
