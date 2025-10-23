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
import {getTransformadores} from '../../services/transformer.services'
import {createPronostico} from '../../services/pronostico.services'
import {Spinner} from '../tools/spinner'
import {useNavigate} from 'react-router-dom'
import {UseLogout} from '../../hooks/useLogout'
import RequiredLabel from "../tools/requiredLabel"
import {dsvFormat} from 'd3'
import * as XLSX from 'xlsx'

export const NewPronosticoTransformador = () => {

    const nav = useNavigate()
    const logout = UseLogout()

    const [transformador, setTransformador] = useState('')
    const [transformadores, setTransformadores] = useState([])
    const [loadingTransfo, setLoadingTransfo] = useState(true)

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
    const [fase, setFase] = useState('') // Almacena la fase (A, B, C) detectada del CSV
    const [faseDetectada, setFaseDetectada] = useState(false) // Indica si se detectó una fase válida

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
        const fetchTransformadores = async () => {
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
                const response = await getTransformadores(user.token)
                setTransformadores(response)
                setLoadingTransfo(false)
                return response
            } catch (error) {
                console.error('Error al cargar los transformadores:', error)
            }
        }

        fetchTransformadores().then(() => {
        })
    }, [])

    // Verificar si se deben habilitar los archivos 2 y 3
    useEffect(() => {
        // Solo habilitar si hay fase detectada Y hay transformador seleccionado
        if (faseDetectada && transformador) {
            setArchivos2y3Habilitados(true)
        } else {
            setArchivos2y3Habilitados(false)
        }
    }, [faseDetectada, transformador])

    // Reprocesar archivo Excel cuando cambie el transformador seleccionado
    useEffect(() => {
        // Si hay un transformador seleccionado, fase detectada y archivo Excel ya cargado
        if (transformador && faseDetectada && docArchivo2.length > 0) {
            // Limpiar el número de operaciones actual
            setNumeroOperaciones('')
            setErrorNumeroOperaciones(false)

            // Reprocesar el archivo
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

                    for (let i = 0; i < Math.min(20, rawData.length); i++) {
                        const row = rawData[i]
                        if (row.some(cell => cell && cell.toString().includes('Observaciones'))) {
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

                    const transformadorSeleccionado = transformadores.find(
                        t => t.idtransformadores === parseInt(transformador)
                    )

                    if (!transformadorSeleccionado) {
                        setErrorNumeroOperaciones(true)
                        return
                    }

                    const dispositivoNombre = transformadorSeleccionado.nombre

                    const filasFiltradas = jsonData.filter(row => {
                        const observaciones = row['Observaciones'] || ''
                        return observaciones.toString().trim() === dispositivoNombre.trim()
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
                            // Para fase genérica, tomar valores de todas las fases
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
                            // Para fase específica, tomar solo esa fase
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
    }, [transformador, transformadores, fase, faseDetectada, docArchivo2])

    const loadFileArchivo1 = (list) => {
        setShowSpinner(true)
        setDocArchivo1((prevList) => [...prevList, ...list])

        // Procesar CSV para extraer corriente de falla
        const file = list[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const text = e.target.result
                // Parsear CSV con punto y coma como delimitador
                const semicolonParser = dsvFormat(';')
                const data = semicolonParser.parse(text)

                // El nombre de la columna de timestamp puede incluir BOM y comillas
                const timestampColumn = data.columns[0]

                // Filtrar por "Functions structure" que contenga "Circuit Breaker:Circuit break."
                // y por "Name" que contenga "Break.-current phs"
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

                // Ordenar por timestamp (más reciente primero)
                filteredData.sort((a, b) => {
                    const dateA = new Date(a[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                    const dateB = new Date(b[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                    return dateB - dateA
                })

                // Obtener el primer resultado (más reciente)
                const mostRecent = filteredData[0]

                // Extraer el valor numérico (ej: "1647 A" -> 1647)
                const valueMatch = mostRecent['Value'].match(/(\d+(?:\.\d+)?)/);
                if (valueMatch) {
                    const numericValue = parseFloat(valueMatch[1])
                    setCorrienteFalla(numericValue)
                }

                // Extraer la fase (A, B, o C)
                const faseMatch = mostRecent['Name'].match(/phs ([ABC])/);
                if (faseMatch) {
                    setFase(faseMatch[1])
                    setFaseDetectada(true)
                    setErrorFase(false)
                } else {
                    // Si no se detecta fase específica, usar fase genérica 'G'
                    console.log('No se detectó fase específica, usando fase genérica G')
                    setFase('G')
                    setFaseDetectada(true)
                    setErrorFase(false)
                }

                // ========== EXTRACCIÓN DEL TIEMPO DE APERTURA ==========
                // Filtrar por "Definitive trip"
                const definitiveTrips = data.filter(row =>
                    row['Functions structure'] &&
                    row['Functions structure'].includes('Circuit Breaker:Circuit break.') &&
                    row['Name'] &&
                    row['Name'].includes('Definitive trip')
                )

                if (definitiveTrips.length >= 2) {
                    // Ordenar por timestamp (más reciente primero)
                    definitiveTrips.sort((a, b) => {
                        const dateA = new Date(a[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                        const dateB = new Date(b[timestampColumn].replace(/(\d+)\.(\d+)\.(\d+)/, '$3-$2-$1'))
                        return dateB - dateA
                    })

                    // Obtener los dos registros más recientes
                    const trip1 = definitiveTrips[0]
                    const trip2 = definitiveTrips[1]

                    // Verificar que tengan valores on/off o true/false
                    const val1 = trip1['Value'].toLowerCase()
                    const val2 = trip2['Value'].toLowerCase()

                    let offRecord, onRecord

                    // Determinar cuál es on y cuál es off
                    if ((val1 === 'off' || val1 === 'false') && (val2 === 'on' || val2 === 'true')) {
                        offRecord = trip1
                        onRecord = trip2
                    } else if ((val2 === 'off' || val2 === 'false') && (val1 === 'on' || val1 === 'true')) {
                        offRecord = trip2
                        onRecord = trip1
                    }

                    if (offRecord && onRecord) {
                        // Extraer los valores de "Relative time"
                        const offTime = offRecord['Relative time']
                        const onTime = onRecord['Relative time']

                        // Convertir "Relative time" a milisegundos
                        const parseRelativeTime = (timeStr) => {
                            // Formato: "00:00:00:00.499" o "-00:00:00:00.001"
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

                        // Calcular tiempo de apertura: off - on
                        const tiempoAperturaMs = Math.abs(offTimeMs - onTimeMs)

                        setTiempoApertura(Math.round(tiempoAperturaMs))

                        console.log('Tiempo de apertura calculado:', {
                            offTime,
                            onTime,
                            offTimeMs,
                            onTimeMs,
                            tiempoAperturaMs
                        })
                    }
                }
                // ========== FIN EXTRACCIÓN DEL TIEMPO DE APERTURA ==========

                console.log('CSV procesado exitosamente:', {
                    corrienteFalla: valueMatch ? valueMatch[1] : null,
                    fase: fase,
                    registro: mostRecent
                })

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

        // Procesar Excel para extraer número de operaciones
        const file = list[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                // Verificar que existe la hoja "BASE"
                if (!workbook.SheetNames.includes('BASE')) {
                    console.error('No se encontró la hoja "BASE" en el archivo Excel')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                // Leer la hoja BASE
                const worksheet = workbook.Sheets['BASE']

                // Convertir a JSON - obtener todas las filas como arrays
                const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

                // Buscar la fila de headers
                let headerRowIndex = -1
                let headers = []

                for (let i = 0; i < Math.min(20, rawData.length); i++) {
                    const row = rawData[i]
                    if (row.some(cell => cell && cell.toString().includes('Observaciones'))) {
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

                // Convertir a JSON usando la fila de headers encontrada
                const jsonData = XLSX.utils.sheet_to_json(worksheet, {
                    header: headers,
                    range: headerRowIndex + 1,
                    defval: ''
                })

                // Obtener el nombre del transformador seleccionado
                const transformadorSeleccionado = transformadores.find(
                    t => t.idtransformadores === parseInt(transformador)
                )

                if (!transformadorSeleccionado) {
                    console.error('No se pudo obtener el nombre del transformador seleccionado')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                const dispositivoNombre = transformadorSeleccionado.nombre

                // Buscar el dispositivo en la columna Observaciones
                const filasFiltradas = jsonData.filter(row => {
                    const observaciones = row['Observaciones'] || ''
                    return observaciones.toString().trim() === dispositivoNombre.trim()
                })

                console.log(`Filas encontradas con "${dispositivoNombre}": ${filasFiltradas.length}`)

                if (filasFiltradas.length === 0) {
                    console.error('No se encontró el dispositivo en el archivo Excel')
                    setErrorNumeroOperaciones(true)
                    window.scrollTo({top: 0, behavior: 'smooth'})
                    setShowSpinner(false)
                    return
                }

                // Extraer el mayor valor de la columna R (Numero Operaciones Tripolar)
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
                    console.log('Número de operaciones extraído (columna R):', maxR)
                    setShowSpinner(false)
                    return
                }

                // Si no hay valores en R, buscar en las columnas de fase (S, T, U)
                console.log('No se encontraron valores en columna R, buscando en columnas de fase...')

                let valoresFases = []

                filasFiltradas.forEach(row => {
                    if (fase === 'G') {
                        // Para fase genérica, tomar valores de todas las fases
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
                        // Para fase específica, tomar solo esa fase
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
                    console.log(`Número de operaciones extraído (columna Fase ${fase}):`, maxFase)
                    setShowSpinner(false)
                    return
                }

                // No se encontraron mediciones
                console.error('No se encontraron mediciones en ninguna columna (R, S, T, U)')
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

        // Procesar Excel para extraer resistencia de contactos Y tiempo de cierre
        const file = list[0]
        const reader = new FileReader()

        reader.onload = (e) => {
            try {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, { type: 'array' })

                // ========== EXTRACCIÓN DE RESISTENCIA DE CONTACTOS ==========
                if (workbook.SheetNames.includes('Contact Resistance')) {
                    const worksheet = workbook.Sheets['Contact Resistance']
                    const rawData = XLSX.utils.sheet_to_json(worksheet, { header: 1, defval: '' })

                    if (fase === 'G') {
                        // Para fase genérica, buscar el MENOR valor entre las tres fases
                        console.log('Resistencia - Fase genérica: buscando menor valor entre fases A, B, C')

                        const valoresFases = []
                        const fases = ['A', 'B', 'C']

                        fases.forEach(f => {
                            for (let i = 0; i < rawData.length; i++) {
                                const row = rawData[i]
                                const columnaC = row[2] ? row[2].toString().trim() : ''
                                const columnaF = row[5]

                                if (columnaC === f && columnaF && columnaF !== '' && !isNaN(parseFloat(columnaF))) {
                                    const valor = parseFloat(columnaF)
                                    valoresFases.push(valor)
                                }
                            }
                        })

                        if (valoresFases.length > 0) {
                            const minValor = Math.min(...valoresFases)
                            setResistenciaContactos(minValor)
                            console.log('Resistencia de contactos extraída (menor entre todas las fases):', minValor, 'µΩ')
                        } else {
                            console.log('No se encontraron valores de resistencia para ninguna fase')
                        }

                    } else {
                        // Para fase específica (A, B, o C)
                        console.log(`Resistencia - Buscando valores para fase ${fase}`)

                        for (let i = 0; i < rawData.length; i++) {
                            const row = rawData[i]
                            const columnaC = row[2] ? row[2].toString().trim() : ''
                            const columnaF = row[5]

                            if (columnaC === fase && columnaF && columnaF !== '' && !isNaN(parseFloat(columnaF))) {
                                const valor = parseFloat(columnaF)
                                setResistenciaContactos(valor)
                                console.log(`Resistencia de contactos extraída (Fase ${fase}):`, valor, 'µΩ')
                                break
                            }
                        }
                    }
                } else {
                    console.error('No se encontró la hoja "Contact Resistance" en el archivo Excel')
                }

                // ========== EXTRACCIÓN DE TIEMPO DE CIERRE ==========
                if (workbook.SheetNames.includes('Tiempos C')) {
                    const worksheetTiempos = workbook.Sheets['Tiempos C']
                    const dataTiempos = XLSX.utils.sheet_to_json(worksheetTiempos, { header: 1, defval: '' })

                    // Buscar la columna "Closing time" dinámicamente
                    let closingTimeColIndex = -1
                    for (let i = 0; i < Math.min(100, dataTiempos.length); i++) {
                        const row = dataTiempos[i]
                        for (let j = 0; j < row.length; j++) {
                            const cell = row[j] ? row[j].toString() : ''
                            if (cell.includes('Closing time')) {
                                closingTimeColIndex = j
                                console.log(`Encontrada columna "Closing time" en índice ${j}, fila ${i}`)
                                break
                            }
                        }
                        if (closingTimeColIndex !== -1) break
                    }

                    if (closingTimeColIndex !== -1) {
                        // Mapeo de fases: A=R, B=S, C=T
                        const faseMap = {
                            'A': 'R',
                            'B': 'S',
                            'C': 'T'
                        }

                        if (fase === 'G') {
                            // Para fase genérica, buscar el MAYOR valor entre las tres fases
                            console.log('Tiempo de cierre - Fase genérica: buscando mayor valor entre fases R, S, T')

                            const valoresFases = []
                            const fasesABuscar = ['R', 'S', 'T']

                            fasesABuscar.forEach(f => {
                                for (let i = 0; i < dataTiempos.length; i++) {
                                    const row = dataTiempos[i]
                                    const columnaA = row[0] ? row[0].toString().trim() : ''
                                    const valorTiempo = row[closingTimeColIndex]

                                    if (columnaA.match(new RegExp(`FASE ${f}`, 'i')) &&
                                        valorTiempo && valorTiempo !== '' && !isNaN(parseFloat(valorTiempo))) {
                                        const valor = parseFloat(valorTiempo)
                                        valoresFases.push(valor)
                                    }
                                }
                            })

                            if (valoresFases.length > 0) {
                                const maxValor = Math.max(...valoresFases)
                                const maxValorMs = maxValor * 1000 // Convertir a milisegundos
                                setTiempoCierre(maxValorMs)
                                console.log(`Tiempo de cierre extraído (mayor entre todas las fases): ${maxValor} s = ${maxValorMs} ms`)
                            } else {
                                console.log('No se encontraron valores de tiempo de cierre para ninguna fase')
                            }

                        } else {
                            // Para fase específica (A, B, o C), buscar la fase correspondiente (R, S, o T)
                            const faseABuscar = faseMap[fase] || fase
                            console.log(`Tiempo de cierre - Buscando valores para fase ${fase} (FASE ${faseABuscar})`)

                            for (let i = 0; i < dataTiempos.length; i++) {
                                const row = dataTiempos[i]
                                const columnaA = row[0] ? row[0].toString().trim() : ''
                                const valorTiempo = row[closingTimeColIndex]

                                if (columnaA.match(new RegExp(`FASE ${faseABuscar}`, 'i')) &&
                                    valorTiempo && valorTiempo !== '' && !isNaN(parseFloat(valorTiempo))) {
                                    const valor = parseFloat(valorTiempo)
                                    const valorMs = valor * 1000 // Convertir a milisegundos
                                    setTiempoCierre(valorMs)
                                    console.log(`Tiempo de cierre extraído (Fase ${fase}): ${valor} s = ${valorMs} ms`)
                                    break
                                }
                            }
                        }
                    } else {
                        console.error('No se encontró la columna "Closing time" en la hoja "Tiempos C"')
                    }
                } else {
                    console.error('No se encontró la hoja "Tiempos C" en el archivo Excel')
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

    const generarPronostico = async (event) => {
        setShowSpinner(true)
        event.preventDefault()

        if (!transformador || !tiempoApertura || !tiempoCierre || !numeroOperaciones ||
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
                tipo_equipo: 'transformador',
                transformador: parseInt(transformador),
                tiempo_apertura: parseFloat(tiempoApertura),
                tiempo_cierre: parseFloat(tiempoCierre),
                numero_operaciones: parseInt(numeroOperaciones),
                corriente_falla: parseFloat(corrienteFalla),
                resistencia_contactos: parseFloat(resistenciaContactos),
                fecha_mantenimiento: fechaMantenimiento
            }

            const response = await createPronostico(user.token, data)

            setTitle('Pronóstico Generado')
            setSubTitle('Pronóstico ID: ' + response.data.idpronostico)
            setMessage('El pronóstico se registró exitosamente en el sistema')

            // Limpiar formulario inmediatamente después del éxito
            limpiarFormulario()
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

    const limpiarFormulario = () => {
        setTransformador('')
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
            nav('/')
        }

        if (text === 'Acept') {
            setShow(false)
        }
    }

    const showCancelModal = (event) => {
        event.preventDefault()
        setShow(true)
        setTitle('Cancelar Pronóstico')
        setSubTitle('')
        setMessage('¿Estás seguro de que deseas cancelar la generación de pronóstico?')
    }

    return (
        <DivForm className='newReportContent'>
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <StyledForm onSubmit={generarPronostico}>
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
                                        {!faseDetectada && !transformador
                                            ? 'Debe cargar el archivo 1 con fase válida y seleccionar un transformador'
                                            : !faseDetectada
                                                ? 'Debe cargar el archivo 1 con una fase válida'
                                                : 'Debe seleccionar un transformador'}
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
                                        {!faseDetectada && !transformador
                                            ? 'Debe cargar el archivo 1 con fase válida y seleccionar un transformador'
                                            : !faseDetectada
                                                ? 'Debe cargar el archivo 1 con una fase válida'
                                                : 'Debe seleccionar un transformador'}
                                    </small>
                                )}
                            </Col>
                        </Row>
                        <hr></hr>
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
                                    <RequiredLabel>Ingrese la corriente de falla (kA)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        step='0.01'
                                        value={corrienteFalla}
                                        name='corrienteFalla'
                                        placeholder='Corriente en kA'
                                        onChange={({target}) => setCorrienteFalla(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={12} md={6} className={`${!resistenciaContactos && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese la resistencia de contactos (µΩ)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        step='0.01'
                                        value={resistenciaContactos}
                                        name='resistenciaContactos'
                                        placeholder='Resistencia en µΩ'
                                        onChange={({target}) => setResistenciaContactos(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${!fechaMantenimiento && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Ingrese la fecha del último mantenimiento (formato YYYY-MM-DD)</RequiredLabel>
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
                        <br></br>
                        <Row xs={12}>
                            <Col xs={0} lg={3}>
                            </Col>
                            <Col xs={12} lg={3}>
                                <SButton onClick={showCancelModal}>Cancelar</SButton>
                            </Col>
                            <Col xs={12} lg={3}>
                                <PButton>Generar Pronóstico</PButton>
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
