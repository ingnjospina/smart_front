import '../../styles/spinner.css'
import * as XLSX from 'xlsx'
import * as d3 from 'd3'
import React, {useEffect, useState, useRef} from 'react'
import Col from 'react-bootstrap/Col'
import Row from 'react-bootstrap/Row'
import {DropZone} from '../tools/dropZone'
import {
    DivForm,
    InputForm,
    LabelForm,
    PButton,
    SButton,
    StyledForm,
    StyledFormSelect,
    TitleReport,
    ChartContainer,
    SectionCard,
    SectionTitle
} from '../tools/styleContent'
import {Alert, Container} from 'react-bootstrap'
import {CancelAceptModal} from '../modals/cancelAceptModal'
import {getTransformadores} from '../../services/transformer.services'
import {createMedicion} from '../../services/mediciones.services'
import {Spinner} from '../tools/spinner'
import {useNavigate} from 'react-router-dom'
import {UseLogout} from '../../hooks/useLogout'
import RequiredLabel from "../tools/requiredLabel";

export const NewTransformerMeasurement = () => {

    const nav = useNavigate()
    const logout = UseLogout()

    const [userData, setUserData] = useState({})

    const [transformador, setTransformador] = useState('')
    const [transformadores, setTransformadores] = useState([])
    const [loadingTransfo, setLoadingTransfo] = useState(true)

    const [relacionTransformacion, setRelacionTransformacion] = useState('')
    const [resistenciaDevanados, setResistenciaDevanados] = useState('')
    const [ce1, setce1] = useState('')
    const [ce2, setce2] = useState('')
    const [ce3, setce3] = useState('')
    const [factorPotencia, setFactorPotencia] = useState('')
    const [inhibidorOxidacion, setInhibidorOxidacion] = useState('')
    const [compuestoFuranico, setCompuestoFuranico] = useState('')
    const [rigidezDielectrica, setRigidezDielectrica] = useState('')
    const [tensionInterfacial, setTensionInterfacial] = useState('')
    const [numeroAcidez, setNumeroAcidez] = useState('')
    const [contenidoHumedad, setContenidoHumedad] = useState('')
    const [factorPotenciaLiquida, setFactorPotenciaLiquida] = useState('')
    const [color, setColor] = useState('')
    const [hidrogeno, setHidrogeno] = useState('')
    const [metano, setMetano] = useState('')
    const [etano, setEtano] = useState('')
    const [etileno, setEtileno] = useState('')
    const [acetileno, setAcetileno] = useState('')
    const [dioxidoCarbono, setDioxidoCarbono] = useState('')
    const [monoxidoCarbono, setMonoxidoCarbono] = useState('')
    const [docElec, setDocElec] = useState([])
    const [docEnsayo, setDocEnsayo] = useState([])
    const [docBaseDatos, setDocBaseDatos] = useState([])
    const [chartData, setChartData] = useState([])
    const chartRef = useRef(null)


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
                setUserData(user)
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

    // Renderizar gráfica con D3 cuando cambie chartData
    useEffect(() => {
        if (chartData.length === 0 || !chartRef.current) return

        d3.select(chartRef.current).selectAll('*').remove()

        const margin = {top: 20, right: 30, bottom: 60, left: 60}
        const width = 700 - margin.left - margin.right
        const height = 350 - margin.top - margin.bottom

        const svg = d3.select(chartRef.current)
            .append('svg')
            .attr('width', width + margin.left + margin.right)
            .attr('height', height + margin.top + margin.bottom)
            .append('g')
            .attr('transform', `translate(${margin.left},${margin.top})`)

        const x = d3.scaleBand()
            .domain(chartData.map(d => d.date))
            .range([0, width])
            .padding(0.1)

        const y = d3.scaleLinear()
            .domain([0, d3.max(chartData, d => d.promedio) * 1.1])
            .range([height, 0])

        svg.append('g')
            .attr('transform', `translate(0,${height})`)
            .call(d3.axisBottom(x))
            .selectAll('text')
            .attr('transform', 'rotate(-45)')
            .style('text-anchor', 'end')
            .style('font-size', '10px')

        svg.append('g')
            .call(d3.axisLeft(y))

        svg.append('text')
            .attr('transform', 'rotate(-90)')
            .attr('y', 0 - margin.left)
            .attr('x', 0 - (height / 2))
            .attr('dy', '1em')
            .style('text-anchor', 'middle')
            .style('font-size', '12px')
            .text('Promedio AI603')

        const line = d3.line()
            .x(d => x(d.date) + x.bandwidth() / 2)
            .y(d => y(d.promedio))

        svg.append('path')
            .datum(chartData)
            .attr('fill', 'none')
            .attr('stroke', '#007bff')
            .attr('stroke-width', 2)
            .attr('d', line)

        svg.selectAll('.dot')
            .data(chartData)
            .enter()
            .append('circle')
            .attr('class', 'dot')
            .attr('cx', d => x(d.date) + x.bandwidth() / 2)
            .attr('cy', d => y(d.promedio))
            .attr('r', 4)
            .attr('fill', '#007bff')

    }, [chartData])

    const loadFileElect = (list) => {
        setShowSpinner(true)
        setDocElec((prevList) => [...prevList, ...list])
        const file = list[0]
        if (file) {
            const reader = new FileReader()

            // Leer el archivo como un ArrayBuffer
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, {type: 'array'})

                // Leer la hoja de corriente de exitación
                workbook.SheetNames.forEach(sheetName => {
                    // ========== FUNCIONALIDAD ANTERIOR COMENTADA ==========
                    // if (sheetName === 'Exciting Current') {
                    //     const sheet = workbook.Sheets[sheetName]
                    //     const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})
                    //
                    //     const startRow = 15
                    //     const columnIndex = 4
                    //
                    //     const columnData = jsonData
                    //         .slice(startRow - 1)
                    //         .map((row) => row[columnIndex])
                    //         .filter((value) => value !== undefined)
                    //
                    //     let manPass = true
                    //
                    //     for (let i = 0; i < columnData.length; i += 3) {
                    //
                    //         if (i === 0) {
                    //             setce1(columnData[i])
                    //             setce2(columnData[i + 1])
                    //             setce3(columnData[i + 2])
                    //         }
                    //
                    //         const c1 = columnData[i]
                    //         const c2 = columnData[i + 1]
                    //         const c3 = columnData[i + 2]
                    //
                    //         if (!((c2 < c1 && c2 < c3) || (c2 === c3 && c2 < c1))) {
                    //             manPass &&= false
                    //             setce1(columnData[i])
                    //             setce2(columnData[i + 1])
                    //             setce3(columnData[i + 2])
                    //         }
                    //     }
                    //
                    //     if (manPass) {
                    //         setCorrienteExcitacion(5)
                    //     }
                    // }
                    // ========== FIN FUNCIONALIDAD ANTERIOR ==========

                    // NUEVA FUNCIONALIDAD: Buscar máximos por fase A, B, C
                    if (sheetName === 'Exciting Current') {
                        const sheet = workbook.Sheets[sheetName]
                        const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})

                        // Columna C del Excel (índice 1) contiene Phase (A, B, C)
                        // Columna G del Excel (índice 5) contiene Watt losses [W]
                        // Nota: El array empieza en columna B del Excel, por eso B=0, C=1, D=2, E=3, F=4, G=5
                        const colPhaseIndex = 1
                        const colValueIndex = 5

                        // Objetos para almacenar valores por fase
                        const valoresPorFase = {
                            A: [],
                            B: [],
                            C: []
                        }

                        // Recorrer todas las filas y agrupar valores por fase
                        jsonData.forEach((row) => {
                            const fase = row[colPhaseIndex]
                            const valor = row[colValueIndex]

                            if (fase === 'A' && valor !== null && valor !== undefined && !isNaN(valor) && typeof valor === 'number') {
                                valoresPorFase.A.push(valor)
                            } else if (fase === 'B' && valor !== null && valor !== undefined && !isNaN(valor) && typeof valor === 'number') {
                                valoresPorFase.B.push(valor)
                            } else if (fase === 'C' && valor !== null && valor !== undefined && !isNaN(valor) && typeof valor === 'number') {
                                valoresPorFase.C.push(valor)
                            }
                        })

                        // Obtener el valor máximo para cada fase
                        if (valoresPorFase.A.length > 0) {
                            const maxA = Math.max(...valoresPorFase.A)
                            setce1(maxA)
                        } else {
                            setce1('')
                        }

                        if (valoresPorFase.B.length > 0) {
                            const maxB = Math.max(...valoresPorFase.B)
                            setce2(maxB)
                        } else {
                            setce2('')
                        }

                        if (valoresPorFase.C.length > 0) {
                            const maxC = Math.max(...valoresPorFase.C)
                            setce3(maxC)
                        } else {
                            setce3('')
                        }
                    }

                    // Leer la hoja de Ratio Prim-Sec para obtener la relación de transformación
                    if (sheetName === 'Ratio Prim-Sec') {
                        const sheet = workbook.Sheets[sheetName]
                        const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})

                        // La hoja empieza en columna B del Excel, por lo que hay un offset
                        // Columna J del Excel es el índice 8 (0-indexed en el array)
                        // porque B=0, C=1, D=2, E=3, F=4, G=5, H=6, I=7, J=8
                        const columnJIndex = 8

                        // Extraer valores de la columna J desde la fila 13 (índice 12)
                        const columnJData = jsonData
                            .slice(12) // Empezar desde fila 13 (índice 12)
                            .map((row) => row[columnJIndex])
                            .filter((value) => value !== undefined && value !== null && value !== '' && !isNaN(value) && typeof value === 'number')

                        // Obtener el valor más alto
                        if (columnJData.length > 0) {
                            const maxValue = Math.max(...columnJData)
                            setRelacionTransformacion(maxValue)
                        } else {
                            setRelacionTransformacion('')
                        }
                    }

                    // Leer la hoja de Resistencia del devanado de. para obtener la resistencia de devanados
                    if (sheetName === 'Resistencia del devanado de.') {
                        const sheet = workbook.Sheets[sheetName]
                        const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})

                        // La hoja empieza en columna B del Excel
                        // Columna G del Excel es el índice 5 (0-indexed en el array)
                        // porque B=0, C=1, D=2, E=3, F=4, G=5
                        const columnGIndex = 5

                        // Extraer valores de la columna G (todos los valores numéricos)
                        const columnGData = jsonData
                            .map((row) => row[columnGIndex])
                            .filter((value) => value !== undefined && value !== null && value !== '' && !isNaN(value) && typeof value === 'number')

                        // Obtener el valor más alto
                        if (columnGData.length > 0) {
                            const maxValue = Math.max(...columnGData)
                            setResistenciaDevanados(maxValue)
                        } else {
                            setResistenciaDevanados('')
                        }
                    }

                    // Leer la hoja de Borna H FP & CAP - C2 para obtener el factor de potencia
                    if (sheetName === 'Borna H FP & CAP - C2') {
                        const sheet = workbook.Sheets[sheetName]

                        // Leer celdas K19, K20, K21, K22
                        const valores = []
                        const celdas = ['K19', 'K20', 'K21', 'K22']

                        celdas.forEach(celda => {
                            if (sheet[celda] && !isNaN(sheet[celda].v) && typeof sheet[celda].v === 'number') {
                                valores.push(sheet[celda].v)
                            }
                        })

                        // Obtener el valor más alto
                        if (valores.length > 0) {
                            const maxValue = Math.max(...valores)
                            setFactorPotencia(maxValue)
                        } else {
                            setFactorPotencia('')
                        }
                    }
                })
            }

            reader.readAsArrayBuffer(file)
        }
        setShowSpinner(false)
    }

    const loadFileEnsayo = (list) => {
        setShowSpinner(true)
        setDocEnsayo((prevList) => [...prevList, ...list])
        const file = list[0]
        if (file) {
            const reader = new FileReader()

            // Leer el archivo como un ArrayBuffer
            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, {type: 'array'})

                // Leer la hoja de datos de ensayo
                workbook.SheetNames.forEach(sheetName => {
                    if (sheetName === 'Datos') {
                        const sheet = workbook.Sheets[sheetName]

                        // Leer valores de análisis físico-químico con validación de existencia
                        setColor(sheet['B2'] ? sheet['B2'].v : '')
                        setTensionInterfacial(sheet['B3'] ? sheet['B3'].v : '')
                        setNumeroAcidez(sheet['B4'] ? sheet['B4'].v : '')
                        setRigidezDielectrica(sheet['B5'] ? sheet['B5'].v : '')
                        setContenidoHumedad(sheet['B6'] ? sheet['B6'].v : '')
                        setFactorPotenciaLiquida(sheet['B8'] ? sheet['B8'].v : '')
                        setInhibidorOxidacion(sheet['B13'] ? sheet['B13'].v : '')
                        setCompuestoFuranico(sheet['H8'] ? sheet['H8'].v : '')

                        // Leer valores de análisis de gases disueltos
                        setHidrogeno(sheet['E2'] ? sheet['E2'].v : '')
                        setMetano(sheet['E3'] ? sheet['E3'].v : '')
                        setMonoxidoCarbono(sheet['E4'] ? sheet['E4'].v : '')
                        setEtileno(sheet['E5'] ? sheet['E5'].v : '')
                        setEtano(sheet['E6'] ? sheet['E6'].v : '')
                        setAcetileno(sheet['E7'] ? sheet['E7'].v : '')
                        setDioxidoCarbono(sheet['E13'] ? sheet['E13'].v : '')
                    }
                })
            }

            reader.readAsArrayBuffer(file)
        }
        setShowSpinner(false)
    }

    const deleteDocElect = (e) => {
        e.preventDefault()
        setDocElec([])
        setce1('')
        setce2('')
        setce3('')
        setRelacionTransformacion('')
        setResistenciaDevanados('')
        setFactorPotencia('')
    }

    const deleteDocEnsayo = (e) => {
        e.preventDefault()
        setDocEnsayo([])
        setColor('')
        setTensionInterfacial('')
        setNumeroAcidez('')
        setRigidezDielectrica('')
        setContenidoHumedad('')
        setFactorPotenciaLiquida('')
        setInhibidorOxidacion('')
        setCompuestoFuranico('')

        setHidrogeno('')
        setMetano('')
        setMonoxidoCarbono('')
        setEtileno('')
        setEtano('')
        setAcetileno('')
        setDioxidoCarbono('')
    }

    const loadFileBaseDatos = (list) => {
        setShowSpinner(true)
        setDocBaseDatos((prevList) => [...prevList, ...list])
        const file = list[0]
        if (file) {
            const reader = new FileReader()

            reader.onload = (e) => {
                const data = new Uint8Array(e.target.result)
                const workbook = XLSX.read(data, {type: 'array'})

                const firstSheetName = workbook.SheetNames[0]
                const sheet = workbook.Sheets[firstSheetName]
                const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})

                // Columna B (índice 1) = DATE, Columna F (índice 5) = AI603
                const dateColIndex = 1
                const valueColIndex = 5
                const dataByDate = {}

                jsonData.forEach((row, index) => {
                    if (index === 0) return
                    const dateValue = row[dateColIndex]
                    const ai603Value = row[valueColIndex]

                    if (dateValue && ai603Value !== undefined && ai603Value !== null && !isNaN(ai603Value)) {
                        let dateStr
                        if (typeof dateValue === 'number') {
                            const excelDate = XLSX.SSF.parse_date_code(dateValue)
                            dateStr = `${excelDate.y}-${String(excelDate.m).padStart(2, '0')}-${String(excelDate.d).padStart(2, '0')}`
                        } else if (typeof dateValue === 'string') {
                            dateStr = dateValue.split(' ')[0]
                        } else {
                            return
                        }
                        if (!dataByDate[dateStr]) dataByDate[dateStr] = []
                        dataByDate[dateStr].push(parseFloat(ai603Value))
                    }
                })

                const averages = Object.entries(dataByDate).map(([date, values]) => ({
                    date,
                    promedio: values.reduce((sum, val) => sum + val, 0) / values.length
                }))

                averages.sort((a, b) => new Date(a.date) - new Date(b.date))
                setChartData(averages.slice(-30))
            }

            reader.readAsArrayBuffer(file)
        }
        setShowSpinner(false)
    }

    const deleteDocBaseDatos = (e) => {
        e.preventDefault()
        setDocBaseDatos([])
        setChartData([])
    }

    const convertFileToBase64 = (file) => {
        return new Promise((resolve, reject) => {
            const reader = new FileReader()

            // Evento que se activa cuando la lectura se completa
            reader.onload = () => {
                const base64 = reader.result.split(',')[1]// Extraer solo la parte base64
                resolve(base64)
            }

            // Manejo de errores
            reader.onerror = (error) => {
                reject(error)
            }

            // Leer el archivo como Data URL
            reader.readAsDataURL(file)
        })
    }

    // Función helper para formatear números con máximo de dígitos totales
    const formatMaxDigits = (value, maxDigits) => {
        const num = parseFloat(value)
        if (isNaN(num)) return 1

        // Convertir a string para contar dígitos
        const strNum = Math.abs(num).toString()
        const digits = strNum.replace('.', '').length

        if (digits <= maxDigits) return num

        // Calcular cuántos decimales mantener
        const integerPart = Math.floor(Math.abs(num)).toString().length
        const decimals = Math.max(0, maxDigits - integerPart)

        return parseFloat(num.toFixed(decimals))
    }

    // Función helper para formatear números con máximo de decimales
    const formatMaxDecimals = (value, maxDecimals) => {
        const num = parseFloat(value)
        if (isNaN(num)) return 1
        return parseFloat(num.toFixed(maxDecimals))
    }

    // Función para calcular corriente de excitación
    // Basado en la lógica anterior: retorna 5 si hay datos válidos
    const calculateCorrienteExcitacion = (c1, c2, c3) => {
        // Si al menos uno de los valores existe, retornar 5 (lógica original)
        if (c1 || c2 || c3) {
            return 5
        }
        // Si no hay datos, retornar 1 como fallback
        return 1
    }

    const createMeasurement = async (event) => {
        setShowSpinner(true)
        event.preventDefault()
        if (
            !relacionTransformacion ||
            !resistenciaDevanados ||
            !ce1 ||
            !ce2 ||
            !ce3 ||
            !factorPotencia ||
            !inhibidorOxidacion ||
            !compuestoFuranico ||
            !rigidezDielectrica ||
            !tensionInterfacial ||
            !numeroAcidez ||
            !contenidoHumedad ||
            !color ||
            !hidrogeno ||
            !metano ||
            !etano ||
            !etileno ||
            !acetileno ||
            !dioxidoCarbono ||
            !monoxidoCarbono
        ) {
            setShowAlert(true)
            setFormError(true)
            window.scrollTo({top: 0, behavior: 'smooth'})
            setShowSpinner(false)
            return
        }

        try {

            let haveFiles = false

            let docs = []

            if (docElec.length > 0) {
                const name = docElec[0].name
                haveFiles = true
                docs.push({
                    ext: name,
                    base64: await convertFileToBase64(docElec[0])
                })
            }

            if (docEnsayo.length > 0) {
                const name = docEnsayo[0].name
                haveFiles = true
                docs.push({
                    ext: name,
                    base64: await convertFileToBase64(docEnsayo[0])
                })
            }


            const data = {
                docs,
                info: {
                    haveFiles,
                    relacion_transformacion: formatMaxDigits(relacionTransformacion, 4),
                    resistencia_devanados: formatMaxDigits(resistenciaDevanados, 4),
                    corriente_excitacion: calculateCorrienteExcitacion(ce1, ce2, ce3),
                    factor_potencia: formatMaxDigits(factorPotencia, 4),
                    inhibidor_oxidacion: inhibidorOxidacion,
                    compuestos_furanicos: compuestoFuranico,
                    transformadores: transformador,
                    analisis_aceite_fisico_quimico: {
                        rigidez_dieletrica: rigidezDielectrica,
                        tension_interfacial: tensionInterfacial,
                        numero_acidez: formatMaxDecimals(numeroAcidez, 2),
                        contenido_humedad: contenidoHumedad,
                        color: color,
                        factor_potencia_liquido: parseFloat(factorPotenciaLiquida).toFixed(2)
                    },
                    analisis_gases_disueltos: {
                        hidrogeno: hidrogeno,
                        metano: metano,
                        etano: etano,
                        etileno: etileno,
                        acetileno: acetileno,
                        dioxido_carbono: dioxidoCarbono,
                        monoxido_carbono: monoxidoCarbono
                    }
                }
            }
            const respond = await createMedicion(userData.token, data)
            setTitle('Medición Realizado')
            setSubTitle('Datos Calculados')
            setMessage('hi_total: ' + respond.data.hi_ponderado)
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
        setTitle('Cancelar Reporte')
        setSubTitle('')
        setMessage('¿Estás seguro de que deseas cancelar el registro de medición?')
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
                        {/* Sección: Archivos de Pruebas */}
                        <SectionCard>
                            <SectionTitle>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM16 18H8V16H16V18ZM16 14H8V12H16V14ZM13 9V3.5L18.5 9H13Z" fill="#E40613"/>
                                </svg>
                                Archivos de Pruebas Eléctricas
                            </SectionTitle>
                            <Row>
                                <Col xs={12} md={6}>
                                    <RequiredLabel>Medidas Eléctricas (.xlsx)</RequiredLabel>
                                    {docElec.length > 0 ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                                            <TitleReport style={{margin: 0}}>Archivo cargado</TitleReport>
                                            <SButton onClick={deleteDocElect} style={{width: 'auto', padding: '5px 10px', margin: 0}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="#E40613"/>
                                                </svg>
                                            </SButton>
                                        </div>
                                    ) : (
                                        <DropZone id={'fileElect'} loadFile={loadFileElect} type={'.xlsx'}/>
                                    )}
                                </Col>
                                <Col xs={12} md={6}>
                                    <RequiredLabel>Medidas de Ensayo (.xlsm)</RequiredLabel>
                                    {docEnsayo.length > 0 ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                                            <TitleReport style={{margin: 0}}>Archivo cargado</TitleReport>
                                            <SButton onClick={deleteDocEnsayo} style={{width: 'auto', padding: '5px 10px', margin: 0}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="#E40613"/>
                                                </svg>
                                            </SButton>
                                        </div>
                                    ) : (
                                        <DropZone id={'fileEnsayo'} loadFile={loadFileEnsayo} type={'.xlsm'}/>
                                    )}
                                </Col>
                            </Row>
                        </SectionCard>

                        {/* Sección: Base de Datos y Análisis */}
                        <SectionCard>
                            <SectionTitle>
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                    <path d="M3 13H11V3H3V13ZM3 21H11V15H3V21ZM13 21H21V11H13V21ZM13 3V9H21V3H13Z" fill="#E40613"/>
                                </svg>
                                Base de Datos y Análisis Gráfico
                            </SectionTitle>
                            <Row>
                                <Col xs={12} md={6}>
                                    <LabelForm>Archivo Base de Datos (.xlsx)</LabelForm>
                                    {docBaseDatos.length > 0 ? (
                                        <div style={{display: 'flex', alignItems: 'center', gap: '10px', marginTop: '10px'}}>
                                            <TitleReport style={{margin: 0}}>Archivo cargado</TitleReport>
                                            <SButton onClick={deleteDocBaseDatos} style={{width: 'auto', padding: '5px 10px', margin: 0}}>
                                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none">
                                                    <path d="M7 21C6.45 21 5.97933 20.8043 5.588 20.413C5.19667 20.0217 5.00067 19.5507 5 19V6H4V4H9V3H15V4H20V6H19V19C19 19.55 18.8043 20.021 18.413 20.413C18.0217 20.805 17.5507 21.0007 17 21H7ZM17 6H7V19H17V6ZM9 17H11V8H9V17ZM13 17H15V8H13V17Z" fill="#E40613"/>
                                                </svg>
                                            </SButton>
                                        </div>
                                    ) : (
                                        <DropZone id={'fileBaseDatos'} loadFile={loadFileBaseDatos} type={'.xlsx,.xls'}/>
                                    )}
                                </Col>
                            </Row>
                            {chartData.length > 0 && (
                                <ChartContainer>
                                    <LabelForm style={{marginBottom: '15px', fontSize: '1rem'}}>
                                        <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" style={{marginRight: '8px'}}>
                                            <path d="M3.5 18.49L9.5 12.48L13.5 16.48L22 6.92L20.59 5.51L13.5 13.48L9.5 9.48L2 16.99L3.5 18.49Z" fill="#99ABB4"/>
                                        </svg>
                                        Promedio Diario AI603 - Últimos 30 días
                                    </LabelForm>
                                    <div ref={chartRef} style={{minWidth: '700px'}}></div>
                                </ChartContainer>
                            )}
                        </SectionCard>
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
                            <Col xs={6} md={3} className={`${!relacionTransformacion && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Relación de Transformación</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={relacionTransformacion}
                                        name='relacionTransformacion'
                                        placeholder='Porcentaje'
                                        onChange={({target}) => setRelacionTransformacion(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!resistenciaDevanados && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Resistencia de Devanados</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={resistenciaDevanados}
                                        name='resistenciaDevanados'
                                        placeholder='Porcentaje'
                                        onChange={({target}) => setResistenciaDevanados(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${(!ce1 || !ce2 || !ce3) && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Corriente de Excitación</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <Row xs={12}>
                                        <Col xs={4}>
                                            <InputForm
                                                type='number'
                                                value={ce1}
                                                name='ce1'
                                                placeholder='Corriente 1'
                                                onChange={({target}) => setce1(target.value)}
                                            />
                                        </Col>
                                        <Col xs={4}>
                                            <InputForm
                                                type='number'
                                                value={ce2}
                                                name='ce2'
                                                placeholder='Corriente 2'
                                                onChange={({target}) => setce2(target.value)}
                                            />
                                        </Col>
                                        <Col xs={4}>
                                            <InputForm
                                                type='number'
                                                value={ce3}
                                                name='ce3'
                                                placeholder='Corriente 3'
                                                onChange={({target}) => setce3(target.value)}
                                            />
                                        </Col>
                                    </Row>
                                </Col>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={6} md={3} className={`${!factorPotencia && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Factor de Potencia</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={factorPotencia}
                                        name='factorPotencia'
                                        placeholder='Porcentaje'
                                        onChange={({target}) => setFactorPotencia(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!inhibidorOxidacion && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Inhibidor de Oxidación</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={inhibidorOxidacion}
                                        name='inhibidorOxidacion'
                                        placeholder='Porcentaje'
                                        onChange={({target}) => setInhibidorOxidacion(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!compuestoFuranico && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Compuesto Furanico</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={compuestoFuranico}
                                        name='compuestoFuranico'
                                        placeholder='Número'
                                        onChange={({target}) => setCompuestoFuranico(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>

                        <br></br>
                        <Row xs={12}>
                            <Col xs={12}>
                                <LabelForm>Análisis de aceites físico químicos -- Pruebas
                                    Dieléctricas</LabelForm>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={6} md={3} className={`${!rigidezDielectrica && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Rigidez Dieléctrica (KV)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={rigidezDielectrica}
                                        name='rigidezDielectrica'
                                        placeholder='Número'
                                        onChange={({target}) => setRigidezDielectrica(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!tensionInterfacial && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Tensión Interfacial (N/m)</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={tensionInterfacial}
                                        name='tensionInterfacial'
                                        placeholder='Número'
                                        onChange={({target}) => setTensionInterfacial(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!numeroAcidez && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Número de Acidez</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={numeroAcidez}
                                        name='numeroAcidez'
                                        placeholder='Número'
                                        onChange={({target}) => setNumeroAcidez(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!contenidoHumedad && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Contenido de Humedad</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={contenidoHumedad}
                                        name='contenidoHumedad'
                                        placeholder='Número'
                                        onChange={({target}) => setContenidoHumedad(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={6} md={3} className={`${!color && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Color</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={color}
                                        name='color'
                                        placeholder='Número'
                                        onChange={({target}) => setColor(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={12} md={6} className={`${!factorPotenciaLiquida && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Factor de potencia liquido 25 %</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={factorPotenciaLiquida}
                                        name='factorPotenciaLiquida'
                                        placeholder='Número'
                                        onChange={({target}) => setFactorPotenciaLiquida(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>

                        <br></br>
                        <Row xs={12}>
                            <Col xs={12}>
                                <LabelForm>Análisis de Gases Disueltos.</LabelForm>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={6} md={3} className={`${!hidrogeno && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Hidrogeno</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={hidrogeno}
                                        name='hidrogeno'
                                        placeholder='Número'
                                        onChange={({target}) => setHidrogeno(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!metano && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Metano</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={metano}
                                        name='metano'
                                        placeholder='Número'
                                        onChange={({target}) => setMetano(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!etano && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Etano</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={etano}
                                        name='etano'
                                        placeholder='Número'
                                        onChange={({target}) => setEtano(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!etileno && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Etileno</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={etileno}
                                        name='etileno'
                                        placeholder='Número'
                                        onChange={({target}) => setEtileno(target.value)}
                                    />
                                </Col>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={6} md={3} className={`${!acetileno && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Acetileno</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={acetileno}
                                        name='acetileno'
                                        placeholder='Número'
                                        onChange={({target}) => setAcetileno(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!dioxidoCarbono && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Dióxido de Carbono</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={dioxidoCarbono}
                                        name='dioxidoCarbono'
                                        placeholder='Número'
                                        onChange={({target}) => setDioxidoCarbono(target.value)}
                                    />
                                </Col>
                            </Col>
                            <Col xs={6} md={3} className={`${!monoxidoCarbono && formError ? 'errorForm' : ''}`}>
                                <Col xs={12}>
                                    <RequiredLabel>Monóxido de Carbono</RequiredLabel>
                                </Col>
                                <Col xs={12}>
                                    <InputForm
                                        type='number'
                                        value={monoxidoCarbono}
                                        name='monoxidoCarbono'
                                        placeholder='Número'
                                        onChange={({target}) => setMonoxidoCarbono(target.value)}
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
                                <PButton disabled={!transformador}>Enviar</PButton>
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