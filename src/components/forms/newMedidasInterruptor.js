import '../../styles/spinner.css'
import React, {useEffect, useState} from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {DropZone} from '../tools/dropZone'
import {
    DivForm,
    InputForm,
    PButton,
    SButton,
    StyledForm,
    StyledFormSelect,
    TitleReport
} from '../tools/styleContent'
import {Alert, Container} from 'react-bootstrap'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {getInterruptores, createMedidasInterruptores} from '../../services/interruptor.services'
import {Spinner} from '../tools/spinner'
import {useNavigate} from 'react-router-dom'
import {UseLogout2} from '../../hooks/useLogout2'
import RequiredLabel from "../tools/requiredLabel"
import {dsvFormat} from 'd3'
import * as XLSX from 'xlsx'

export const NewMedidasInterruptor = () => {

    const nav = useNavigate()
    const {logOut} = UseLogout2()

    const [interruptor, setInterruptor] = useState('')
    const [interruptores, setInterruptores] = useState([])
    const [loadingInterruptores, setLoadingInterruptores] = useState(true)

    const [docArchivo1, setDocArchivo1] = useState([])
    const [docArchivo2, setDocArchivo2] = useState([])
    const [docArchivo3, setDocArchivo3] = useState([])

    const [tiempoApertura, setTiempoApertura] = useState('')
    const [tiempoCierre, setTiempoCierre] = useState('')
    const [numeroOperaciones, setNumeroOperaciones] = useState('')
    const [corrienteFalla, setCorrienteFalla] = useState('')
    const [resistenciaContactos, setResistenciaContactos] = useState('')
    const [fechaMantenimiento, setFechaMantenimiento] = useState('')
    // eslint-disable-next-line no-unused-vars
    const [fase, setFase] = useState('')
    const [faseDetectada, setFaseDetectada] = useState(false)

    const [archivos2y3Habilitados, setArchivos2y3Habilitados] = useState(false)
    const [errorFase, setErrorFase] = useState(false)
    const [errorNumeroOperaciones, setErrorNumeroOperaciones] = useState(false)

    const [formError, setFormError] = useState(false)
    const [show, setShow] = useState(false)
    const [showAlert, setShowAlert] = useState(false)
    const [title, setTitle] = useState('')
    const [subTitle, setSubTitle] = useState('')
    const [message, setMessage] = useState('')
    const [showSpinner, setShowSpinner] = useState(false)

    const handleCloseModal = () => {
        setShow(false)
    }

    useEffect(() => {
        const fetchInterruptores = async () => {
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const response = await getInterruptores(user.token)
                setInterruptores(response)
                setLoadingInterruptores(false)
                return response
            } catch (error) {
                console.error('Error al cargar los interruptores:', error)
                logOut()
            }
        }

        fetchInterruptores().then(() => {
        })
    }, [logOut])

    useEffect(() => {
        if (faseDetectada && interruptor) {
            setArchivos2y3Habilitados(true)
        } else {
            setArchivos2y3Habilitados(false)
        }
    }, [faseDetectada, interruptor])

    useEffect(() => {
        if (interruptor && faseDetectada && docArchivo2.length > 0) {
            setNumeroOperaciones('')
            setErrorNumeroOperaciones(false)

            const file = docArchivo2[0]
            const reader = new FileReader()

            reader.onload = (e) => {
                try {
                    const data = new Uint8Array(e.target.result)
                    const workbook = XLSX.read(data, { type: 'array' })

                    if (!workbook.SheetNames.includes('BASE')) {
                        setErrorNumeroOperaciones(true)
                        return
                    }

                    const worksheet = workbook.Sheets['BASE']
                    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

                    let headerRowIndex = -1
                    let headers = []

                    for (let i = 0; i < rawData.length; i++) {
                        const row = rawData[i]
                        if (row.some(cell => cell && cell.toString().includes('Nomenclatura Operativa'))) {
                            headerRowIndex = i
                            headers = row
                            break
                        }
                    }

                    if (headerRowIndex === -1) {
                        setErrorNumeroOperaciones(true)
                        return
                    }

                    const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                        header: headers,
                        range: headerRowIndex + 1,
                        defval: ''
                    })

                    const interruptorSeleccionado = interruptores.find(
                        i => i.idinterruptores === parseInt(interruptor)
                    )

                    if (!interruptorSeleccionado) {
                        setErrorNumeroOperaciones(true)
                        return
                    }

                    const dispositivoNombre = interruptorSeleccionado.nombre

                    const filasFiltradas = jsonData.filter(row => {
                        const nomenclatura = row['Nomenclatura Operativa'] || ''
                        return nomenclatura.toString().trim() === dispositivoNombre.trim()
                    })

                    if (filasFiltradas.length === 0) {
                        setErrorNumeroOperaciones(true)
                        return
                    }

                    let valoresR = []
                    filasFiltradas.forEach(row => {
                        const valorR = row['Numero Operaciones Tripolar']
                        if (valorR && valorR !== '' && !isNaN(parseFloat(valorR))) {
                            valoresR.push(parseFloat(valorR))
                        }
                    })

                    if (valoresR.length > 0) {
                        const maxR = Math.max(...valoresR)
                        setNumeroOperaciones(maxR)
                        setErrorNumeroOperaciones(false)
                        return
                    }

                    let valoresFases = []
                    filasFiltradas.forEach(row => {
                        if (fase === 'G') {
                            const valorA = row['Numero Operaciones Polo A']
                            const valorB = row['Numero Operaciones Polo B']
                            const valorC = row['Numero Operaciones Polo c']

                            if (valorA && valorA !== '' && !isNaN(parseFloat(valorA))) {
                                valoresFases.push(parseFloat(valorA))
                            }
                            if (valorB && valorB !== '' && !isNaN(parseFloat(valorB))) {
                                valoresFases.push(parseFloat(valorB))
                            }
                            if (valorC && valorC !== '' && !isNaN(parseFloat(valorC))) {
                                valoresFases.push(parseFloat(valorC))
                            }
                        } else {
                            let valorFase = null

                            if (fase === 'A') {
                                valorFase = row['Numero Operaciones Polo A']
                            } else if (fase === 'B') {
                                valorFase = row['Numero Operaciones Polo B']
                            } else if (fase === 'C') {
                                valorFase = row['Numero Operaciones Polo c']
                            }

                            if (valorFase && valorFase !== '' && !isNaN(parseFloat(valorFase))) {
                                valoresFases.push(parseFloat(valorFase))
                            }
                        }
                    })

                    if (valoresFases.length > 0) {
                        const maxFase = Math.max(...valoresFases)
                        setNumeroOperaciones(maxFase)
                        setErrorNumeroOperaciones(false)
                        return
                    }

                    setErrorNumeroOperaciones(true)

                } catch (error) {
                    console.error('Error al reprocesar el archivo Excel:', error)
                    setErrorNumeroOperaciones(true)
                }
            }

            reader.readAsArrayBuffer(file)
        }
    }, [interruptor, interruptores, fase, faseDetectada, docArchivo2])

    const loadFileArchivo1 = (list) => {
        setShowSpinner(true)
        setDocArchivo1((prevList) => [...prevList, ...list])

        const file = list[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const text = e.target.result
                const semicolonParser = dsvFormat(';')
                const data = semicolonParser.parse(text)

                const timestampColumn = data.columns[0]

                const filteredData = data.filter(row =>
                    row['Functions structure'] &&
                    row['Functions structure'].includes('Circuit Breaker:Circuit break.') &&
                    row['Name'] &&
                    row['Name'].includes('Break.-current phs')
                )

                if (filteredData.length === 0) {
                    console.warn('No se encontraron datos con los criterios especificados en el archivo CSV')
                    setErrorFase(true)
                    setFaseDetectada(false)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                filteredData.sort((a, b) => {
                    const dateA = new Date(a[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                    const dateB = new Date(b[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                    return dateB - dateA
                })

                const mostRecent = filteredData[0]

                const valueMatch = mostRecent['Value'].match(/(\d+(?:\.\d+)?)/);
                if (valueMatch) {
                    const numericValue = parseFloat(valueMatch[1])
                    setCorrienteFalla(numericValue)
                }

                const faseMatch = mostRecent['Name'].match(/phs ([ABC])/);
                if (faseMatch) {
                    setFase(faseMatch[1])
                    setFaseDetectada(true)
                    setErrorFase(false)
                } else {
                    console.log('No se detectó fase específica, usando fase genérica G')
                    setFase('G')
                    setFaseDetectada(true)
                    setErrorFase(false)
                }

                const definitiveTrips = data.filter(row =>
                    row['Functions structure'] &&
                    row['Functions structure'].includes('Circuit Breaker:Circuit break.') &&
                    row['Name'] &&
                    row['Name'].includes('Definitive trip')
                )

                if (definitiveTrips.length >= 2) {
                    definitiveTrips.sort((a, b) => {
                        const dateA = new Date(a[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                        const dateB = new Date(b[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                        return dateB - dateA
                    })

                    const trip1 = definitiveTrips[0]
                    const trip2 = definitiveTrips[1]

                    const val1 = trip1['Value'].toLowerCase()
                    const val2 = trip2['Value'].toLowerCase()

                    let offRecord, onRecord

                    if ((val1 === 'off' || val1 === 'false') && (val2 === 'on' || val2 === 'true')) {
                        offRecord = trip1
                        onRecord = trip2
                    } else if ((val2 === 'off' || val2 === 'false') && (val1 === 'on' || val1 === 'true')) {
                        offRecord = trip2
                        onRecord = trip1
                    }

                    if (offRecord && onRecord) {
                        const offTime = offRecord['Relative time']
                        const onTime = onRecord['Relative time']

                        const parseRelativeTime = (timeStr) => {
                            const isNegative = timeStr.startsWith('-')
                            const cleanStr = timeStr.replace('-', '')
                            const parts = cleanStr.split(':')

                            if (parts.length === 4) {
                                const seconds = parseFloat(parts[3])
                                const minutes = parseInt(parts[2]) || 0
                                const hours = parseInt(parts[1]) || 0
                                const days = parseInt(parts[0]) || 0

                                const totalMs = (days * 24 * 60 * 60 * 1000) +
                                               (hours * 60 * 60 * 1000) +
                                               (minutes * 60 * 1000) +
                                               (seconds * 1000)

                                return isNegative ? -totalMs : totalMs
                            }
                            return 0
                        }

                        const offTimeMs = parseRelativeTime(offTime)
                        const onTimeMs = parseRelativeTime(onTime)

                        const tiempoAperturaMs = Math.abs(offTimeMs - onTimeMs)
                        setTiempoApertura(Math.round(tiempoAperturaMs))
                    }
                }

            } catch (error) {
                console.error('Error al procesar el archivo CSV:', error)
                setErrorFase(true)
                setFaseDetectada(false)
                window.scrollTo({top: 0, behavior: 'smooth'})
            }
            setShowSpinner(false)
        }

        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error)
            setShowSpinner(false)
        }

        reader.readAsText(file)
    }

    const loadFileArchivo2 = (list) => {
        setShowSpinner(true)
        setDocArchivo2((prevList) => [...prevList, ...list])

        const file = list[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                if (!workbook.SheetNames.includes('BASE')) {
                    console.error('No se encontró la hoja "BASE" en el archivo Excel')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                const worksheet = workbook.Sheets['BASE']
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

                let headerRowIndex = -1
                let headers = []

                for (let i = 0; i < rawData.length; i++) {
                    const row = rawData[i]
                    if (row.some(cell => cell && cell.toString().includes('Nomenclatura Operativa'))) {
                        headerRowIndex = i
                        headers = row
                        break
                    }
                }

                if (headerRowIndex === -1) {
                    console.error('No se encontró la fila de headers en el archivo Excel')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: headers,
                    range: headerRowIndex + 1,
                    defval: ''
                })

                const interruptorSeleccionado = interruptores.find(
                    i => i.idinterruptores === parseInt(interruptor)
                )

                if (!interruptorSeleccionado) {
                    console.error('No se pudo obtener el nombre del interruptor seleccionado')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                const dispositivoNombre = interruptorSeleccionado.nombre

                const filasFiltradas = jsonData.filter(row => {
                    const nomenclatura = row['Nomenclatura Operativa'] || ''
                    return nomenclatura.toString().trim() === dispositivoNombre.trim()
                })

                if (filasFiltradas.length === 0) {
                    console.error('No se encontró el dispositivo en el archivo Excel')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                let valoresR = []

                filasFiltradas.forEach(row => {
                    const valorR = row['Numero Operaciones Tripolar']
                    if (valorR && valorR !== '' && !isNaN(parseFloat(valorR))) {
                        valoresR.push(parseFloat(valorR))
                    }
                })

                if (valoresR.length > 0) {
                    const maxR = Math.max(...valoresR)
                    setNumeroOperaciones(maxR)
                    setErrorNumeroOperaciones(false)
                    setShowSpinner(false)
                    return
                }

                let valoresFases = []

                filasFiltradas.forEach(row => {
                    if (fase === 'G') {
                        const valorA = row['Numero Operaciones Polo A']
                        const valorB = row['Numero Operaciones Polo B']
                        const valorC = row['Numero Operaciones Polo c']

                        if (valorA && valorA !== '' && !isNaN(parseFloat(valorA))) {
                            valoresFases.push(parseFloat(valorA))
                        }
                        if (valorB && valorB !== '' && !isNaN(parseFloat(valorB))) {
                            valoresFases.push(parseFloat(valorB))
                        }
                        if (valorC && valorC !== '' && !isNaN(parseFloat(valorC))) {
                            valoresFases.push(parseFloat(valorC))
                        }
                    } else {
                        let valorFase = null

                        if (fase === 'A') {
                            valorFase = row['Numero Operaciones Polo A']
                        } else if (fase === 'B') {
                            valorFase = row['Numero Operaciones Polo B']
                        } else if (fase === 'C') {
                            valorFase = row['Numero Operaciones Polo c']
                        }

                        if (valorFase && valorFase !== '' && !isNaN(parseFloat(valorFase))) {
                            valoresFases.push(parseFloat(valorFase))
                        }
                    }
                })

                if (valoresFases.length > 0) {
                    const maxFase = Math.max(...valoresFases)
                    setNumeroOperaciones(maxFase)
                    setErrorNumeroOperaciones(false)
                    setShowSpinner(false)
                    return
                }

                console.error('No se encontraron mediciones en ninguna columna')
                setErrorNumeroOperaciones(true)
                window.scrollTo({top: 0, behavior: 'smooth'})

            } catch (error) {
                console.error('Error al procesar el archivo Excel:', error)
                setErrorNumeroOperaciones(true)
                window.scrollTo({top: 0, behavior: 'smooth'})
            }
            setShowSpinner(false)
        }

        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error)
            setErrorNumeroOperaciones(true)
            window.scrollTo({top: 0, behavior: 'smooth'})
            setShowSpinner(false)
        }

        reader.readAsArrayBuffer(file)
    }

    const loadFileArchivo3 = (list) => {
        setShowSpinner(true)
        setDocArchivo3((prevList) => [...prevList, ...list])

        const file = list[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                if (workbook.SheetNames.includes('Contact Resistance')) {
                    const worksheet = workbook.Sheets['Contact Resistance']
                    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

                    if (fase === 'G') {
                        const valoresFases = []
                        const fases = ['A', 'B', 'C']

                        fases.forEach(f => {
                            for (let i = 0; i < rawData.length; i++) {
                                const row = rawData[i]
                                const columnaC = row[2] ? row[2].toString().trim() : ''
                                const columnaF = row[5]

                                if (columnaC === f && columnaF && columnaF !== '' && !isNaN(parseFloat(columnaF))) {
                                    valoresFases.push(parseFloat(columnaF))
                                }
                            }
                        })

                        if (valoresFases.length > 0) {
                            const minValor = Math.min(...valoresFases)
                            setResistenciaContactos(minValor)
                        }

                    } else {
                        for (let i = 0; i < rawData.length; i++) {
                            const row = rawData[i]
                            const columnaC = row[2] ? row[2].toString().trim() : ''
                            const columnaF = row[5]

                            if (columnaC === fase && columnaF && columnaF !== '' && !isNaN(parseFloat(columnaF))) {
                                setResistenciaContactos(parseFloat(columnaF))
                                break
                            }
                        }
                    }
                } else {
                    console.error('No se encontró la hoja "Contact Resistance" en el archivo Excel')
                }

                if (workbook.SheetNames.includes('C Timing')) {
                    const worksheetTiempos = workbook.Sheets['C Timing']
                    const dataTiempos = XLSX.utils.sheet_to_json(worksheetTiempos, { header: 1, defval: '' })

                    let closingTimeColIndex = -1
                    for (let i = 0; i < Math.min(100, dataTiempos.length); i++) {
                        const row = dataTiempos[i]
                        for (let j = 0; j < row.length; j++) {
                            const cell = row[j] ? row[j].toString() : ''
                            if (cell.includes('Closing time')) {
                                closingTimeColIndex = j
                                break
                            }
                        }
                        if (closingTimeColIndex !== -1) break
                    }

                    if (closingTimeColIndex !== -1) {
                        const faseMap = { 'A': 'R', 'B': 'S', 'C': 'T' }

                        // Soporta formato viejo (FASE R/S/T) y nuevo (A/B/C directo)
                        const matchFase = (columnaA, faseLetra) => {
                            const rst = faseMap[faseLetra] || faseLetra
                            return columnaA.match(new RegExp(`FASE ${rst}`, 'i')) ||
                                   columnaA === faseLetra
                        }

                        if (fase === 'G') {
                            const valoresFases = []

                            ;['A', 'B', 'C'].forEach(f => {
                                for (let i = 0; i < dataTiempos.length; i++) {
                                    const row = dataTiempos[i]
                                    const columnaA = row[0] ? row[0].toString().trim() : ''
                                    const valorTiempo = row[closingTimeColIndex]

                                    if (matchFase(columnaA, f) &&
                                        valorTiempo && valorTiempo !== '' && !isNaN(parseFloat(valorTiempo))) {
                                        valoresFases.push(parseFloat(valorTiempo))
                                    }
                                }
                            })

                            if (valoresFases.length > 0) {
                                const maxValor = Math.max(...valoresFases)
                                setTiempoCierre(maxValor * 1000)
                            }

                        } else {
                            for (let i = 0; i < dataTiempos.length; i++) {
                                const row = dataTiempos[i]
                                const columnaA = row[0] ? row[0].toString().trim() : ''
                                const valorTiempo = row[closingTimeColIndex]

                                if (matchFase(columnaA, fase) &&
                                    valorTiempo && valorTiempo !== '' && !isNaN(parseFloat(valorTiempo))) {
                                    setTiempoCierre(parseFloat(valorTiempo) * 1000)
                                    break
                                }
                            }
                        }
                    }
                } else {
                    console.error('No se encontró la hoja "C Timing" en el archivo Excel')
                }

            } catch (error) {
                console.error('Error al procesar el archivo Excel:', error)
            }
            setShowSpinner(false)
        }

        reader.onerror = (error) => {
            console.error('Error al leer el archivo:', error)
            setShowSpinner(false)
        }

        reader.readAsArrayBuffer(file)
    }

    const deleteDocArchivo1 = (e) => {
        e.preventDefault()
        setDocArchivo1([])
        setCorrienteFalla('')
        setTiempoApertura('')
        setFase('')
        setFaseDetectada(false)
        setErrorFase(false)
    }

    const deleteDocArchivo2 = (e) => {
        e.preventDefault()
        setDocArchivo2([])
        setNumeroOperaciones('')
        setErrorNumeroOperaciones(false)
    }

    const deleteDocArchivo3 = (e) => {
        e.preventDefault()
        setDocArchivo3([])
        setResistenciaContactos('')
        setTiempoCierre('')
    }

    const crearMedicion = async (event) => {
        setShowSpinner(true)
        event.preventDefault()

        if (!interruptor || !tiempoApertura || !tiempoCierre || !numeroOperaciones ||
            !corrienteFalla || !resistenciaContactos || !fechaMantenimiento) {
            setShowAlert(true)
            setFormError(true)
            window.scrollTo({top: 0, behavior: 'smooth'})
            setShowSpinner(false)
            return
        }

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))

            const data = {
                Interruptores_idInterruptores: parseInt(interruptor),
                numero_operaciones: parseInt(numeroOperaciones),
                corriente_falla: parseFloat(parseFloat(corrienteFalla).toFixed(6)),
                tiempo_apertura_A: parseFloat(parseFloat(tiempoApertura).toFixed(6)),
                tiempo_apertura_B: parseFloat(parseFloat(tiempoApertura).toFixed(6)),
                tiempo_apertura_C: parseFloat(parseFloat(tiempoApertura).toFixed(6)),
                tiempo_cierre_A: parseFloat(parseFloat(tiempoCierre).toFixed(6)),
                tiempo_cierre_B: parseFloat(parseFloat(tiempoCierre).toFixed(6)),
                tiempo_cierre_C: parseFloat(parseFloat(tiempoCierre).toFixed(6)),
                resistencia_contactos_R: parseFloat(parseFloat(resistenciaContactos).toFixed(6)),
                resistencia_contactos_S: parseFloat(parseFloat(resistenciaContactos).toFixed(6)),
                resistencia_contactos_T: parseFloat(parseFloat(resistenciaContactos).toFixed(6)),
                fecha_mantenimiento: fechaMantenimiento,
            }

            const response = await createMedidasInterruptores(user.token, data)

            setTitle('Medición Registrada')
            setSubTitle('ID: ' + response.id_alerta)
            setMessage(
                `La medición se registró exitosamente.\n\n` +
                `Índice Mecánico (I_DM): ${response.I_DM}\n` +
                `Índice Eléctrico (I_EE): ${response.I_EE}\n` +
                `Índice de Salud (I_M): ${response.I_M}\n` +
                `Condición: ${response.condicion}`
            )

            limpiarFormulario()
        } catch (e) {
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

    const limpiarFormulario = () => {
        setInterruptor('')
        setTiempoApertura('')
        setTiempoCierre('')
        setNumeroOperaciones('')
        setCorrienteFalla('')
        setResistenciaContactos('')
        setFechaMantenimiento('')
        setFase('')
        setFaseDetectada(false)
        setDocArchivo1([])
        setDocArchivo2([])
        setDocArchivo3([])
        setErrorFase(false)
        setErrorNumeroOperaciones(false)
        setFormError(false)
        setShowAlert(false)
        window.scrollTo({top: 0, behavior: 'smooth'})
    }

    const handleConfirmSubmit = (text) => {
        if (text === 'Cancel') {
            nav('/alertasInterruptores')
        }

        if (text === 'Acept') {
            setShow(false)
        }
    }

    const showCancelModal = (event) => {
        event.preventDefault()
        setShow(true)
        setTitle('Cancelar Medición')
        setSubTitle('')
        setMessage('¿Estás seguro de que deseas cancelar el registro de medición?')
    }

    return (
        <DivForm className='newReportContent'>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <StyledForm onSubmit={crearMedicion}>
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
                        {
                            errorFase ? (
                                    <Alert
                                        variant="danger"
                                        onClose={() => setErrorFase(false)}
                                        dismissible
                                        className='alert-center'
                                    >
                                        <p>
                                            No se logró obtener la fase del archivo CSV. Por favor, verifique que el archivo contenga datos válidos con información de fase (phs A, B o C).
                                        </p>
                                    </Alert>
                                ) :
                                (<></>)
                        }
                        {
                            errorNumeroOperaciones ? (
                                    <Alert
                                        variant="danger"
                                        onClose={() => setErrorNumeroOperaciones(false)}
                                        dismissible
                                        className='alert-center'
                                    >
                                        <p>
                                            No se encontró medición del número de operaciones para el dispositivo seleccionado en el archivo Excel. Por favor, verifique que el archivo contenga la hoja "BASE" y que existan datos del dispositivo en las columnas de operaciones.
                                        </p>
                                    </Alert>
                                ) :
                                (<></>)
                        }
                        <Row xs={12}>
                            <Col xs={12} md={4}>
                                <Col xs={12}>
                                    <RequiredLabel>Archivo Corriente falla y tiempo de apertura</RequiredLabel>
                                </Col>
                                {
                                    docArchivo1.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargó el Archivo</TitleReport>
                                            <SButton onClick={deleteDocArchivo1}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                     viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                                                        fill="#E40613"/>
                                                </svg>
                                            </SButton>
                                        </>
                                    ) : (
                                        <Col xs={12}>
                                            <DropZone id={'fileArchivo1'} loadFile={loadFileArchivo1} type={'.xlsx,.csv'}/>
                                        </Col>
                                    )
                                }
                            </Col>
                            <Col xs={12} md={4} style={{opacity: archivos2y3Habilitados ? 1 : 0.5, pointerEvents: archivos2y3Habilitados ? 'auto' : 'none'}}>
                                <Col xs={12}>
                                    <RequiredLabel>Archivo Numero de operaciones</RequiredLabel>
                                </Col>
                                {
                                    docArchivo2.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargó el Archivo</TitleReport>
                                            <SButton onClick={deleteDocArchivo2}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                     viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                                                        fill="#E40613"/>
                                                </svg>
                                            </SButton>
                                        </>
                                    ) : (
                                        <Col xs={12}>
                                            <DropZone id={'fileArchivo2'} loadFile={loadFileArchivo2} type={'.xlsx,.csv'} disabled={!archivos2y3Habilitados}/>
                                        </Col>
                                    )
                                }
                                {!archivos2y3Habilitados && (
                                    <small style={{color: '#6c757d', fontSize: '0.85rem', marginTop: '5px', display: 'block'}}>
                                        {!faseDetectada && !interruptor
                                            ? 'Debe cargar el archivo 1 con fase válida y seleccionar un interruptor'
                                            : !faseDetectada
                                                ? 'Debe cargar el archivo 1 con una fase válida'
                                                : 'Debe seleccionar un interruptor'}
                                    </small>
                                )}
                            </Col>
                            <Col xs={12} md={4} style={{opacity: archivos2y3Habilitados ? 1 : 0.5, pointerEvents: archivos2y3Habilitados ? 'auto' : 'none'}}>
                                <Col xs={12}>
                                    <RequiredLabel>Archivo Resistencia de contactos</RequiredLabel>
                                </Col>
                                {
                                    docArchivo3.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargó el Archivo</TitleReport>
                                            <SButton onClick={deleteDocArchivo3}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24"
                                                     viewBox="0 0 24 24" fill="none">
                                                    <path
                                                        d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z"
                                                        fill="#E40613"/>
                                                </svg>
                                            </SButton>
                                        </>
                                    ) : (
                                        <Col xs={12}>
                                            <DropZone id={'fileArchivo3'} loadFile={loadFileArchivo3} type={'.xlsx,.csv'} disabled={!archivos2y3Habilitados}/>
                                        </Col>
                                    )
                                }
                                {!archivos2y3Habilitados && (
                                    <small style={{color: '#6c757d', fontSize: '0.85rem', marginTop: '5px', display: 'block'}}>
                                        {!faseDetectada && !interruptor
                                            ? 'Debe cargar el archivo 1 con fase válida y seleccionar un interruptor'
                                            : !faseDetectada
                                                ? 'Debe cargar el archivo 1 con una fase válida'
                                                : 'Debe seleccionar un interruptor'}
                                    </small>
                                )}
                            </Col>
                        </Row>
                        <hr></hr>
                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!interruptor && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Interruptor</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <StyledFormSelect
                                        aria-label="Default select example"
                                        value={interruptor}
                                        name='interruptor'
                                        placeholder='Interruptor'
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
                        </Row>
                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!tiempoApertura && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese el tiempo de apertura (ms)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        step='0.01'
                                        value={tiempoApertura}
                                        name='tiempoApertura'
                                        placeholder='Tiempo en milisegundos'
                                        onChange={({target}) => setTiempoApertura(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${!tiempoCierre && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese el tiempo de cierre (ms)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        step='0.01'
                                        value={tiempoCierre}
                                        name='tiempoCierre'
                                        placeholder='Tiempo en milisegundos'
                                        onChange={({target}) => setTiempoCierre(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!numeroOperaciones && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese el número de operaciones</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={numeroOperaciones}
                                        name='numeroOperaciones'
                                        placeholder='Número de operaciones'
                                        onChange={({target}) => setNumeroOperaciones(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${!corrienteFalla && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese la corriente de falla (A)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        step='0.01'
                                        value={corrienteFalla}
                                        name='corrienteFalla'
                                        placeholder='Corriente en A'
                                        onChange={({target}) => setCorrienteFalla(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!resistenciaContactos && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese la resistencia de contactos (Ω)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        step='0.01'
                                        value={resistenciaContactos}
                                        name='resistenciaContactos'
                                        placeholder='Resistencia en Ω'
                                        onChange={({target}) => setResistenciaContactos(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${!fechaMantenimiento && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese la fecha del último mantenimiento</RequiredLabel>
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
                        <br></br>
                        <Row xs={12}>
                            <Col xs={0} lg={3}>
                            </Col>
                            <Col xs={12} lg={3}>
                                <SButton onClick={showCancelModal}>Cancelar</SButton>
                            </Col>
                            <Col xs={12} lg={3}>
                                <PButton>Registrar Medición</PButton>
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