import React, { useEffect, useState } from 'react'
import { getActions } from '../../services/actions.services'
import { Modal } from 'react-bootstrap'
import { ModalFormProvider, SButton, StyledTH, StyledTD } from '../tools/styleContent'
import { PropTypes } from 'prop-types'
import { UseRefreshToken } from '../../hooks/useRefreshToken'
import { Spinner } from '../tools/spinner'
import { StyledFormSuccess, StyledFormReject, StyledFormPend, TitleReport, RowData } from '../tools/styleContent'
import { patchAction } from '../../services/actions.services'
import { Table } from 'react-bootstrap'
import { useNavigate } from 'react-router'
import { useUser } from '../../hooks/useUser'

export const ModalActions = (props) => {
	console.log('ModalActions se está renderizando')
	//const logout = UseLogout()
	const refreshToken = UseRefreshToken()
	const { user } = useUser()
	const nav = useNavigate()

	const [showSpinner, setShowSpinner] = useState(false)
	const [show, setShow] = useState(true)
	const [report, setReport] = useState([])
	const [request, setrequest] = useState([])

	useEffect(() => {
		if (props.clicked) {
			fetchData()
		}
	}, [props.clicked])

	const fetchData = async () => {
		try {
			setShowSpinner(true)
			setTimeout(() => {

			}, 3000)
			const respond = await getActions(user.idUsuario, user.token, props.idProvider)
			console.log(respond)
			await refreshToken.refreshToken(respond)
			setReport(respond.actions.actionsReport)
			setrequest(respond.actions.actionsSol)
			setShowSpinner(false)
			props.updateClicked(false)
		} catch (error) {
			setShow(false)
			setShowSpinner(false)
			window.localStorage.removeItem('loggedAppUser')
			nav('/')
		}
	}

	const setAction = async (idAction, estado) => {
		setShowSpinner(true)
		try {
			const respond = await patchAction(user.idUsuario, user.token, idAction, estado)
			await refreshToken.refreshToken(respond)
			props.updateClicked(true)
			setShowSpinner(false)
			props.updateClicked(false)
			fetchData()
		} catch (error) {
			setShow(false)
			setShowSpinner(false)
			window.localStorage.removeItem('loggedAppUser')
			nav('/')
		}
	}

	const getDate = (dateStr) => {
		const fecha = new Date(dateStr)

		const dia = fecha.getDate()
		const mes = fecha.getMonth() + 1
		const anio = fecha.getFullYear()

		return `${anio}-${mes.toString().padStart(2, '0')}-${dia.toString().padStart(2, '0')}`
	}

	console.log(props.nameProvider)
	return (
		<ModalFormProvider show={props.showModal} onHide={props.handleCloseModal} className='modalAcept'>
			<Modal.Header closeButton>
				<Modal.Title>Actividades</Modal.Title>
			</Modal.Header>
			<Modal.Body style={{ height: 'auto !important' }} className='hla'>
				{
					!show ? (
						'No se encontraron acciones.'
					) : (
						<>
							<RowData>
								<TitleReport>Reportes y Mantenimiento</TitleReport>
								<Table responsive="sm">
									<thead>
										<tr>
											<StyledTH>Ticket</StyledTH>
											<StyledTH>Reporte</StyledTH>
											<StyledTH>Actividad Realizada</StyledTH>
											<StyledTH>Estado</StyledTH>
											<StyledTH>Fecha</StyledTH>
										</tr>
									</thead>
									<tbody>
										{
											report.map((action, key) => {
												return (
													<tr id={key} key={key}>
														<StyledTD>
															{action.ticket}
														</StyledTD>
														<StyledTD>
															{action.edificio} - {action.ubicacion}
														</StyledTD>
														<StyledTD>
															{action.accion}
														</StyledTD>
														<StyledTD>
															{
																action.estado === 'APROBADO' ? (
																	<StyledFormSuccess
																		aria-label="Default select example"
																		value={action.estado}
																		name='tipoProveedor'
																		placeholder='tipo'
																		onChange={(e) => setAction(action.idAccion, e.target.value)}
																	>
																		<option></option>
																		<option value="RECHAZADO">Rechazado</option>
																		<option value="APROBADO">Aprobado</option>
																		<option value="PENDIENTE">Pendiente</option>
																	</StyledFormSuccess>
																)
																	: (
																		action.estado === 'RECHAZADO' ? (
																			<StyledFormReject
																				aria-label="Default select example"
																				value={action.estado}
																				name='tipoProveedor'
																				placeholder='tipo'
																				onChange={(e) => setAction(action.idAccion, e.target.value)}
																			>
																				<option></option>
																				<option value="RECHAZADO">Rechazado</option>
																				<option value="APROBADO">Aprobado</option>
																				<option value="PENDIENTE">Pendiente</option>
																			</StyledFormReject>
																		) : (
																			action.estado === 'PENDIENTE' ? (
																				<StyledFormPend
																					aria-label="Default select example"
																					value={action.estado}
																					name='tipoProveedor'
																					placeholder='tipo'
																					onChange={(e) => setAction(action.idAccion, e.target.value)}
																				>
																					<option></option>
																					<option value="RECHAZADO">Rechazado</option>
																					<option value="APROBADO">Aprobado</option>
																					<option value="PENDIENTE">Pendiente</option>
																				</StyledFormPend>
																			) : (
																				<></>
																			)
																		)
																	)
															}

														</StyledTD>
														<StyledTD>
															{getDate(action.fechaCreacion)}
														</StyledTD>
													</tr>
												)
											})
										}
									</tbody>
								</Table>
							</RowData>
							<RowData>
								<TitleReport>Solicitudes de Bienes y Servicios</TitleReport>
								<Table responsive="sm">
									<thead>
										<tr>
											<StyledTH>Ticket</StyledTH>
											<StyledTH>Solicitud</StyledTH>
											<StyledTH>Actividad Realizada</StyledTH>
											<StyledTH>Estado</StyledTH>
											<StyledTH>Fecha</StyledTH>
										</tr>
									</thead>
									<tbody>
										{
											request.map((action, key) => {
												return (
													<tr id={key} key={key}>
														<StyledTD>
															{action.ticket}
														</StyledTD>
														<StyledTD>
															{action.tipoSolicitud} - {action.productoSolicitado}
														</StyledTD>
														<StyledTD>
															{action.accion}
														</StyledTD>
														<StyledTD>
															{
																action.estado === 'APROBADO' ? (
																	<StyledFormSuccess
																		aria-label="Default select example"
																		value={action.estado}
																		name='tipoProveedor'
																		placeholder='tipo'
																		onChange={(e) => setAction(action.idAccion, e.target.value)}
																	>
																		<option></option>
																		<option value="RECHAZADO">Rechazado</option>
																		<option value="APROBADO">Aprobado</option>
																		<option value="PENDIENTE">Pendiente</option>
																	</StyledFormSuccess>
																)
																	: (
																		action.estado === 'RECHAZADO' ? (
																			<StyledFormReject
																				aria-label="Default select example"
																				value={action.estado}
																				name='tipoProveedor'
																				placeholder='tipo'
																				onChange={(e) => setAction(action.idAccion, e.target.value)}
																			>
																				<option></option>
																				<option value="RECHAZADO">Rechazado</option>
																				<option value="APROBADO">Aprobado</option>
																				<option value="PENDIENTE">Pendiente</option>
																			</StyledFormReject>
																		) : (
																			action.estado === 'PENDIENTE' ? (
																				<StyledFormPend
																					aria-label="Default select example"
																					value={action.estado}
																					name='tipoProveedor'
																					placeholder='tipo'
																					onChange={(e) => setAction(action.idAccion, e.target.value)}
																				>
																					<option></option>
																					<option value="RECHAZADO">Rechazado</option>
																					<option value="APROBADO">Aprobado</option>
																					<option value="PENDIENTE">Pendiente</option>
																				</StyledFormPend>
																			) : (
																				<></>
																			)
																		)
																	)
															}

														</StyledTD>
														<StyledTD>
															{getDate(action.fechaCreacion)}
														</StyledTD>
													</tr>
												)
											})
										}
									</tbody>
								</Table>
							</RowData>
						</>
					)
				}
			</Modal.Body>
			<Modal.Footer>
				<SButton onClick={props.handleCloseModal}>
					Cancelar
				</SButton>
			</Modal.Footer>
			{
				showSpinner ? (
					<div className={'divSpinner'}>
						<Spinner />
					</div>
				) :
					(
						<></>
					)
			}
		</ModalFormProvider>
	)
}

ModalActions.propTypes = {
	idProvider: PropTypes.string.isRequired,
	showModal: PropTypes.bool.isRequired,
	handleCloseModal: PropTypes.func.isRequired,
	clicked: PropTypes.bool.isRequired,
	updateClicked: PropTypes.func.isRequired,
	nameProvider: PropTypes.string.isRequired
}
