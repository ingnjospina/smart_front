import React, { useState } from 'react'
import { Modal } from 'react-bootstrap'
import { ModalFormProvider } from '../tools/styleContent'
import { PropTypes } from 'prop-types'
import { NewActionForm } from '../forms/newActionForm'

export const ModalAddAction = (props) => {

	console.log(props.type)
	const [show, setShow] = useState(true)

	const handleConfirm = (text) => {
		props.handleConfirmSubmit(text)
	}

	const handleCloseModal = () => {
		props.handleCloseModal()
	}

	const newActionR = (action) => {
		props.newActionR(action)
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
				<Modal.Title>{props.type} Nueva Tarea </Modal.Title>
			</Modal.Header>
			<Modal.Body style={{ height: 'auto !important' }} className='hla'>
				<NewActionForm type={props.type} handleConfirm={handleConfirm} close={close} idProvider={props.idProvider} handleCloseModal={handleCloseModal} newActionR={newActionR}/>
			</Modal.Body>

		</ModalFormProvider>
	)
}

ModalAddAction.propTypes = {
	type: PropTypes.string.isRequired,
	idProvider: PropTypes.string.isRequired,
	showModal: PropTypes.bool.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	handleConfirmSubmit: PropTypes.func.isRequired,
	newActionR: PropTypes.func.isRequired
}
