import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {NewMedidasInterruptor} from "../forms/newMedidasInterruptor";

export const MedidasInterruptor = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Medición de Interruptor'}/>
            <Container>
                <div className='dash'>
                    <NewMedidasInterruptor/>
                </div>
            </Container>
        </div>
    )
}