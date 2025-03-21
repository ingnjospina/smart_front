import React, {useEffect, useState} from "react";
import {Col, Container, Table} from "react-bootstrap";
import {DivForm, StyledForm, StyledTD, StyledTH} from "../tools/styleContent";
import {Spinner} from "../tools/spinner";
import {UseLogout} from "../../hooks/useLogout";
import {deleteInterruptores, getInterruptores} from "../../services/interruptor.services";
import {EditInterruptorModal} from "../modals/EditInterruptorModal";

export const InterruptoresTable = () => {
    const logout = UseLogout();
    const [interruptores, setInterruptores] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showSpinner, setShowSpinner] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [selectedInterruptorId, setSelectedInterruptorId] = useState(null);

    useEffect(() => {
        fetchInterruptores();
    }, []);

    const fetchInterruptores = async () => {
        try {
            setShowSpinner(true);
            const user = JSON.parse(window.localStorage.getItem("loggedAppUser")) || {};
            if (!user.token) {
                console.error("Usuario no autenticado.");
                setLoading(false);
                setShowSpinner(false);
                return;
            }
            const response = await getInterruptores(user.token);
            setInterruptores(response ?? []);
            setLoading(false);
            setShowSpinner(false);
        } catch (error) {
            console.error("Error al obtener los interruptores:", error);
            setInterruptores([]);
            setLoading(false);
            setShowSpinner(false);
            logout.logOut();
        }
    };

    const handleEdit = (id) => {
        setSelectedInterruptorId(id);
        setShowEditModal(true);
    };

    const handleDelete = async (id) => {
        if (window.confirm("¿Estás seguro de que deseas eliminar este interruptor?")) {
            try {
                const user = JSON.parse(window.localStorage.getItem("loggedAppUser")) || {};
                await deleteInterruptores(user.token, id);
                setInterruptores(interruptores.filter((interruptor) => interruptor.idinterruptores !== id));
            } catch (error) {
                console.error("Error al eliminar el interruptor:", error);
            }
        }
    };

    return (
        <div className="container">
            <DivForm>
                <Col xs={12} className="formBackground">
                    <Container>
                        <StyledForm>
                            <Table responsive="sm">
                                <thead>
                                <tr>
                                    <StyledTH>ID</StyledTH>
                                    <StyledTH>Nombre</StyledTH>
                                    <StyledTH>Descripción</StyledTH>
                                    <StyledTH>Nivel de Tensión</StyledTH>
                                    <StyledTH>Subestación</StyledTH>
                                    <StyledTH>Acciones</StyledTH>
                                </tr>
                                </thead>
                                <tbody>
                                {interruptores.length > 0 ? (
                                    interruptores.map((interruptor) => (
                                        <tr key={interruptor.idinterruptores}>
                                            <StyledTD>{interruptor.idinterruptores}</StyledTD>
                                            <StyledTD>{interruptor.nombre}</StyledTD>
                                            <StyledTD>{interruptor.descripcion}</StyledTD>
                                            <StyledTD>{interruptor.niveles_tension}</StyledTD>
                                            <StyledTD>{interruptor.subestacion}</StyledTD>
                                            <StyledTD>
                                                <a href='#' onClick={() => handleEdit(interruptor.idinterruptores)}
                                                   style={{marginRight: "10px"}}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"
                                                         viewBox="0 0 26 26" fill="none">
                                                        <path
                                                            d="M9.0971 14.2644C9.08195 14.2837 9.0668 14.304 9.06 14.3285L7.89074 18.6153C7.82256 18.8649 7.8924 19.1339 8.07716 19.3235C8.21536 19.4585 8.39744 19.5327 8.59138 19.5327C8.65542 19.5327 8.7196 19.525 8.78276 19.5082L13.0392 18.3473C13.046 18.3473 13.0493 18.3533 13.0545 18.3533C13.1034 18.3533 13.1514 18.3355 13.1877 18.2984L24.5696 6.9182C24.9076 6.57968 25.093 6.11854 25.093 5.61682C25.093 5.04833 24.8519 4.48007 24.4297 4.05894L23.3547 2.98231C22.9332 2.56007 22.3641 2.31851 21.7959 2.31851C21.2943 2.31851 20.8332 2.50395 20.4942 2.84162L9.11404 14.2249C9.10222 14.2357 9.10554 14.2518 9.0971 14.2644ZM23.4558 5.80366L22.3253 6.93335L20.4926 5.07153L21.6071 3.95699C21.7832 3.77992 22.1247 3.80575 22.327 4.00882L23.4027 5.08546C23.5149 5.19752 23.5789 5.34671 23.5789 5.49424C23.5782 5.61516 23.5351 5.72488 23.4558 5.80366ZM11.1213 14.4432L19.3343 6.2298L21.1679 8.09286L12.9702 16.2902L11.1213 14.4432ZM9.62493 17.7732L10.2184 15.5947L11.8016 17.178L9.62493 17.7732ZM23.5532 10.3134C23.1223 10.3134 22.7431 10.6637 22.7414 11.1004V21.7495C22.7414 22.3059 22.2896 22.7374 21.7323 22.7374H4.22569C3.66927 22.7374 3.25457 22.306 3.25457 21.7495V4.22398C3.25457 3.66716 3.66925 3.24793 4.22569 3.24793H16.2401C16.6734 3.24793 17.0249 2.86292 17.0249 2.42954C17.0249 1.99701 16.6734 1.62512 16.2401 1.62512H4.10596C2.74947 1.62512 1.62207 2.74779 1.62207 4.10509V21.8693C1.62207 23.2267 2.7495 24.3683 4.10596 24.3683H21.8511C23.2085 24.3683 24.3639 23.2267 24.3639 21.8693V11.0955C24.3622 10.6637 23.9839 10.3134 23.5532 10.3134Z"
                                                            fill="#99ABB4"/>
                                                    </svg>
                                                </a>
                                                <a href='#' onClick={() => handleDelete(interruptor.idinterruptores)}
                                                   style={{color: "red"}}>
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="26" height="26"
                                                         viewBox="0 0 26 26" fill="none">
                                                        <path
                                                            d="M3 6H23M10 11V18M16 11V18M5 6L6 22C6 22.55 6.45 23 7 23H19C19.55 23 20 22.55 20 22L21 6M8 6V4C8 3.45 8.45 3 9 3H17C17.55 3 18 3.45 18 4V6"
                                                            stroke="#99ABB4" strokeWidth="2" strokeLinecap="round"
                                                            strokeLinejoin="round"/>
                                                    </svg>
                                                </a>
                                            </StyledTD>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <StyledTD colSpan="4">No hay interruptores disponibles.</StyledTD>
                                    </tr>
                                )}
                                </tbody>
                            </Table>
                        </StyledForm>
                    </Container>
                </Col>
                {showSpinner && (
                    <div className="divSpinner">
                        <Spinner/>
                    </div>
                )}
            </DivForm>
            <EditInterruptorModal
                show={showEditModal}
                handleClose={() => setShowEditModal(false)}
                interruptorId={selectedInterruptorId}
                onUpdate={fetchInterruptores} // Recargar la lista después de actualizar
            />
            {
                loading ? (
                        <div className={'divSpinner'}>
                            <Spinner/>
                        </div>
                    ) :
                    (
                        <></>
                    )
            }
        </div>
    );
};

export default InterruptoresTable;
