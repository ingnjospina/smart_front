import React, { useState, useEffect } from "react";
import { Modal, Button, Form, Spinner } from "react-bootstrap";
import { PButton, SButton } from "../tools/styleContent";
import {getTransformadorById, updateTransformadores} from "../../services/transformer.services";

export const EditTransformadorModal = ({ show, handleClose, transformadorId, onUpdate }) => {
    const [nombre, setNombre] = useState("");
    const [descripcion, setDescripcion] = useState("");
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        if (show && transformadorId) {
            fetchTransformadorData();
        }
    }, [show, transformadorId]);

    const fetchTransformadorData = async () => {
        try {
            setLoading(true);
            const user = JSON.parse(window.localStorage.getItem("loggedAppUser"));
            const response = await getTransformadorById(user.token, transformadorId);
            setNombre(response.nombre);
            setDescripcion(response.descripcion);
            setLoading(false);
        } catch (error) {
            console.error("Error al obtener los datos del transformador:", error);
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();

        try {
            const user = JSON.parse(window.localStorage.getItem("loggedAppUser"));
            await updateTransformadores(user.token, transformadorId, { nombre, descripcion });
            onUpdate(); // Recargar la lista después de actualizar
            handleClose();
        } catch (error) {
            console.error("Error al actualizar el transformador:", error);
        }
    };

    return (
        <Modal show={show} onHide={handleClose} centered>
            <Modal.Header closeButton>
                <Modal.Title>Editar Transformador</Modal.Title>
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
                            <PButton type="submit">Actualizar</PButton>
                        </div>
                    </Form>
                )}
            </Modal.Body>
        </Modal>
    );
};
