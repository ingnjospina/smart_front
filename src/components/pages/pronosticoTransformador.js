import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {NewPronosticoTransformador} from "../forms/newPronosticoTransformador";

export const PronosticoTransformador = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Pronóstico de Transformador'}/>
            <Container>
                <div className='dash'>
                    <NewPronosticoTransformador/>
                </div>
            </Container>
        </div>
    )
}
