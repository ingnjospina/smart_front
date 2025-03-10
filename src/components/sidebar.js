import '../styles/sidebar.css'
import imgAvatar from '../images/avatar.jpg'
import React, { useState } from 'react'
import { Navbar } from './navbar'
import { PropTypes } from 'prop-types'
import { StyledLink, StyledLi } from './tools/styleContent'
import { SideUser } from './side/sideUser'
import { SideAdmin } from './side/sideAdmin'
import { UseLogout } from '../hooks/useLogout'



export const Sidebar = ({ title }) => {
	const [isSidebarCollapsed, setSidebarCollapsed] = useState(window.innerWidth > 1000)

	const logOutClick = UseLogout()

	const loggedUserJson = window.localStorage.getItem('loggedAppUser')
	const user = loggedUserJson ? JSON.parse(loggedUserJson) : {}


	const logout = () => {
		logOutClick.logOut()
	}

	const toggleSidebar = () => {
		setSidebarCollapsed(!isSidebarCollapsed)
	}

	const closeSide = (event) => {
		event.preventDefault()
		toggleSidebar()
	}

	return (
		<>
			<Navbar toggleSidebar={toggleSidebar} title={title} classes={`${!isSidebarCollapsed ? '' : 'navbar-side'}`} />
			<div className={`sidebar  ${isSidebarCollapsed ? '' : 'hidden'}`}>
				<div className='arrowSide' style={{ display: window.innerWidth > 1000 ? 'none' : 'flex' }}>
					<a href='#' onClick={closeSide} className={`${isSidebarCollapsed ? '' : 'hidden'}`}>
						<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none">
							<g clipPath="url(#clip0_1486_267)">
								<path fillRule="evenodd" clipRule="evenodd" d="M7.9399 13.0599C7.659 12.7787 7.50122 12.3974 7.50122 11.9999C7.50122 11.6024 7.659 11.2212 7.9399 10.9399L13.5959 5.2819C13.8773 5.00064 14.2589 4.84268 14.6568 4.84277C14.8538 4.84282 15.0488 4.88167 15.2308 4.9571C15.4128 5.03253 15.5781 5.14307 15.7174 5.2824C15.8567 5.42173 15.9671 5.58713 16.0425 5.76915C16.1178 5.95117 16.1566 6.14625 16.1565 6.34325C16.1565 6.54025 16.1176 6.73531 16.0422 6.9173C15.9668 7.09929 15.8562 7.26463 15.7169 7.4039L11.1209 11.9999L15.7169 16.5959C15.8602 16.7342 15.9746 16.8997 16.0533 17.0826C16.132 17.2656 16.1734 17.4624 16.1753 17.6616C16.1771 17.8607 16.1392 18.0583 16.0639 18.2427C15.9886 18.427 15.8773 18.5946 15.7365 18.7355C15.5957 18.8764 15.4283 18.9878 15.244 19.0633C15.0597 19.1389 14.8622 19.1769 14.663 19.1753C14.4638 19.1736 14.267 19.1323 14.084 19.0538C13.9009 18.9753 13.7353 18.8611 13.5969 18.7179L7.9379 13.0599H7.9399Z" fill="#E40613" />
							</g>
							<defs>
								<clipPath id="clip0_1486_267">
									<rect width="24" height="24" fill="white" />
								</clipPath>
							</defs>
						</svg>
					</a>
				</div>
				<div className='avatar'>
					<img src={imgAvatar} />
				</div>
				<p>¡Hola!</p>
				<div className='name'>
					<p>
						{user.Nombres}
					</p>
				</div>
				<ul>
					<StyledLi>
						<StyledLink to='/'  >
							{/* DASH <svg xmlns="http://www.w3.org/2000/svg" width="21" height="18" viewBox="0 0 21 18" fill="none">
								<path d="M3.07594 17.52H17.9006C18.1641 17.52 18.4284 17.4028 18.5747 17.1975C19.3659 16.3181 19.9519 15.2053 20.3616 14.0625C20.7722 12.8906 21.0066 11.6597 21.0066 10.4878C21.0066 7.61625 19.8347 5.00906 17.9306 3.07594C15.9966 1.14188 13.3894 0 10.4887 0C7.58812 0 4.98094 1.14281 3.04687 3.07594C1.14281 5.01 0 7.58813 0 10.4878C0 11.6597 0.234375 12.8906 0.645 14.0625C1.05562 15.2053 1.61156 16.3181 2.43187 17.1975C2.57812 17.4028 2.78344 17.52 3.07687 17.52H3.07594ZM9.16969 3.07687C9.16969 2.31469 9.75562 1.75875 10.4878 1.75875C11.22 1.75875 11.8059 2.31562 11.8059 3.07687C11.8059 3.80906 11.22 4.36594 10.4878 4.36594C9.75562 4.36594 9.16969 3.80906 9.16969 3.07687ZM3.92625 5.24438C3.92625 4.51219 4.51219 3.95531 5.24437 3.95531C5.97656 3.95531 6.5625 4.51219 6.5625 5.24438C6.5625 5.97656 5.97656 6.5625 5.24437 6.5625C4.51219 6.5625 3.92625 5.97656 3.92625 5.24438ZM14.4431 5.24438C14.4431 4.51219 15.0291 3.95531 15.7612 3.95531C16.5234 3.95531 17.0794 4.51219 17.0794 5.24438C17.0794 5.97656 16.5225 6.53344 15.7612 6.53344C15.0291 6.53344 14.4431 5.97656 14.4431 5.24438ZM10.4006 11.8359L11.9241 6.38625C12.0122 6.12281 12.2466 5.9175 12.5691 5.9175C12.8916 5.9175 13.2141 6.21094 13.2141 6.5325C13.2141 6.59156 13.155 6.73781 13.0969 7.00125C13.0087 7.29469 12.9506 7.64625 12.8334 7.99781C12.7453 8.37844 12.6281 8.81813 12.5109 9.22875C12.2475 10.1372 11.9831 10.9866 11.8369 11.5725C11.7487 11.8659 11.6906 12.1294 11.6606 12.2175C12.2466 12.6281 12.6862 13.2722 12.6862 14.0044C12.6862 15.2353 11.7197 16.2019 10.4887 16.2019C9.25781 16.2019 8.32031 15.2353 8.32031 14.0044C8.32031 13.4475 8.52562 12.8906 8.90625 12.51C9.28687 12.1294 9.84375 11.865 10.4006 11.8359ZM1.75781 10.4888C1.75781 9.75656 2.31469 9.19969 3.04687 9.19969C3.77906 9.19969 4.395 9.75656 4.395 10.4888C4.395 11.2209 3.78 11.8069 3.04687 11.8069C2.31375 11.8069 1.75781 11.2209 1.75781 10.4888ZM16.6116 10.4888C16.6116 9.75656 17.1975 9.19969 17.9297 9.19969C18.6619 9.19969 19.2187 9.75656 19.2187 10.4888C19.2187 11.2209 18.6619 11.8069 17.9297 11.8069C17.1975 11.8069 16.6116 11.2209 16.6116 10.4888Z" fill="#E40613" />
							</svg> */}
							<svg width="20" height="20" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
								<path d="M5.5667 1.62051L4.1324 0.153846C1.72518 2.03077 0.140421 4.92308 0 8.20513H2.00602C2.15647 5.48718 3.52056 3.10769 5.5667 1.62051ZM17.994 8.20513H20C19.8495 4.92308 18.2648 2.03077 15.8676 0.153846L14.4433 1.62051C16.4694 3.10769 17.8435 5.48718 17.994 8.20513ZM16.0181 8.71795C16.0181 5.56923 14.3731 2.93333 11.5045 2.2359V1.53846C11.5045 0.68718 10.8325 0 10 0C9.1675 0 8.49549 0.68718 8.49549 1.53846V2.2359C5.61685 2.93333 3.98195 5.55897 3.98195 8.71795V13.8462L1.97593 15.8974V16.9231H18.0241V15.8974L16.0181 13.8462V8.71795ZM10 20C10.1404 20 10.2708 19.9897 10.4012 19.959C11.0532 19.8154 11.5848 19.3641 11.8455 18.7487C11.9458 18.5026 11.996 18.2359 11.996 17.9487H7.98395C7.99398 19.0769 8.88666 20 10 20Z" fill="#E40613"/>
							</svg>
							Alertas
						</StyledLink>
					</StyledLi>
					{
						user.rol === 'Técnico' ?
							(
								<SideUser />
							) :
							(
								<></>
							)
					}
					{
						user.rol === 'Administrador' ?
							(
								<SideAdmin />
							) :
							(
								<></>
							)
					}
					<StyledLi className={'exitLink'}>
						<StyledLink to="/" onClick={logout} className={'neverActive'}>
							<svg xmlns='http://www.w3.org/2000/svg' width='20' height='20' viewBox='0 0 20 20' fill='none'>
								<path fillRule='evenodd' clipRule='evenodd' d='M15.2587 11.25H6.25V8.75H15.17L13.8125 7.3925L15.58 5.625L20 10.045L15.58 14.4637L13.8125 12.6962L15.2587 11.25ZM12.5 5H10V2.5H2.5V17.5H10V15H12.5V20H0V0H12.5V5Z' fill='#E40613' />
							</svg>
							Salir
						</StyledLink>
					</StyledLi>
				</ul>
			</div>
		</>
	)
}

Sidebar.propTypes = {
	title: PropTypes.string.isRequired, // title debe ser una cadena y es requerido // className es opcional y debe ser una cadena si está presente
}