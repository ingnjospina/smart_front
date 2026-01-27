import React from 'react'
import { Modal } from 'react-bootstrap'
import { PropTypes } from 'prop-types'
import { PButton, SButton } from '../tools/styleContent'

export const CancelAceptModal = ({ subTitle, ...props }) => {

	const handleConfirm = (text) => {
		props.handleConfirmSubmit(text)
	}

	return (
		<Modal show={props.showModal} onHide={props.handleCloseModal} className='modalAcept'>
			<Modal.Header closeButton>
				<Modal.Title>{props.title}</Modal.Title>
			</Modal.Header>
			<Modal.Body>
				{subTitle && (
					<div style={{ marginBottom: '10px' }}>
						<strong>{subTitle}</strong>
					</div>
				)}
				<div style={{ whiteSpace: 'pre-line', lineHeight: '1.6' }}>
					{props.message}
				</div>
			</Modal.Body>
			<Modal.Footer>
				{
					props.title === 'Cancelar Reporte' ?
						(
							<>
								<SButton onClick={props.handleCloseModal}>
									Cancelar
								</SButton>
								<PButton onClick={() => handleConfirm('Cancel')}>
									Aceptar
								</PButton>
							</>
						) :

						props.title === 'Medición Actualizada' || props.title === 'Proveedor registrado' || props.title === 'Tarea registrada' || props.title === 'Pronóstico Realizado' ?

							(
								<PButton onClick={() => handleConfirm('Edit')}>
									Aceptar
								</PButton>
							)
							:
							(
								props.title === 'Error' ?
									(
										<PButton onClick={() => handleConfirm('Acept')}>
											Aceptar
										</PButton>
									) : (
										<PButton onClick={() => handleConfirm('Cancel')}>
											Aceptar
										</PButton>
									)
							)
				}

			</Modal.Footer>
		</Modal>
	)
}

CancelAceptModal.propTypes = {
	showModal: PropTypes.bool.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	title: PropTypes.string.isRequired,
	subTitle: PropTypes.string.isRequired,
	message: PropTypes.string.isRequired,
	handleConfirmSubmit: PropTypes.func.isRequired,
}