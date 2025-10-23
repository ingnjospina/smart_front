import React, { useState } from 'react'
import { assign } from '../../services/report.services'
import { Col, Form, Row } from 'react-bootstrap'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { ColWhite, LeftReport, PButton, RightReport, RowData, StyledFormSelect, SubTitleReport, TitleReport } from '../tools/styleContent'
import { PropTypes } from 'prop-types'
import { Spinner } from '../tools/spinner'
import { UseLogout } from '../../hooks/useLogout'
import { UseRefreshToken } from '../../hooks/useRefreshToken'
import { useUser } from '../../hooks/useUser'


export const Dependence = (props) => {
	const { user } = useUser()
	const logOut = UseLogout()
	const refreshToken = UseRefreshToken()
	const allProveedores = props.data.allProveedores

	const [proveedor, setProveedor] = useState('')
	const [titular, setTitular] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)
	const [formError, setFormError] = useState(false)
	const [show, setShow] = useState(false)
	const [subTitle] = useState('')
	const [title, setTitle] = useState('')
	const [message, setMessage] = useState('')

	const handleCloseModal = () => { setShow(false) }


	const assignSupplier = async (e) => {
		e.preventDefault()
		setShowSpinner(true)
		if (!proveedor) {
			setFormError(true)
			setShowSpinner(false)
			return
		}

		try {
			const respond = await assign(user.idUsuario, user.token, proveedor, props.data.idReporte)
			setTitle('Asignación')
			await refreshToken.refreshToken(respond)
			setMessage('El proveedor fue asignado correctamente')
			const newProveedor = allProveedores.filter(p => p.idProveedor === respond.Proveedores_idProveedor)
			setTitular(newProveedor[0].nombreTitular)
		}
		catch (e) {
			setTitle('Error')
			if (e.response?.data?.error?.name === 'TokenExpiredError') {
				logOut.logOut()
			}
			setMessage('No puedes realizar esta acción.')
		}
		setShow(true)
		setShowSpinner(false)
	}

	const handleConfirmSubmit = () => {
		setShow(false)
	}

	return (
		<>
			<ColWhite xs={12} lg={4}>
				<div >
					<Row xs={12}>
						<Col xs={12}>
							<TitleReport>Dependencia</TitleReport>
						</Col>
						<Col xs={12}>
							<SubTitleReport>Proveedor</SubTitleReport>
						</Col>
					</Row>
					<RowData xs={12}>
						<Col xs={6} lg={6}>
							<LeftReport>
								Profesional:
							</LeftReport>
						</Col>
						<Col xs={6} lg={6}>
							<RightReport>
								{
									titular ?
										titular :
										props.data.proveedor ?
											props.data.proveedor.nombreTitular :
											'No asignado'
								}
							</RightReport>
						</Col>
					</RowData>
					<RowData xs={12}>
						<Col xs={6} lg={6}>
							<LeftReport>
								Ticket:
							</LeftReport>
						</Col>
						<Col xs={6} lg={6}>
							<RightReport>
								{props.data.ticket}
							</RightReport>
						</Col>
					</RowData>
					{
						props.data.rol === 'ADMIN' ? (
							<Row xs={12}>
								<Form onSubmit={assignSupplier} className={`${!proveedor && formError ? 'errorForm' : ''}`}>
									<StyledFormSelect
										value={proveedor}
										name='proveedor'
										onChange={({ target }) => {
											setProveedor(target.value)
										}}
										placeholder="Selecciona una opción"
									>
										<option></option>
										{
											allProveedores.map(user => {
												return (
													<option value={user.idProveedor} key={user.idUsuario} name={user.nombreTitular}>{user.nombreTitular}</option>
												)
											})
										}
									</StyledFormSelect>
									<div style={{ marginTop: '20px' }}>
										<PButton> Asignar </PButton>
									</div>
								</Form>
							</Row>
						) : (
							<></>
						)
					}
				</div>
			</ColWhite>
			<CancelAceptModal
				showModal={show}
				handleCloseModal={handleCloseModal}
				title={title}
				message={message}
				handleConfirmSubmit={handleConfirmSubmit}
				subTitle={subTitle}
			/>
			{
				showSpinner ? (
					<div className='divSpinner'>
						<Spinner />
					</div>
				) :
					(
						<></>
					)
			}
		</>
	)
}

Dependence.propTypes = {
	data: PropTypes.object.isRequired, 
}