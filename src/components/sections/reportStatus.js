import React, { useEffect, useState, useRef } from 'react'
import AprobadoSvg from '../../images/AprobadoSVG.svg'
import RechazadoSvg from '../../images/RechazadoSVG.svg'
import SupervicionSVG from '../../images/SupervicionSVG.svg'
import { addDoc } from '../../services/report.services'
import { ColWhite, PButton, PEstadoApproved, PEstadoRejected, PEstadoSupervision, SButton } from '../tools/styleContent'
import { PropTypes } from 'prop-types'
import { Col, Row } from 'react-bootstrap'
import { UseLogout } from '../../hooks/useLogout'
import { useUser } from '../../hooks/useUser'

export const ReportStatus = (props) => {

	const [documento, setDoc] = useState(null)


	useEffect(() => {
		setDoc(props.data.documento)
	}, [])

	const estado = props.data.estado
	//const doc = props.data.documento
	const fileInputRef = useRef(null)
	const { user } = useUser()
	const logout = UseLogout()

	const handleFileButtonClick = () => {
		fileInputRef.current.click()
	}

	const downloadFile = () => {
		const decodedPdfContent = atob(documento)
		const blob = new Blob([decodedPdfContent], { type: 'application/pdf' })
		const url = URL.createObjectURL(blob)
		const a = document.createElement('a')
		a.href = url
		a.download = `${props.data.ticket}_informe.pdf`
		document.body.appendChild(a)
		a.click()
		document.body.removeChild(a)
		URL.revokeObjectURL(url)
	}

	const uploadDoc = async (e, ticket) => {
		e.preventDefault()
		try {
			const respond = await addDoc(user.idUsuario, user.token, e.target.files[0], ticket)
			//doc = respond.doc
			console.log(respond)
		}
		catch (e) {
			if (e.response?.data?.error?.name === 'TokenExpiredError') {
				logout.logOut()
			}

		}
	}

	return (
		<ColWhite xs={12} lg={4}>
			<Row xs={12}>
				<Col xs={12}>
					{
						estado === 'APROBADO' ?
							<img src={AprobadoSvg} />
							:
							estado === 'RECHAZADO' ?
								<img src={RechazadoSvg} />
								:
								estado === 'SUPERVISION' ?
									<img src={SupervicionSVG} />
									:
									(
										<></>
									)
					}
				</Col>
			</Row>
			<Row xs={12}>
				<Col xs={12}>
					{
						estado === 'APROBADO' ?
							<PEstadoApproved>{estado}</PEstadoApproved>
							:
							estado === 'RECHAZADO' ?
								<PEstadoRejected>{estado}</PEstadoRejected>
								:
								estado === 'SUPERVISION' ?
									<PEstadoSupervision>{estado}</PEstadoSupervision>
									:
									(
										<></>
									)
					}
				</Col>
				<Col xs={12}>
					{
						documento ? (
							<PButton onClick={downloadFile}>
								<svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
									<path fillRule="evenodd" clipRule="evenodd" d="M1 9.6001C1.55228 9.6001 2 10.0478 2 10.6001V17.6001C2 17.8653 2.10536 18.1197 2.29289 18.3072C2.48043 18.4947 2.73478 18.6001 3 18.6001H17C17.2652 18.6001 17.5196 18.4947 17.7071 18.3072C17.8946 18.1197 18 17.8653 18 17.6001V10.6001C18 10.0478 18.4477 9.6001 19 9.6001C19.5523 9.6001 20 10.0478 20 10.6001V17.6001C20 18.3957 19.6839 19.1588 19.1213 19.7214C18.5587 20.284 17.7956 20.6001 17 20.6001H3C2.20435 20.6001 1.44129 20.284 0.87868 19.7214C0.31607 19.1588 0 18.3957 0 17.6001V10.6001C0 10.0478 0.447715 9.6001 1 9.6001Z" fill="white" />
									<path fillRule="evenodd" clipRule="evenodd" d="M5.18412 9.90177C5.56979 9.50646 6.20291 9.49864 6.59823 9.88432L9.9999 13.203L13.4016 9.88432C13.7969 9.49864 14.43 9.50646 14.8157 9.90177C15.2014 10.2971 15.1935 10.9302 14.7982 11.3159L10.6982 15.3159C10.3098 15.6948 9.69001 15.6948 9.30158 15.3159L5.20158 11.3159C4.80626 10.9302 4.79845 10.2971 5.18412 9.90177Z" fill="white" />
									<path fillRule="evenodd" clipRule="evenodd" d="M10 0C10.5523 0 11 0.447715 11 1V12.5C11 13.0523 10.5523 13.5 10 13.5C9.44772 13.5 9 13.0523 9 12.5V1C9 0.447715 9.44772 0 10 0Z" fill="white" />
								</svg>
								Informe</PButton>
						) : (
							<>No hay informes.</>
						)
					}
					{props.data.rol === 'ADMIN' && (
						<>
							<SButton onClick={handleFileButtonClick}>
								Subir Documento
							</SButton>
							<input
								type="file"
								ref={fileInputRef}
								style={{ display: 'none' }}
								accept='.pdf, .doc'
								onChange={(e) => {
									uploadDoc(e, props.data.ticket)
								}}
							/>
						</>
					)}
				</Col>
			</Row>
		</ ColWhite>
	)
}

ReportStatus.propTypes = {
	data: PropTypes.object.isRequired,
}