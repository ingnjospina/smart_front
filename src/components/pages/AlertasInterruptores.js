import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {AlertasInterruptoresTable} from "../list/AlertasInterruptoresTable";

export const AlertasInterruptores = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Alertas Registradas'}/>
            <Container>
                <div className='dash'>
                    <AlertasInterruptoresTable/>
                </div>
            </Container>
        </div>
    )
}