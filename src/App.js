import './styles/App.css'
import React from 'react'
import { BrowserRouter as Router  } from 'react-router-dom'
import { Footer } from './components/footer'
import { Header } from './components/header'
import { IndexRoutes } from './components/router/index.routes'


function App() {

	return (
		<Router>
			<div className='App'>
				<Header />
				<div className='app_content'>
					<IndexRoutes />
				</div>
				<Footer />
			</div>
		</Router>
	)
}

export default App