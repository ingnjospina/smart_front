import '../../styles/spinner.css';
import React, {useEffect, useState} from 'react';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import {DivForm, InputForm, PButton, SButton, StyledForm, StyledFormSelect, TitleReport} from '../tools/styleContent';
import {CancelAceptModal} from '../modals/cancelAceptModal';
import {createMedidasInterruptores, getInterruptores} from '../../services/interruptor.services';
import {Spinner} from '../tools/spinner';
import {useNavigate} from 'react-router-dom';
import {UseLogout2} from "../../hooks/useLogout2";
import RequiredLabel from "../tools/requiredLabel";
import {DropZone} from "../tools/dropZone";
import * as XLSX from "xlsx";

export const NewMedidasInterruptor = () => {
    const navigate = useNavigate();
    const {logOut} = UseLogout2();

    const [interruptor, setInterruptor] = useState('');
    const [interruptores, setInterruptores] = useState([]);
    const [loadingInterruptores, setLoadingInterruptores] = useState(true);

    // Estados para los campos del formulario
    const [numeroOperaciones, setNumeroOperaciones] = useState('');
    const [corrienteFalla, setCorrienteFalla] = useState('');

    // Nuevos estados para tiempos de apertura, cierre y resistencias de contacto
    const [tiempoAperturaA, setTiempoAperturaA] = useState('');
    const [tiempoAperturaB, setTiempoAperturaB] = useState('');
    const [tiempoAperturaC, setTiempoAperturaC] = useState('');

    const [tiempoCierreA, setTiempoCierreA] = useState('');
    const [tiempoCierreB, setTiempoCierreB] = useState('');
    const [tiempoCierreC, setTiempoCierreC] = useState('');

    const [resistenciaContactosR, setResistenciaContactosR] = useState('');
    const [resistenciaContactosS, setResistenciaContactosS] = useState('');
    const [resistenciaContactosT, setResistenciaContactosT] = useState('');

    // Estados para manejo de alertas y modales
    const [formError, setFormError] = useState(false);
    const [show, setShow] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [message, setMessage] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);

    const [docTiempos, setDocTiempos] = useState([])
    const [docOperaciones, setDocOperaciones] = useState([])
    const [error, setError] = useState(null);

    const handleCloseModal = () => setShow(false);

    useEffect(() => {
        const fetchInterruptores = async () => {
            try {
                const user = JSON.parse(window.localStorage.getItem('loggedAppUser'));
                const response = await getInterruptores(user.token);
                setInterruptores(response);
                setLoadingInterruptores(false);
            } catch (error) {
                console.error('Error al cargar los interruptores:', error);
                logOut();
            }
        };

        fetchInterruptores();
    }, [logOut]);

    const createMeasurement = async (event) => {
        event.preventDefault();
        setShowSpinner(true);

        // Validación de todos los campos requeridos
        if (
            !interruptor ||
            !numeroOperaciones ||
            !corrienteFalla ||
            !tiempoAperturaA || !tiempoAperturaB || !tiempoAperturaC ||
            !tiempoCierreA || !tiempoCierreB || !tiempoCierreC ||
            !resistenciaContactosR || !resistenciaContactosS || !resistenciaContactosT
        ) {
            setShowAlert(true);
            setFormError(true);
            window.scrollTo({top: 0, behavior: 'smooth'});
            setShowSpinner(false);
            return;
        }

        try {
            const user = JSON.parse(window.localStorage.getItem('loggedAppUser'));

            const data = {
                Interruptores_idInterruptores: interruptor,
                numero_operaciones: parseInt(numeroOperaciones, 10),
                corriente_falla: parseFloat(corrienteFalla),

                // Tiempos de Apertura
                tiempo_apertura_A: parseFloat(tiempoAperturaA),
                tiempo_apertura_B: parseFloat(tiempoAperturaB),
                tiempo_apertura_C: parseFloat(tiempoAperturaC),

                // Tiempos de Cierre
                tiempo_cierre_A: parseFloat(tiempoCierreA),
                tiempo_cierre_B: parseFloat(tiempoCierreB),
                tiempo_cierre_C: parseFloat(tiempoCierreC),

                // Resistencias de Contacto
                resistencia_contactos_R: parseFloat(resistenciaContactosR),
                resistencia_contactos_S: parseFloat(resistenciaContactosS),
                resistencia_contactos_T: parseFloat(resistenciaContactosT),
            };

            const response = await createMedidasInterruptores(user.token, data);

            setTitle('Medición Registrada');
            setSubTitle('Datos guardados exitosamente');
            setMessage(`Medición registrada con éxito. ID: ${response.id_alerta}`);
        } catch (error) {
            setTitle('Error');
            setSubTitle('');
            setMessage('No se pudo registrar la medición. Inténtelo de nuevo.');
            if (error.response?.data?.error?.name === 'TokenExpiredError') {
                logOut();
            }
        }

        setShow(true);
        setShowSpinner(false);
    };

    const handleConfirmSubmit = (text) => {
        if (text === 'Cancel') {
            navigate('/');
        }
        if (text === 'Acept') {
            window.location.reload();
            window.scrollTo({top: 0, behavior: 'smooth'});
        }
    };

    const showCancelModal = (event) => {
        event.preventDefault();
        setShow(true);
        setTitle('Cancelar Registro');
        setMessage('¿Está seguro de que desea cancelar el registro de medición?');
    };

    const deleteDocTiempos = (e) => {
        e.preventDefault()
        setDocTiempos([])
        setError(null)
        setTiempoAperturaA('')
        setTiempoAperturaB('')
        setTiempoAperturaC('')
        setTiempoCierreA('');
        setTiempoCierreB('');
        setTiempoCierreC('');
    }

    const deleteDocOperaciones = (e) => {
        e.preventDefault()
        setDocOperaciones([])
        setError(null)
        setNumeroOperaciones('')
    }

    const loadFileTiempos = (list) => {
        setShowSpinner(true) // Aquí activas correctamente el spinner
        setDocTiempos((prevList) => [...prevList, ...list])
        const file = list[0]
        if (file) {
            const reader = new FileReader()

            // Leer el archivo como un ArrayBuffer
            reader.onload = (event) => {
                try {
                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, {type: 'array'})

                    const sheetTiempos = workbook.Sheets["O-CO Timing"]
                    const sheetResitencia = workbook.Sheets["Contact Resistance"]

                    if (!sheetTiempos) {
                        setError("No se encontró la pestaña 'O-CO Timing' en el archivo.")
                        setShowSpinner(false)
                        return
                    }

                    if (!sheetResitencia) {
                        setError("No se encontró la pestaña 'Contact Resistance' en el archivo.")
                        setShowSpinner(false)
                        return
                    }

                    // Leer las celdas requeridas
                    const tiempoAperturaA = sheetTiempos['C61'].v
                    const tiempoAperturaB = sheetTiempos['C63'].v
                    const tiempoAperturaC = sheetTiempos['C65'].v

                    const tiempoCierreA = sheetTiempos['E61'].v
                    const tiempoCierreB = sheetTiempos['E63'].v
                    const tiempoCierreC = sheetTiempos['E65'].v

                    const resistenciaR = sheetResitencia['F49'].v
                    const resistenciaS = sheetResitencia['F50'].v
                    const resistenciaT = sheetResitencia['F51'].v

                    // Actualizar los estados
                    setTiempoAperturaA(tiempoAperturaA)
                    setTiempoAperturaB(tiempoAperturaB)
                    setTiempoAperturaC(tiempoAperturaC)

                    setTiempoCierreA(tiempoCierreA)
                    setTiempoCierreB(tiempoCierreB)
                    setTiempoCierreC(tiempoCierreC)

                    setResistenciaContactosR(resistenciaR)
                    setResistenciaContactosS(resistenciaS)
                    setResistenciaContactosT(resistenciaT)

                    setError(null)
                } catch (error) {
                    setError(error)
                } finally {
                    setShowSpinner(false)
                }
            };

            reader.onerror = () => {
                setError("No se pudo leer el archivo. Asegúrate de que sea un archivo Excel válido.");
                setShowSpinner(false)
            };

            reader.readAsArrayBuffer(file);
        } else {
            setShowSpinner(false);
        }
    }

    const loadFileOperaciones = (list) => {
        setShowSpinner(true)
        setDocOperaciones((prevList) => [...prevList, ...list])
        const file = list[0]
        if (file) {
            const reader = new FileReader()

            reader.onload = (event) => {
                try {
                    if (!interruptor) {
                        setError("Debe de seleccionar un interruptor!")
                        setShowSpinner(false)
                        setDocOperaciones([])
                        return
                    }

                    const interruptorData = interruptores.find(inter => inter.idinterruptores === parseInt(interruptor));

                    const data = new Uint8Array(event.target.result);
                    const workbook = XLSX.read(data, {type: 'array'})

                    const sheet = workbook.Sheets["BASE"]

                    if (!sheet) {
                        setError("No se encontró la pestaña 'BASE' en el archivo.")
                        setShowSpinner(false)
                        return
                    }

                    // Convertir la hoja a un DataFrame
                    const jsonData = XLSX.utils.sheet_to_json(sheet, {header: 1})

                    // Crear un DataFrame para manipular los datos
                    const df = jsonData.slice(2) // Ignorar las dos primeras filas

                    const columns = jsonData[1] // Encabezados reales (fila 2)

                    const dfWithHeaders = df.map(row => {
                        return Object.fromEntries(
                            row.map((value, index) => {
                                // Ignorar valores que son undefined
                                if (value !== undefined && columns[index] !== undefined) {
                                    return [columns[index], value];
                                }
                                return null;
                            }).filter(entry => entry !== null) // Filtrar entradas nulas
                        )
                    });

                    // Filtrar filas por 'Nomenclatura Operativa' (Columna F) y 'Subestacion' (Columna C)
                    const interruptorSeleccionado = interruptorData.nombre;
                    const subestacionSeleccionada = interruptorData.subestacion;

                    const filasFiltradas = dfWithHeaders.filter(row =>
                        row['Nomenclatura Operativa'] === interruptorSeleccionado &&
                        row['Subestacion'] === subestacionSeleccionada
                    )

                    if (filasFiltradas.length === 0) {
                        setError("No se encontraron datos para el interruptor seleccionado.")
                        setShowSpinner(false)
                        return
                    }

                    const filaSeleccionada = filasFiltradas[0];

                    // Verificar si hay un valor en la columna 'Numero Operaciones Tripolar'
                    const valorR = filaSeleccionada['Numero Operaciones Tripolar'];

                    let numeroOperaciones;
                    if (valorR) {
                        numeroOperaciones = valorR;
                    } else {
                        // Si no hay valor en 'Numero Operaciones Tripolar', calcular el promedio de 'Numero Operaciones Polo A', 'Numero Operaciones Polo B', 'Numero Operaciones Polo c'
                        const valoresABC = ['Numero Operaciones Polo A', 'Numero Operaciones Polo B', 'Numero Operaciones Polo c'].map(col => parseFloat(filaSeleccionada[col])).filter(val => !isNaN(val));
                        if (valoresABC.length > 0) {
                            numeroOperaciones = valoresABC.reduce((acc, val) => acc + val, 0) / valoresABC.length;
                        } else {
                            setError("No se encontraron valores válidos para promediar.")
                            setShowSpinner(false)
                            return;
                        }
                    }

                    // Actualizar el estado con el número de operaciones calculado
                    setNumeroOperaciones(numeroOperaciones);

                    setError(null)
                } catch (error) {
                    setError("Asegúrate de que sea un archivo Excel válido.")
                } finally {
                    setShowSpinner(false)
                }
            };

            reader.onerror = () => {
                setError("No se pudo leer el archivo. Asegúrate de que sea un archivo Excel válido.");
                setShowSpinner(false)
            };

            reader.readAsArrayBuffer(file);
        } else {
            setShowSpinner(false);
        }
    }

    return (
        <DivForm className="newReportContent">
            <Col xs={12} className={'formBackground'}>
                <Container>
                    <StyledForm onSubmit={createMeasurement}>
                        {showAlert && (<Alert variant="danger" onClose={() => setShowAlert(false)} dismissible
                                              className="alert-center">
                            <p>Por favor complete todos los campos del formulario.</p>
                        </Alert>)}

                        {error && (
                            <Alert variant="danger" onClose={() => setError(null)} dismissible className="alert-center">
                                <p>Error al cargar el archivo: {error}</p>
                            </Alert>)}

                        <Row xs={12}>
                            <Col xs={12} md={6} id='fileTiempos'>
                                <Col xs={12}>
                                    <RequiredLabel>Cargar Archivo de Tiempos</RequiredLabel>
                                </Col>
                                {
                                    docTiempos.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargaron los Datos</TitleReport>
                                            <SButton onClick={deleteDocTiempos}>
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
                                            <DropZone id='fileTiempos' loadFile={loadFileTiempos} type={'.xlsx'}/>
                                        </Col>
                                    )
                                }
                            </Col>
                            <Col xs={12} md={6} id='fileOperaciones'>
                                <Col xs={12}>
                                    <RequiredLabel>Cargar Archivo de Operaciones</RequiredLabel>
                                </Col>
                                {
                                    docOperaciones.length > 0 ? (
                                        <>
                                            <TitleReport>Ya se Cargaron los Datos</TitleReport>
                                            <SButton onClick={deleteDocOperaciones}>
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
                                            <DropZone id='fileOperaciones' loadFile={loadFileOperaciones}type={'.xlsx'}/>
                                        </Col>
                                    )
                                }
                            </Col>
                        </Row>

                        <Row xs={12}>
                            <Col xs={12} md={6}>
                                <RequiredLabel>Interruptor</RequiredLabel>
                                <StyledFormSelect value={interruptor}
                                                  onChange={({target}) => setInterruptor(target.value)}>
                                    <option value="">Seleccione un interruptor</option>
                                    {loadingInterruptores ?
                                        <option disabled>Cargando...</option> : interruptores.map(item => (
                                            <option key={item.idinterruptores}
                                                    value={item.idinterruptores}>{item.nombre}</option>
                                        ))}
                                </StyledFormSelect>
                            </Col>
                        </Row>

                        <Row xs={12}>
                            <Col xs={6} md={4} className={`${!numeroOperaciones && formError ? 'errorForm' : ''}`}>
                                <RequiredLabel>Número de Operaciones</RequiredLabel>
                                <InputForm type="number" value={numeroOperaciones}
                                           onChange={({target}) => setNumeroOperaciones(target.value)}/>
                            </Col>
                            <Col xs={6} md={4} className={`${!corrienteFalla && formError ? 'errorForm' : ''}`}>
                                <RequiredLabel>Corriente de Falla (A)</RequiredLabel>
                                <InputForm type="number" step="0.001" value={corrienteFalla}
                                           onChange={({target}) => setCorrienteFalla(target.value)}/>
                            </Col>
                        </Row>
                        <Row xs={12}>
                            <Col xs={4}><RequiredLabel>Tiempo Apertura A (ms)</RequiredLabel><InputForm
                                value={tiempoAperturaA}
                                onChange={({target}) => setTiempoAperturaA(target.value)}/></Col>
                            <Col xs={4}><RequiredLabel>Tiempo Apertura B (ms)</RequiredLabel><InputForm
                                value={tiempoAperturaB}
                                onChange={({target}) => setTiempoAperturaB(target.value)}/></Col>
                            <Col xs={4}><RequiredLabel>Tiempo Apertura C (ms)</RequiredLabel><InputForm
                                value={tiempoAperturaC}
                                onChange={({target}) => setTiempoAperturaC(target.value)}/></Col>
                        </Row>

                        <Row xs={12}>
                            <Col xs={4}><RequiredLabel>Tiempo Cierre A (ms)</RequiredLabel><InputForm
                                value={tiempoCierreA} onChange={({target}) => setTiempoCierreA(target.value)}/></Col>
                            <Col xs={4}><RequiredLabel>Tiempo Cierre B (ms)</RequiredLabel><InputForm
                                value={tiempoCierreB} onChange={({target}) => setTiempoCierreB(target.value)}/></Col>
                            <Col xs={4}><RequiredLabel>Tiempo Cierre C (ms)</RequiredLabel><InputForm
                                value={tiempoCierreC} onChange={({target}) => setTiempoCierreC(target.value)}/></Col>
                        </Row>

                        <Row xs={12}>
                            <Col xs={4}><RequiredLabel>Resistencia Contactos R (Ω)</RequiredLabel><InputForm
                                value={resistenciaContactosR}
                                onChange={({target}) => setResistenciaContactosR(target.value)}/></Col>
                            <Col xs={4}><RequiredLabel>Resistencia Contactos S (Ω)</RequiredLabel><InputForm
                                value={resistenciaContactosS}
                                onChange={({target}) => setResistenciaContactosS(target.value)}/></Col>
                            <Col xs={4}><RequiredLabel>Resistencia Contactos T (Ω)</RequiredLabel><InputForm
                                value={resistenciaContactosT}
                                onChange={({target}) => setResistenciaContactosT(target.value)}/></Col>
                        </Row>

                        <Row xs={12}>
                            <Col xs={12} md={3}>
                                <SButton onClick={showCancelModal}>Cancelar</SButton>
                            </Col>
                            <Col xs={12} md={3}>
                                <PButton type="submit">Enviar</PButton>
                            </Col>
                        </Row>
                    </StyledForm>
                </Container>
            </Col>

            <CancelAceptModal showModal={show} handleCloseModal={handleCloseModal} title={title} message={message}
                              handleConfirmSubmit={handleConfirmSubmit} subTitle={subTitle}/>
            {showSpinner && (<div className="divSpinner"><Spinner/></div>)}
        </DivForm>
    );
};
