import React from 'react'
import {StyledLink, StyledLi} from '../tools/styleContent'

export const SideUser = () => {
    return (
        <>
            {/* <StyledLi>
				<StyledLink to='/viewReport' >
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M18 21V3L15 5L12 3L9 5L6 3V21L9 19.5L12 21L15 19.5L18 21Z" stroke="#E40613" strokeWidth="2" strokeLinejoin="round" />
						<path d="M10 9H14M10 15H14M10 12H14" stroke="#E40613" strokeWidth="2" strokeLinecap="round" />
					</svg>
					Tickets
				</StyledLink>
			</StyledLi> */}
            <hr></hr>
            <p>Ingresar Mediciones</p>
            <StyledLi>
                <StyledLink to='/newTransformerMeasurement'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512">
                        <path
                            d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"
                            fill="#E40613"/>
                    </svg>
                    Transformador
                </StyledLink>
            </StyledLi>

            <StyledLi>
                <StyledLink to='/newInterruptorMeasurement'>
                    <svg width="19" height="19" viewBox="0 0 19 19" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M2 5H14V9H2V5ZM2 11H14V15H2V11ZM16 5H17V9H16V5ZM16 11H17V15H16V11Z"
                              fill="#E40613"/>
                    </svg>
                    Interruptor
                </StyledLink>
            </StyledLi>
            {/* <StyledLi>
				<StyledLink to='/servicesRequest' >
					<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
						<path d="M8.25 15.75L5.25 14.1V10.725L8.25 9.075L11.25 10.725V14.1L8.25 15.75ZM6.75 13.2L8.25 14.025L9.75 13.2V11.55L8.25 10.725L6.75 11.55V13.2ZM4.5 22.5L1.5 20.85V17.475L4.5 15.75L7.5 17.4V20.775L4.5 22.5ZM3 19.95L4.5 20.775L6 19.95V18.3L4.5 17.475L3 18.3V19.95ZM12 22.5L9 20.85V17.475L12 15.825L15 17.475V20.85L12 22.5ZM10.5 19.95L12 20.775L13.5 19.95V18.3L12 17.475L10.5 18.3V19.95ZM19.5 22.5L16.5 20.85V17.475L19.5 15.825L22.5 17.475V20.85L19.5 22.5ZM18 19.95L19.5 20.775L21 19.95V18.3L19.5 17.475L18 18.3V19.95ZM18.45 8.7L16.5 10.65V7.05L18.75 5.775V2.4L15.75 0.75L12.75 2.4V5.775L15 7.05V10.575L13.05 8.625L12 9.75L15.75 13.5L19.5 9.75L18.45 8.7ZM14.25 3.3L15.75 2.475L17.25 3.3V4.95L15.75 5.775L14.25 4.95V3.3Z" fill="#E40613" />
					</svg>
					Generar Solicitud
				</StyledLink>
			</StyledLi> */}
            <hr></hr>
            <p>Historial de Mediciones</p>
            <StyledLi>
                <StyledLink to='/viewMeasurement'>
                    <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 448 512">
                        <path
                            d="M349.4 44.6c5.9-13.7 1.5-29.7-10.6-38.5s-28.6-8-39.9 1.8l-256 224c-10 8.8-13.6 22.9-8.9 35.3S50.7 288 64 288l111.5 0L98.6 467.4c-5.9 13.7-1.5 29.7 10.6 38.5s28.6 8 39.9-1.8l256-224c10-8.8 13.6-22.9 8.9-35.3s-16.6-20.7-30-20.7l-111.5 0L349.4 44.6z"
                            fill="#E40613"/>
                    </svg>
                    Transformador
                </StyledLink>
            </StyledLi>
            <hr></hr>
        </>
    )
}