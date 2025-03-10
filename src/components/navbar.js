import React from 'react'
import { PropTypes } from 'prop-types'
import { PButton } from './tools/styleContent'

export const Navbar = ({ classes, toggleSidebar, title }) => {
	return (
		<nav className={`navbar ${classes}`}>
			<PButton id="toggleSidebar" type="button" onClick={toggleSidebar}>
				<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 20 20" fill="none">
					<path d="M2.5 15V13.3333H17.5V15H2.5ZM2.5 10.8333V9.16667H17.5V10.8333H2.5ZM2.5 6.66667V5H17.5V6.66667H2.5Z" fill="white"/>
				</svg>
			</PButton>
			<p className='titleNav'>{title}</p>
		</nav>
	)
}

Navbar.propTypes = {
	toggleSidebar: PropTypes.func.isRequired, // toggleSidebar debe ser una función y es requerida
	title: PropTypes.string.isRequired, // title debe ser una cadena y es requerido // className es opcional y debe ser una cadena si está presente
	classes: PropTypes.string.isRequired
}