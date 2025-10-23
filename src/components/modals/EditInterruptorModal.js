import React, {useEffect, useState} from "react";
import {Form, Modal, Spinner} from "react-bootstrap";
import {getInterruptorById, updateInterruptores} from "../../services/interruptor.services";
import {PButton, SButton} from "../tools/styleContent";

export const EditInterruptorModal = ({show, handleClose, interruptorId, onUpdate}) => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [nivelesTension, setNivelesTension] = useState("");
    const [subestacion, setSubestacion] = useState("");
    const [loading, setLoading] = useState(true);

    // Datos quemados para los selectores
    const nivelesTensionOptions = ["115kV", "34.5kV", "13.8kV"];
    const subestacionesOptions = ["Calima"];

    useEffect(() => {
        if (show && interruptorId) {
            fetchInterruptorData();
        }
    }, [show, interruptorId]);

    const fetchInterruptorData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(window.localStorage.getItem("loggedAppUser"));
            const response = await getInterruptorById(user.token, interruptorId);
            setNombre(response.nombre);
            setDescripcion(response.descripcion);
            setNivelesTension(response.niveles_tension);
            setSubestacion(response.subestacion);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener los datos del interruptor:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = JSON.parse(window.localStorage.getItem("loggedAppUser"));
            await updateInterruptores(user.token, interruptorId, {
                nombre,
                descripcion,
                niveles_tension: nivelesTension,
                subestacion
            });
            onUpdate(); // Recargar la lista de interruptores después de actualizar
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el interruptor:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Interruptor</Modal.Title>
            </Modal.Header>
            <Modal.Body>
                {loading ? (
                    <div className="text-center">
                        <Spinner animation="border" role="status">
                            <span className="visually-hidden">Cargando...</span>
                        </Spinner>
                    </div>
                ) : (
                    <Form onSubmit={handleSubmit}>
                        {/* Nombre */}
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Descripción */}
                        <Form.Group className="mb-3">
                            <Form.Label>Descripción</Form.Label>
                            <Form.Control
                                as="textarea"
                                rows={3}
                                value={descripcion}
                                onChange={(e) => setDescripcion(e.target.value)}
                                required
                            />
                        </Form.Group>

                        {/* Selector de Niveles de Tensión */}
                        <Form.Group className="mb-3">
                            <Form.Label>Niveles de Tensión</Form.Label>
                            <Form.Select
                                value={nivelesTension}
                                onChange={(e) => setNivelesTension(e.target.value)}
                                required
                            >
                                <option value="">Seleccione un nivel de tensión</option>
                                {nivelesTensionOptions.map((nivel, index) => (
                                    <option key={index} value={nivel}>{nivel}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Selector de Subestación */}
                        <Form.Group className="mb-3">
                            <Form.Label>Subestación</Form.Label>
                            <Form.Select
                                value={subestacion}
                                onChange={(e) => setSubestacion(e.target.value)}
                                required
                            >
                                <option value="">Seleccione una subestación</option>
                                {subestacionesOptions.map((sub, index) => (
                                    <option key={index} value={sub}>{sub}</option>
                                ))}
                            </Form.Select>
                        </Form.Group>

                        {/* Botones */}
                        <div className="d-flex justify-content-between">
                            <SButton onClick={handleClose} className="me-2">Cancelar</SButton>
                            <PButton type="submit">Actualizar</PButton>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};
