import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {PronosticosTransformadoresTable} from "../list/PronosticosTransformadoresTable"

export const PronosticosTransformadores = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Pronósticos - Transformadores'}/>
            <Container>
                <div className='dash'>
                    <PronosticosTransformadoresTable/>
                </div>
            </Container>
        </div>
    )
}
