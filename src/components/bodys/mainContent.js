import React from 'react'
import { Sidebar } from '../sidebar'
import {Dashboard} from '../pages/dashboard'
import { Container } from 'react-bootstrap'

export const MainContent = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Alertas Registradas'} />
			<Container>
				<Dashboard />
			</Container>
		</div>
	)
}