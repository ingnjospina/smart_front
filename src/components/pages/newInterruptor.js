import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {NewInterru} from "../forms/newInterru";

export const NewInterruptor = () => {
	return (
		<div className="peticion-container">
			<Sidebar title={'Nuevo Interruptor'}/>
			<Container>
				<div className='dash'>
					<NewInterru />
				</div>
			</Container>
		</div>
	)
}