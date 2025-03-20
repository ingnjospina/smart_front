import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import {getInterruptorById, updateInterruptores} from "../../services/interruptor.services";
import {PButton, SButton} from "../tools/styleContent";

export const EditInterruptorModal = ({ show, handleClose, interruptorId, onUpdate }) => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show && interruptorId) {
            fetchInterruptorData();
        }
    }, [show, interruptorId]);

    const fetchInterruptorData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(window.localStorage.getItem("loggedAppUser"));
            const response = await getInterruptorById(user.token,interruptorId);
            setNombre(response.nombre);
            setDescripcion(response.descripcion);
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
            await updateInterruptores(user.token,interruptorId, { nombre, descripcion });
            onUpdate(); // Recargar la lista de interruptores después de actualizar
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el interruptor:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton >
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
                        <Form.Group className="mb-3">
                            <Form.Label>Nombre</Form.Label>
                            <Form.Control
                                type="text"
                                value={nombre}
                                onChange={(e) => setNombre(e.target.value)}
                                required
                            />
                        </Form.Group>

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

                        <div className="d-flex justify-content-between">
                            <SButton onClick={handleClose} className="me-2">Cancelar</SButton>
                            <PButton onClick={handleSubmit}>Actualizar</PButton>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};
