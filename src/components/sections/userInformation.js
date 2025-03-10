import React from 'react'
import { Col, Row } from 'react-bootstrap'
import { ColWhite, LeftReport, RightReport, RowData, TitleReport } from '../tools/styleContent'
import { PropTypes } from 'prop-types'



export const UserInformation = (props) => {

	const user = props.data.usuario
	return (
		<>
			<ColWhite xs={12} lg={4}>
				<div>
					<Row xs={12}>
						<Col xs={12}>
							<TitleReport>
								<svg xmlns="http://www.w3.org/2000/svg" width="27" height="24" viewBox="0 0 27 24" fill="none">
									<path d="M25.74 12.3043C26.07 11.9743 26.07 11.55 25.9286 11.1729C25.74 10.7486 25.3629 10.5129 24.8914 10.5129C24.5614 10.5129 24.2786 10.6071 23.9957 10.89L23.76 11.1257C23.3357 4.90286 18.1971 0 11.88 0C5.32714 0 0 5.32714 0 11.88C0 18.4329 5.32714 23.76 11.88 23.76C17.49 23.76 22.1571 19.8943 23.43 14.6614L25.74 12.3043ZM11.88 21.4029C6.6 21.4029 2.35714 17.1129 2.35714 11.88C2.35714 6.64714 6.64714 2.35714 11.88 2.35714C16.8771 2.35714 20.9786 6.22286 21.3557 11.1257L21.12 10.89C20.9786 10.7486 20.8371 10.6543 20.6486 10.6071C20.1771 10.4186 19.7057 10.56 19.3757 10.9371C18.9986 11.4086 18.9986 12.0686 19.4229 12.4929L21.12 14.19C20.13 18.2914 16.3586 21.4029 11.88 21.4029Z" fill="#E40613" />
									<path d="M17.6785 15.2744V15.793C17.6785 16.453 17.1599 16.9716 16.4999 16.9716H7.21275C6.55275 16.9716 6.03418 16.453 6.03418 15.793V15.2744C6.03418 13.8601 7.68418 13.0116 9.23989 12.3516C9.28704 12.3516 9.33418 12.3044 9.38132 12.2573C9.47561 12.2101 9.61704 12.2101 9.75847 12.2573C10.3713 12.6816 11.0785 12.9173 11.8328 12.9173C12.587 12.9173 13.2942 12.6816 13.907 12.3044C14.0013 12.2101 14.1428 12.2101 14.2842 12.3044C14.3313 12.3044 14.3785 12.3516 14.4256 12.3987C16.0285 13.0116 17.6785 13.8601 17.6785 15.2744Z" fill="#E40613" />
									<path d="M11.8799 11.7386C13.4681 11.7386 14.7556 10.3033 14.7556 8.53286C14.7556 6.7624 13.4681 5.32715 11.8799 5.32715C10.2917 5.32715 9.00415 6.7624 9.00415 8.53286C9.00415 10.3033 10.2917 11.7386 11.8799 11.7386Z" fill="#E40613" />
								</svg>
								Usuario
							</TitleReport>
						</Col>
					</Row>
					<RowData xs={12}>
						<Col xs={6} lg={6}>
							<LeftReport>
								Nombre:
							</LeftReport>
						</Col>
						<Col xs={6} lg={6}>
							<RightReport>
								{user.Nombres}
							</RightReport>
						</Col>
					</RowData>

					<RowData xs={12}>
						<Col xs={6} lg={6}>
							<LeftReport>
								Codigo:
							</LeftReport>
						</Col>
						<Col xs={6} lg={6}>
							<RightReport>
								{user.codigo}
							</RightReport>
						</Col>
					</RowData>

					<RowData xs={12}>
						<Col xs={6} lg={6}>
							<LeftReport>
								Telefono:
							</LeftReport>
						</Col>
						<Col xs={6} lg={6}>
							<RightReport>
								{user.telefono}
							</RightReport>
						</Col>
					</RowData>
					<RowData xs={12}>
						<Col xs={6} lg={6}>
							<LeftReport>
								Tipo de reporte:
							</LeftReport>
						</Col>
						<Col xs={6} lg={6}>
							<RightReport>
								{props.data.tipoReporte}
							</RightReport>
						</Col>
					</RowData>
				</div>
			</ColWhite>
		</>
	)
}

UserInformation.propTypes = {
	data: PropTypes.object.isRequired, // title debe ser una cadena y es requerido // className es opcional y debe ser una cadena si está presente
}