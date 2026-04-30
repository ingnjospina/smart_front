import React from 'react'
import { Sidebar } from '../sidebar'
import { Container } from 'react-bootstrap'
import { NewTransfo } from '../forms/newTransfo'

export const NewTransformer = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Crear transformador'}/>
			<Container>
				<div className='dash'>
					<NewTransfo  tipo={'TRANSFORMADOR'} />
				</div>
			</Container>
		</div>
	)
}