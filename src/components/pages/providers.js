import React from 'react'
import { Container } from 'react-bootstrap'
import { FilterProviders } from '../forms/filterProviders'
import { Sidebar } from '../sidebar'

export const Providers = () => {
	return (
		<>
			<Sidebar title={'Proveedores'} />
			<Container>
				<div className='dash'>
					<FilterProviders />
				</div>
			</Container>
		</>
	)
}