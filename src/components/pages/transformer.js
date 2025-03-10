import React from 'react'
import { Sidebar } from '../sidebar'
import { Container } from 'react-bootstrap'
import { NewTransformerMeasurement } from '../forms/newTransfoMeasurement'

export const Transformer = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Medición de Transformador'}/>
			<Container>
				<div className='dash'>
					<NewTransformerMeasurement  tipo={'TRANSFORMADOR'} />
				</div>
			</Container>
		</div>
	)
}