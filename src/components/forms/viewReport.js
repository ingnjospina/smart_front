import React, { useState } from 'react'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { Col, Container, Row } from 'react-bootstrap'
import { ColLabel, DivForm, InputForm, LabelForm, PButton, StyledForm } from '../tools/styleContent'
import { ReportContent } from '../bodys/reportContent'
import { getReport } from '../../services/report.services'
import { Spinner } from '../tools/spinner'
import { UseLogout } from '../../hooks/useLogout'
import { useNavigate } from 'react-router'
import { UseRefreshToken } from '../../hooks/useRefreshToken'
import { useUser } from '../../hooks/useUser'

export const ViewReport = () => {

	const nav = useNavigate()
	const refreshToken = UseRefreshToken()
	const logout = UseLogout()
	const user = useUser()

	const [formError, setFormError] = useState(false)
	const [ticket, setTicket] = useState('')
	const [show, setShow] = useState(false)
	const [showSpinner, setShowSpinner] = useState(false)
	const [title, setTitle] = useState('')
	const [subTitle] = useState('')
	const [message, setMessage] = useState('')
	const [data, setData] = useState(null)

	const handleCloseModal = () => { setShow(false) }

	const searchreport = async (e) => {
		setShowSpinner(true)
		e.preventDefault()
		if (!ticket) {

			setFormError(true)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			setShowSpinner(false)
			setData(null)
			return
		}

		try {
			const respond = await getReport(user.user.idUsuario, user.user.token, ticket)
			await refreshToken.refreshToken(respond)
			setData(respond)
		}
		catch (e) {
			setTitle('Error')
			if (e.response?.data?.error?.name === 'TokenExpiredError') {
				logout.logOut()
			}
			setMessage('No encontramos el ticket')
			setShow(true)
		}
		setShowSpinner(false)
	}

	const handleConfirmSubmit = (text) => {
		if (text === 'Cancel') {
			nav('/')
		}

		if (text === 'Acept') {
			window.location.reload()
			window.scrollTo({ top: 0, behavior: 'smooth' })
		}
	}

	const formatInput = (str) => {
		const currentValue = str.replace(/[^0-9-]/g, '')

		const withoutHyphens = currentValue.replace(/-/g, '')

		const formattedValue = withoutHyphens
			.replace(/(\d{2})(\d{5})(\d{5})/, '$1-$2-$3')
			.substr(0, 15)

		setTicket(formattedValue)
	}

	return (
		<>
			<DivForm className='newReportContent'>
				<Col xs={10} className={'formBackground'}>
					<Container>
						<StyledForm onSubmit={searchreport}>
							<Row xs={12} className={`${!ticket && formError ? 'errorForm' : ''}`}>
								<ColLabel xs={12} lg={4}>
									<LabelForm>Ingrese el número de ticket:</LabelForm>
								</ColLabel>
								<Col xs={12} lg={4}>
									<InputForm
										type='text'
										value={ticket}
										name='ticket'
										placeholder='ticket'
										onChange={({ target }) => formatInput(target.value)}
									/>
								</Col>
								<Col xs={12} lg={4}	>
									<PButton>Buscar</PButton>
								</Col>
							</Row>
						</StyledForm>
					</Container>
				</Col>
			</DivForm >
			{
				data ?
					(
						<ReportContent data={data} />
					)
					:
					(
						<></>
					)
			}
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