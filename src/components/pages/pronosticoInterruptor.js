import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {NewPronosticoInterruptor} from "../forms/newPronosticoInterruptor";

export const PronosticoInterruptor = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Pronóstico de Interruptor'}/>
            <Container>
                <div className='dash'>
                    <NewPronosticoInterruptor/>
                </div>
            </Container>
        </div>
    )
}
