import React from 'react'
import { Navigate, Route, Routes } from 'react-router'
import { useUser } from '../../hooks/useUser'
import { Providers } from '../pages/providers'
import { Review } from '../pages/review'
import { ServicesRequest } from '../pages/servicesRequest'
import { BodyContent } from '../bodys/bodyContent'
import { SearchMeasurement } from '../pages/searchMeasurement'
import { Transformer } from '../pages/transformer'
import { NewTransformer } from '../pages/newTransformer'

export const IndexRoutes = () => {

	const user = useUser()

	return (
		<Routes>
			<Route path='/*' element={<BodyContent />} />
			<Route path='/newTransfor' element={
				user ? (
					<NewTransformer/>
				) : (
					<Navigate to="/signin" replace />
				)
			} />
			<Route path='/newTransformerMeasurement' element={
				user ? (
					<Transformer/>
				) : (
					<Navigate to="/signin" replace />
				)
			} />
			<Route path='/viewMeasurement' element={
				user ? (
					<SearchMeasurement />
				) : (
					<Navigate to="/signin" replace />
				)
			} />
			<Route path='/provider' element={
				user ? (
					<Providers />
				) : (
					<Navigate to="/signin" replace />
				)
			} />
			<Route path='/servicesRequest' element={
				user ? (
					<ServicesRequest />
				) : (
					<Navigate to="/signin" replace />
				)
			} />

			<Route path='/review' element={
				user ? (
					<Review />
				) : (
					<Navigate to="/signin" replace />
				)
			} />

		</Routes>
	)
}