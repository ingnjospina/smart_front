import '../../styles/spinner.css'
import * as XLSX from 'xlsx'
import React, {useEffect, useState} from 'react'
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
    TitleReport
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
    const [corrienteExcitacion, setCorrienteExcitacion] = useState('')
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
                    if (sheetName === 'Exciting Current') {
                        const sheet = workbook.Sheets[sheetName]
                        const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})

                        const startRow = 15
                        const columnIndex = 4

                        const columnData = jsonData
                            .slice(startRow - 1)
                            .map((row) => row[columnIndex])
                            .filter((value) => value !== undefined)

                        let manPass = true

                        for (let i = 0; i < columnData.length; i += 3) {

                            if (i === 0) {
                                setce1(columnData[i])
                                setce2(columnData[i + 1])
                                setce3(columnData[i + 2])
                            }

                            const c1 = columnData[i]
                            const c2 = columnData[i + 1]
                            const c3 = columnData[i + 2]

                            if (!((c2 < c1 && c2 < c3) || (c2 === c3 && c2 < c1))) {
                                manPass &&= false
                                setce1(columnData[i])
                                setce2(columnData[i + 1])
                                setce3(columnData[i + 2])
                            }
                        }

                        if (manPass) {
                            setCorrienteExcitacion(5)
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

                // Leer la hoja de corriente de exitación
                workbook.SheetNames.forEach(sheetName => {
                    if (sheetName === 'Datos') {
                        const sheet = workbook.Sheets[sheetName]

                        setColor(sheet['B2'].v)
                        setTensionInterfacial(sheet['B3'].v)
                        setRigidezDielectrica(sheet['B5'].v)
                        setContenidoHumedad(sheet['B6'].v)
                        setFactorPotenciaLiquida(sheet['B8'].v)

                        setHidrogeno(sheet['E2'].v)
                        setMetano(sheet['E3'].v)
                        setMonoxidoCarbono(sheet['E4'].v)
                        setEtileno(sheet['E5'].v)
                        setEtano(sheet['E6'].v)
                        setAcetileno(sheet['E7'].v)
                        setDioxidoCarbono(sheet['E13'].v)

                        setCompuestoFuranico(sheet['H8'].v)
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
    }

    const deleteDocEnsayo = (e) => {
        e.preventDefault()
        setDocEnsayo([])
        setColor('')
        setTensionInterfacial('')
        setRigidezDielectrica('')
        setContenidoHumedad('')
        setFactorPotenciaLiquida('')

        setHidrogeno('')
        setMetano('')
        setMonoxidoCarbono('')
        setEtileno('')
        setEtano('')
        setAcetileno('')
        setDioxidoCarbono('')

        setCompuestoFuranico('')
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
                    relacion_transformacion: relacionTransformacion,
                    resistencia_devanados: resistenciaDevanados,
                    corriente_excitacion: corrienteExcitacion,
                    factor_potencia: factorPotencia,
                    inhibidor_oxidacion: inhibidorOxidacion,
                    compuestos_furanicos: compuestoFuranico,
                    transformadores: transformador,
                    analisis_aceite_fisico_quimico: {
                        rigidez_dieletrica: rigidezDielectrica,
                        tension_interfacial: tensionInterfacial,
                        numero_acidez: numeroAcidez,
                        contenido_humedad: contenidoHumedad,
                        color: color,
                        factor_potencia_liquido: factorPotenciaLiquida.toFixed(2)
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
                        <Row xs={12}>
                            <Col xs={12} md={6}>
                                <Col xs={12}>
                                    <RequiredLabel>Cargar Archivo de Medidas Electricas</RequiredLabel>
                                </Col>
                                {
                                    docElec.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargaron los Datos</TitleReport>
                                            <SButton onClick={deleteDocElect}>
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
                                            <DropZone id={'fileElect'} loadFile={loadFileElect} type={'.xlsx'}/>
                                        </Col>
                                    )
                                }
                            </Col>
                            <Col xs={12} md={6}>
                                <Col xs={12}>
                                    <RequiredLabel>Cargar Archivo de Medidas de Ensayo</RequiredLabel>
                                </Col>
                                {
                                    docEnsayo.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargaron los Datos</TitleReport>
                                            <SButton onClick={deleteDocEnsayo}>
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
                                            <DropZone id={'fileEnsayo'} loadFile={loadFileEnsayo} type={'.xlsm'}/>
                                        </Col>
                                    )
                                }
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
                                <PButton>Enviar</PButton>
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