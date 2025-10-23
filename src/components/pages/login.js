/* eslint-disable react/prop-types */
import loginImage from '../../images/LogoUnivalle.jpeg'
import React, { useState } from 'react'
import { Alert, Col, Container, Row } from 'react-bootstrap'
import { Form } from 'react-bootstrap'
import { InputForm } from '../tools/styleContent.js'
import { PButton } from '../tools/styleContent.js'
import { signin } from '../../services/signin.js'
import { useUser } from '../../hooks/useUser.js'

export default function Login () {

	const {updateUser} = useUser() 

	const [email, setEmail] = useState('')
	const [password, setPassword] = useState('')
	const [show, setShow] = useState(false)
	const [message, setMessage] = useState('')


	const handleLogin = async (event) => {
		try {
			event.preventDefault()

			setShow(false)
			setMessage('')
			if(email === undefined || email === '' || password === undefined || password === '' )
			{
				setShow(true)
				setMessage('Ingresa un correo y contraseña validos')
			}
			else {
				const respond = await signin(email, password)
				window.localStorage.setItem('loggedAppUser', JSON.stringify(respond))
				updateUser(respond)
				window.location.reload(true)
			}
		} catch (error) {
			console.log(error)
			setMessage(error.response?.data?.non_field_errors[0])
			setShow(true)
		}
	}

	return (
		<Container className='login-container'>
			<Row>
				<Col className='login'>
					{
						show ? (
							<Alert 
								variant="danger" 
								onClose={() => setShow(false)} 
								dismissible
								className='alert-center'
							>
								<p>
									{message}
								</p>
							</Alert>
						):
							(<></>)
					}
					<div  className='login-info'>
						<img src={loginImage} alt='Login' />
						<h4>Iniciar Sesion</h4>
						<p>Ingresa tu correo y contraseña para iniciar sesión</p>
					</div>
					<Form onSubmit={handleLogin}>
						<Form.Group id='email'>
							<InputForm
								type='text'
								value={email}
								name='email'
								placeholder='Correo institucional'
								onChange={({ target }) => setEmail(target.value)}
							/>
						</Form.Group>
						<Form.Group id='password'>
							<InputForm
								type='password'
								value={password}
								name='password'
								placeholder='Contraseña'
								onChange={({ target }) => setPassword(target.value)}
							/>
						</Form.Group>
						<PButton className='loginButton'>
							Iniciar Sesión
						</PButton>
					</Form>
				</Col>
			</Row>
		</Container>
	)
}