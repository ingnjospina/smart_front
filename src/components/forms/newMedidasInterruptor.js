import '../../styles/spinner.css';
import React, {useEffect, useState} from 'react';
import {Alert, Col, Container, Row} from 'react-bootstrap';
import {DivForm, InputForm, LabelForm, PButton, SButton, StyledForm, StyledFormSelect} from '../tools/styleContent';
import {CancelAceptModal} from '../modals/cancelAceptModal';
import {createMedidasInterruptores, getInterruptores} from '../../services/interruptor.services';
import {Spinner} from '../tools/spinner';
import {useNavigate} from 'react-router-dom';
import {UseLogout2} from "../../hooks/useLogout2";

export const NewMedidasInterruptor = () => {
    const navigate = useNavigate();
    const {logOut} = UseLogout2();

    const [interruptor, setInterruptor] = useState('');
    const [interruptores, setInterruptores] = useState([]);
    const [loadingInterruptores, setLoadingInterruptores] = useState(true);

    // Estados para los campos del formulario
    const [numeroOperaciones, setNumeroOperaciones] = useState('');
    const [tiempoApertura, setTiempoApertura] = useState('');
    const [tiempoCierre, setTiempoCierre] = useState('');
    const [corrienteFalla, setCorrienteFalla] = useState('');
    const [resistenciaContactos, setResistenciaContactos] = useState('');

    // Estados para manejo de alertas y modales
    const [formError, setFormError] = useState(false);
    const [show, setShow] = useState(false);
    const [showAlert, setShowAlert] = useState(false);
    const [title, setTitle] = useState('');
    const [subTitle, setSubTitle] = useState('');
    const [message, setMessage] = useState('');
    const [showSpinner, setShowSpinner] = useState(false);

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

        if (!interruptor || !numeroOperaciones || !tiempoApertura || !tiempoCierre || !corrienteFalla || !resistenciaContactos) {
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
                tiempo_apertura: parseFloat(tiempoApertura),
                tiempo_cierre: parseFloat(tiempoCierre),
                corriente_falla: parseFloat(corrienteFalla),
                resistencia_contactos: parseFloat(resistenciaContactos),
            };

            const response = await createMedidasInterruptores(user.token, data);
            setTitle('Medición Registrada');
            setSubTitle('Datos guardados exitosamente');
            setMessage(`Medición registrada con éxito. ID: ${response.data.id}`);
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

    return (<DivForm className="newReportContent">
        <Col xs={12} className={'formBackground'}>
            <Container>
                <StyledForm onSubmit={createMeasurement}>
                    {showAlert && (<Alert variant="danger" onClose={() => setShowAlert(false)} dismissible
                                          className="alert-center">
                        <p>Por favor complete todos los campos del formulario.</p>
                    </Alert>)}

                    <Row xs={12}>
                        <Col xs={12} md={6} className={`${!interruptor && formError ? 'errorForm' : ''}`}>
                            <LabelForm>Interruptor</LabelForm>
                            <StyledFormSelect
                                value={interruptor}
                                onChange={({target}) => setInterruptor(target.value)}
                            >
                                <option value="">Seleccione un interruptor</option>
                                {loadingInterruptores ? (
                                    <option disabled>Cargando...</option>) : (interruptores.map((item) => (
                                    <option key={item.idinterruptores} value={item.idinterruptores}>
                                        {item.nombre}
                                    </option>)))}
                            </StyledFormSelect>
                        </Col>
                    </Row>

                    <Row xs={12}>
                        <Col xs={6} md={4} className={`${!numeroOperaciones && formError ? 'errorForm' : ''}`}>
                            <LabelForm>Número de Operaciones</LabelForm>
                            <InputForm type="number" value={numeroOperaciones}
                                       onChange={({target}) => setNumeroOperaciones(target.value)}/>
                        </Col>
                        <Col xs={6} md={4} className={`${!tiempoApertura && formError ? 'errorForm' : ''}`}>
                            <LabelForm>Tiempo de Apertura (s)</LabelForm>
                            <InputForm type="number" step="0.001" value={tiempoApertura}
                                       onChange={({target}) => setTiempoApertura(target.value)}/>
                        </Col>
                        <Col xs={6} md={4} className={`${!tiempoCierre && formError ? 'errorForm' : ''}`}>
                            <LabelForm>Tiempo de Cierre (s)</LabelForm>
                            <InputForm type="number" step="0.001" value={tiempoCierre}
                                       onChange={({target}) => setTiempoCierre(target.value)}/>
                        </Col>
                    </Row>

                    <Row xs={12}>
                        <Col xs={6} md={4} className={`${!corrienteFalla && formError ? 'errorForm' : ''}`}>
                            <LabelForm>Corriente de Falla (A)</LabelForm>
                            <InputForm type="number" step="0.001" value={corrienteFalla}
                                       onChange={({target}) => setCorrienteFalla(target.value)}/>
                        </Col>
                        <Col xs={6} md={4} className={`${!resistenciaContactos && formError ? 'errorForm' : ''}`}>
                            <LabelForm>Resistencia de Contactos (Ω)</LabelForm>
                            <InputForm type="number" step="0.001" value={resistenciaContactos}
                                       onChange={({target}) => setResistenciaContactos(target.value)}/>
                        </Col>
                    </Row>

                    <br/>
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

        {showSpinner && (<div className="divSpinner">
            <Spinner/>
        </div>)}
    </DivForm>);
};
