import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {PronosticosInterruptoresTable} from "../list/PronosticosInterruptoresTable"

export const PronosticosInterruptores = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Pronósticos - Interruptores'}/>
            <Container>
                <div className='dash'>
                    <PronosticosInterruptoresTable/>
                </div>
            </Container>
        </div>
    )
}
