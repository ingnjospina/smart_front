import React from 'react'
import { Sidebar } from '../sidebar'
import { Container } from 'react-bootstrap'
import { ViewReport } from '../forms/viewReport'

export const SearchReport = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Reportes'}/>
			<Container>
				<div className='dash'>
					<ViewReport />
				</div>
			</Container>
		</div>
	)
}