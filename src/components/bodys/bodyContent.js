import Login from '../pages/login.js'
import React from 'react'
import { Route, Routes, Navigate } from 'react-router-dom'
import { MainContent } from './mainContent.js'
import { useUser } from '../../hooks/useUser.js'
//import { UserRoutes } from '../routes/user.routes'
//import { AdminRoutes } from '../routes/admin.routes'

export const BodyContent = () => {

	const { user } = useUser()

	return (
		<div className={'containerbody'}>
			<div className={'bodyContent'}>
				<Routes>
					<Route path='/signin'
						element={
							user ? (
								<Navigate to="/" replace />
							) : (
								<Login />
							)
						}
					>
					</Route>
					<Route path='/'
						element={
							user ? (
								<MainContent />
							) : (
								<Navigate to="/signin" replace />
							)
						}>
					</Route>
				</Routes>
			</div>
		</div>
	)
}