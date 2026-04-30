/* eslint-disable react/prop-types */
import React, {useEffect, useState} from 'react'
import {Col, Container, Row, Table} from 'react-bootstrap'
import {
    ButtonBox,
    DivForm,
    InputForm,
    LabelForm,
    PButton,
    PTitleFilter,
    SButton,
    StyledForm,
    StyledFormSelect,
    StyledTD,
    StyledTH
} from '../tools/styleContent'
import {getMedicionesInterruptores, getInterruptores} from '../../services/interruptor.services'
import {Spinner} from '../tools/spinner'
import {UseLogout2} from '../../hooks/useLogout2'

export const ViewMeasurementInterruptor = () => {
    const {logOut} = UseLogout2()
    const [mediciones, setMediciones] = useState([])
    const [medicionesOriginales, setMedicionesOriginales] = useState([])
    const [interruptores, setInterruptores] = useState([])
    const [showSpinner, setShowSpinner] = useState(false)
    const [idInterruptor, setIdInterruptor] = useState('')
    const [fechaDesde, setFechaDesde] = useState('')
    const [fechaHasta, setFechaHasta] = useState('')

    useEffect(() => {
        const fetchData = async () => {
            try {
                setShowSpinner(true)
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const [medicionesData, interruptoresData] = await Promise.all([
                    getMedicionesInterruptores(user.token),
                    getInterruptores(user.token)
                ])
                setMediciones(medicionesData)
                setMedicionesOriginales(medicionesData)
                setInterruptores(interruptoresData)
            } catch (error) {
                console.error('Error al cargar mediciones:', error)
                logOut()
            } finally {
                setShowSpinner(false)
            }
        }
        fetchData()
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const getNombreInterruptor = (id) => {
        const interruptor = interruptores.find(i => i.idinterruptores === id)
        return interruptor ? interruptor.nombre : id
    }

    const filterData = (e) => {
        e.preventDefault()
        let filtered = medicionesOriginales

        if (idInterruptor) {
            filtered = filtered.filter(m => m.Interruptores_idInterruptores === parseInt(idInterruptor))
        }

        setMediciones(filtered)
    }

    const clear = (e) => {
        e.preventDefault()
        setIdInterruptor('')
        setFechaDesde('')
        setFechaHasta('')
        setMediciones(medicionesOriginales)
    }

    const downloadCSV = () => {
        if (mediciones.length === 0) {
            alert('No hay datos para descargar')
            return
        }

        const headers = [
            'ID', 'Interruptor', 'I_DM', 'I_EE', 'I_M',
            'Num. Operaciones', 'Corriente Falla',
            'T. Apertura A', 'T. Apertura B', 'T. Apertura C',
            'T. Cierre A', 'T. Cierre B', 'T. Cierre C',
            'Res. Contactos R', 'Res. Contactos S', 'Res. Contactos T'
        ]

        const rows = mediciones.map(m => [
            m.idMediciones_Interruptores,
            getNombreInterruptor(m.Interruptores_idInterruptores),
            m.I_DM ?? 'N/A',
            m.I_EE ?? 'N/A',
            m.I_M ?? 'N/A',
            m.numero_operaciones,
            m.corriente_falla,
            m.tiempo_apertura_A,
            m.tiempo_apertura_B,
            m.tiempo_apertura_C,
            m.tiempo_cierre_A,
            m.tiempo_cierre_B,
            m.tiempo_cierre_C,
            m.resistencia_contactos_R,
            m.resistencia_contactos_S,
            m.resistencia_contactos_T
        ])

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.map(cell => `"${cell}"`).join(','))
        ].join('\n')

        const blob = new Blob(['﻿' + csvContent], {type: 'text/csv;charset=utf-8;'})
        const link = document.createElement('a')
        link.setAttribute('href', URL.createObjectURL(blob))
        link.setAttribute('download', `mediciones_interruptores_${new Date().toISOString().split('T')[0]}.csv`)
        link.style.visibility = 'hidden'
        document.body.appendChild(link)
        link.click()
        document.body.removeChild(link)
    }

    return (
        <DivForm>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <PTitleFilter>
                        <svg xmlns="http://www.w3.org/2000/svg" width="30" height="24" viewBox="0 0 30 24" fill="none">
                            <g clipPath="url(#clip0_1559_364)">
                                <path d="M28.6172 17.4984C28.7391 16.8375 28.7391 16.1625 28.6172 15.5016L29.8266 14.8031C29.9672 14.7234 30.0281 14.5594 29.9812 14.4047C29.6672 13.3922 29.1281 12.4734 28.425 11.7141C28.3172 11.5969 28.1438 11.5687 28.0031 11.6484L26.7937 12.3469C26.2828 11.9109 25.6969 11.5734 25.0641 11.3484V9.95156C25.0641 9.79219 24.9516 9.65156 24.7969 9.61875C23.7516 9.38437 22.6875 9.39375 21.6937 9.61875C21.5391 9.65156 21.4266 9.79219 21.4266 9.95156V11.3484C20.7938 11.5734 20.2078 11.9109 19.6969 12.3469L18.4875 11.6484C18.3516 11.5687 18.1734 11.5969 18.0656 11.7141C17.3625 12.4734 16.8234 13.3922 16.5094 14.4047C16.4625 14.5594 16.5281 14.7234 16.6641 14.8031L17.8734 15.5016C17.7516 16.1625 17.7516 16.8375 17.8734 17.4984L16.6641 18.1969C16.5234 18.2766 16.4625 18.4406 16.5094 18.5953C16.8234 19.6078 17.3625 20.5219 18.0656 21.2859C18.1734 21.4031 18.3469 21.4313 18.4875 21.3516L19.6969 20.6531C20.2078 21.0891 20.7938 21.4266 21.4266 21.6516V23.0484C21.4266 23.2078 21.5391 23.3484 21.6937 23.3812C22.7391 23.6156 23.8031 23.6062 24.7969 23.3812C24.9516 23.3484 25.0641 23.2078 25.0641 23.0484V21.6516C25.6969 21.4266 26.2828 21.0891 26.7937 20.6531L28.0031 21.3516C28.1391 21.4313 28.3172 21.4031 28.425 21.2859C29.1281 20.5266 29.6672 19.6078 29.9812 18.5953C30.0281 18.4406 29.9625 18.2766 29.8266 18.1969L28.6172 17.4984ZM23.25 18.7734C21.9938 18.7734 20.9766 17.7516 20.9766 16.5C20.9766 15.2484 21.9984 14.2266 23.25 14.2266C24.5016 14.2266 25.5234 15.2484 25.5234 16.5C25.5234 17.7516 24.5062 18.7734 23.25 18.7734ZM10.5 12C13.8141 12 16.5 9.31406 16.5 6C16.5 2.68594 13.8141 0 10.5 0C7.18594 0 4.5 2.68594 4.5 6C4.5 9.31406 7.18594 12 10.5 12ZM19.9313 22.6172C19.8234 22.5609 19.7156 22.4953 19.6125 22.4344L19.2422 22.65C18.9609 22.8094 18.6422 22.8984 18.3234 22.8984C17.8125 22.8984 17.3203 22.6828 16.9688 22.3078C16.1109 21.3797 15.4547 20.25 15.0844 19.0453C14.8266 18.2156 15.1734 17.3391 15.9234 16.9031L16.2938 16.6875C16.2891 16.5656 16.2891 16.4438 16.2938 16.3219L15.9234 16.1063C15.1734 15.675 14.8266 14.7937 15.0844 13.9641C15.1266 13.8281 15.1875 13.6922 15.2344 13.5563C15.0563 13.5422 14.8828 13.5 14.7 13.5H13.9172C12.8766 13.9781 11.7188 14.25 10.5 14.25C9.28125 14.25 8.12813 13.9781 7.08281 13.5H6.3C2.82187 13.5 0 16.3219 0 19.8V21.75C0 22.9922 1.00781 24 2.25 24H18.75C19.2234 24 19.6641 23.85 20.025 23.6016C19.9688 23.4234 19.9313 23.2406 19.9313 23.0484V22.6172Z" fill="#E40613"/>
                            </g>
                            <defs>
                                <clipPath id="clip0_1559_364">
                                    <rect width="30" height="24" fill="white"/>
                                </clipPath>
                            </defs>
                        </svg>
                        Mediciones Registradas - Interruptores
                    </PTitleFilter>

                    <StyledForm onSubmit={filterData}>
                        <Row xs={12}>
                            <Col xs={12} md={4}>
                                <LabelForm>Interruptor</LabelForm>
                                <StyledFormSelect
                                    value={idInterruptor}
                                    onChange={({target}) => setIdInterruptor(target.value)}
                                >
                                    <option value="">Todos</option>
                                    {interruptores.map(i => (
                                        <option key={i.idinterruptores} value={i.idinterruptores}>
                                            {i.nombre}
                                        </option>
                                    ))}
                                </StyledFormSelect>
                            </Col>
                            <Col xs={12} md={2}>
                                <LabelForm>Fecha Desde</LabelForm>
                                <InputForm
                                    type="date"
                                    value={fechaDesde}
                                    onChange={({target}) => setFechaDesde(target.value)}
                                />
                            </Col>
                            <Col xs={12} md={2}>
                                <LabelForm>Fecha Hasta</LabelForm>
                                <InputForm
                                    type="date"
                                    value={fechaHasta}
                                    onChange={({target}) => setFechaHasta(target.value)}
                                />
                            </Col>
                            <ButtonBox xs={12} md={2}>
                                <SButton onClick={clear}>Limpiar</SButton>
                            </ButtonBox>
                            <ButtonBox xs={12} md={2}>
                                <PButton type="submit">Filtrar</PButton>
                            </ButtonBox>
                        </Row>
                    </StyledForm>

                    <Row className="mb-3">
                        <Col xs={12} md={3}>
                            <PButton type="button" onClick={downloadCSV} className="w-100">
                                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '5px'}}>
                                    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/>
                                    <polyline points="7 10 12 15 17 10"/>
                                    <line x1="12" y1="15" x2="12" y2="3"/>
                                </svg>
                                CSV
                            </PButton>
                        </Col>
                    </Row>

                    <div style={{overflowX: 'auto', width: '100%'}}>
                    <Table>
                        <thead>
                            <tr>
                                <StyledTH>#</StyledTH>
                                <StyledTH>Interruptor</StyledTH>
                                <StyledTH>I_DM</StyledTH>
                                <StyledTH>I_EE</StyledTH>
                                <StyledTH>I_M</StyledTH>
                                <StyledTH>Num. Operaciones</StyledTH>
                                <StyledTH>Corriente Falla</StyledTH>
                                <StyledTH>T. Apertura A</StyledTH>
                                <StyledTH>T. Apertura B</StyledTH>
                                <StyledTH>T. Apertura C</StyledTH>
                                <StyledTH>T. Cierre A</StyledTH>
                                <StyledTH>T. Cierre B</StyledTH>
                                <StyledTH>T. Cierre C</StyledTH>
                                <StyledTH>Res. R</StyledTH>
                                <StyledTH>Res. S</StyledTH>
                                <StyledTH>Res. T</StyledTH>
                            </tr>
                        </thead>
                        <tbody>
                            {mediciones.length ? mediciones.map((m) => (
                                <tr key={m.idMediciones_Interruptores}>
                                    <StyledTD>{m.idMediciones_Interruptores}</StyledTD>
                                    <StyledTD>{getNombreInterruptor(m.Interruptores_idInterruptores)}</StyledTD>
                                    <StyledTD>{m.I_DM ?? '—'}</StyledTD>
                                    <StyledTD>{m.I_EE ?? '—'}</StyledTD>
                                    <StyledTD>{m.I_M ?? '—'}</StyledTD>
                                    <StyledTD>{m.numero_operaciones}</StyledTD>
                                    <StyledTD>{m.corriente_falla}</StyledTD>
                                    <StyledTD>{m.tiempo_apertura_A}</StyledTD>
                                    <StyledTD>{m.tiempo_apertura_B}</StyledTD>
                                    <StyledTD>{m.tiempo_apertura_C}</StyledTD>
                                    <StyledTD>{m.tiempo_cierre_A}</StyledTD>
                                    <StyledTD>{m.tiempo_cierre_B}</StyledTD>
                                    <StyledTD>{m.tiempo_cierre_C}</StyledTD>
                                    <StyledTD>{m.resistencia_contactos_R}</StyledTD>
                                    <StyledTD>{m.resistencia_contactos_S}</StyledTD>
                                    <StyledTD>{m.resistencia_contactos_T}</StyledTD>
                                </tr>
                            )) : (
                                <tr>
                                    <StyledTD colSpan="16" className="text-center">
                                        No hay mediciones disponibles.
                                    </StyledTD>
                                </tr>
                            )}
                        </tbody>
                    </Table>
                    </div>
                </Container>
            </Col>
            {showSpinner && (
                <div className={'divSpinner'}>
                    <Spinner/>
                </div>
            )}
        </DivForm>
    )
}
