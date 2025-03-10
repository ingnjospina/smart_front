import React from 'react'
import { Container } from 'react-bootstrap'
import { FilterRequest } from '../forms/filterRequest'
import { Sidebar } from '../sidebar'

export const Review = () => {
	return (
		<>
			<Sidebar title={'Solicitudes y Reportes'} />
			<Container>
				<div className='dash'>
					<FilterRequest />
				</div>
			</Container>
		</>
	)
}