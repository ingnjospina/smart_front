import React from 'react'
import { Sidebar } from '../sidebar'
import { Container } from 'react-bootstrap'
import { NewReport } from '../forms/newReport'

export const Report = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Generar Reporte'}/>
			<Container>
				<div className='dash'>
					<NewReport  tipo={'INFRAESTRUCTURA'} />
				</div>
			</Container>
		</div>
	)
}