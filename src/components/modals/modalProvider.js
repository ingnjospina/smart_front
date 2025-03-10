import React, { useEffect, useState } from 'react'
import { Modal } from 'react-bootstrap'
import { ModalFormProvider } from '../tools/styleContent'
import { PropTypes } from 'prop-types'
import { ProviderForm } from '../forms/providerForm'

export const ModalProvider = (props) => {

	const [show, setShow] = useState(true)

	useEffect(() => {
		
	})
	const handleConfirm = (text) => {
		props.handleConfirmSubmit(text)
	}

	const handleCloseModal = () => {
		props.handleCloseModal()
	}

	const close = () => {
		setShow(false)
		setTimeout(() => {
			setShow(true)
		}, 1000)
	}

	return (
		<ModalFormProvider show={props.showModal && show} onHide={props.handleCloseModal} className='modalAcept'>
			<Modal.Header>
				<Modal.Title>{props.type} Medicion </Modal.Title>
			</Modal.Header>
			<Modal.Body style={{ height: 'auto !important' }} className='hla'>
				<ProviderForm type={props.type} handleConfirm={handleConfirm} close={close} idProvider={props.idProvider} handleCloseModal={handleCloseModal}/>
			</Modal.Body>

		</ModalFormProvider>
	)
}

ModalProvider.propTypes = {
	type: PropTypes.string.isRequired,
	idProvider: PropTypes.string.isRequired,
	showModal: PropTypes.bool.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	handleConfirmSubmit: PropTypes.func.isRequired,
}
