import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import TransformadoresTable from "../list/TransformadoresTable";

export const TransformadoresList = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Lista de Transformadores'}/>
			<Container>
				<div className='dash'>
					<TransformadoresTable />
				</div>
			</Container>
		</div>
	)
}