import React from 'react'
import { Container } from 'react-bootstrap'
import { NewRequest } from '../forms/newRequest'
import { Sidebar } from '../sidebar'

export const ServicesRequest = () => {
	return (
		<>
			<Sidebar title={'Solicitud de bienes o servicios'} />
			<Container>
				<div className='dash'>
					<NewRequest />
				</div>
			</Container>
		</>
	)
}