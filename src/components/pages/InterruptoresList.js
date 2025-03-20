import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import InterruptoresTable from "../list/InterruptoresTable";

export const InterruptoresList = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Lista de Interruptores'}/>
			<Container>
				<div className='dash'>
					<InterruptoresTable />
				</div>
			</Container>
		</div>
	)
}