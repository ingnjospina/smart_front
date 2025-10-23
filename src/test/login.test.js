/* eslint-disable no-undef */
import React from 'react'
//import '@testing-library/jest-dom/extend-expect'
import { render } from '@testing-library/react'
import Dashboard from '../components/pages/dashboard.js'
import { prettyDOM } from '@testing-library/react'

const mockClick = jest.fn()

test('renders content with messageError', ()=> {
	const component = render(<Dashboard logout={mockClick}/>) 
	button = component.content
	console.log(prettyDOM(component))
})