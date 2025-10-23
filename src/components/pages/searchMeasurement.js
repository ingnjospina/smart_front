import React from 'react'
import { Sidebar } from '../sidebar'
import { Container } from 'react-bootstrap'
import { ViewMeasurement } from '../forms/viewMeasurement'

export const SearchMeasurement = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Mediciones'}/>
			<Container>
				<div className='dash'>
					<ViewMeasurement />
				</div>
			</Container>
		</div>
	)
}