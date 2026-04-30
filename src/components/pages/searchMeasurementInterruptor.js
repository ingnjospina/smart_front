import React from 'react'
import {Sidebar} from '../sidebar'
import {Container} from 'react-bootstrap'
import {ViewMeasurementInterruptor} from '../forms/viewMeasurementInterruptor'

export const SearchMeasurementInterruptor = () => {
    return (
        <div className="peticion-container">
            <Sidebar title={'Mediciones Interruptores'}/>
            <Container>
                <div className='dash'>
                    <ViewMeasurementInterruptor/>
                </div>
            </Container>
        </div>
    )
}
