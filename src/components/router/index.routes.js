import React from 'react'
import {Navigate, Route, Routes} from 'react-router'
import {useUser} from '../../hooks/useUser'
import {Providers} from '../pages/providers'
import {Review} from '../pages/review'
import {ServicesRequest} from '../pages/servicesRequest'
import {BodyContent} from '../bodys/bodyContent'
import {SearchMeasurement} from '../pages/searchMeasurement'
import {Transformer} from '../pages/transformer'
import {NewTransformer} from '../pages/newTransformer'
import {NewInterruptor} from "../pages/newInterruptor";
import {InterruptoresList} from "../pages/InterruptoresList";
import {TransformadoresList} from "../pages/TransformadoresList";
import {AlertasInterruptores} from "../pages/AlertasInterruptores";
import {MedidasInterruptor} from "../pages/medidasInterruptor";
import {PronosticoTransformador} from "../pages/pronosticoTransformador";
import {PronosticoInterruptor} from "../pages/pronosticoInterruptor";
import {PronosticosTransformadores} from "../pages/PronosticosTransformadores";
import {PronosticosInterruptores} from "../pages/PronosticosInterruptores";

export const IndexRoutes = () => {

    const user = useUser()

    return (
        <Routes>
            <Route path='/*' element={<BodyContent/>}/>
            <Route path='/newTransfor' element={
                user ? (
                    <NewTransformer/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>
            <Route path='/newTransformerMeasurement' element={
                user ? (
                    <Transformer/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>
            <Route path='/viewMeasurement' element={
                user ? (
                    <SearchMeasurement/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>
            <Route path='/provider' element={
                user ? (
                    <Providers/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>
            <Route path='/servicesRequest' element={
                user ? (
                    <ServicesRequest/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/review' element={
                user ? (
                    <Review/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/newInterruptor' element={
                user ? (
                    <NewInterruptor/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/listTransformadores' element={
                user ? (
                    <TransformadoresList/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/listInterruptores' element={
                user ? (
                    <InterruptoresList/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/alertasInterruptores' element={
                user ? (
                    <AlertasInterruptores/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/newInterruptorMeasurement' element={
                user ? (
                    <MedidasInterruptor/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/newForecastTransformer' element={
                user ? (
                    <PronosticoTransformador/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/newForecastInterruptor' element={
                user ? (
                    <PronosticoInterruptor/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/pronosticosTransformadores' element={
                user ? (
                    <PronosticosTransformadores/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

            <Route path='/pronosticosInterruptores' element={
                user ? (
                    <PronosticosInterruptores/>
                ) : (
                    <Navigate to="/signin" replace/>
                )
            }/>

        </Routes>
    )
}