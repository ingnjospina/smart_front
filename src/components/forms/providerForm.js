import React, { useState, useEffect } from 'react'
import { Alert } from 'react-bootstrap'
import { CancelAceptModal } from '../modals/cancelAceptModal'
import { Col, Container, Row } from 'react-bootstrap'
import { DivForm, LabelForm, InputForm, PButton2, StyledForm, StyledFormSelect, SButton, SButton2 } from '../tools/styleContent'
import { editMedicion } from '../../services/mediciones.services'
import { getTransformadores } from '../../services/transformer.services'
import { PropTypes } from 'prop-types'
import { Spinner } from '../tools/spinner'
import { UseLogout } from '../../hooks/useLogout'

export const ProviderForm = (props) => {

	const logout = UseLogout()

	const [transformador, setTransformador] = useState('')
	const [transformadores, setTransformadores] = useState([])
	const [loadingTransfo, setLoadingTransfo] = useState(true)
	const [ idMedicion, setIdMedicion ] = useState('')

	const [relacionTransformacion, setRelacionTransformacion] = useState('')
	const [resistenciaDevanados, setResistenciaDevanados] = useState('')
	const [ce1, setce1] = useState('')
	const [ce2, setce2] = useState('')
	const [ce3, setce3] = useState('')
	const [factorPotencia, setFactorPotencia] = useState('')
	const [inhibidorOxidacion, setInhibidorOxidacion] = useState('')
	const [compuestoFuranico, setCompuestoFuranico] = useState('')
	const [rigidezDielectrica, setRigidezDielectrica] = useState('')
	const [tensionInterfacial, setTensionInterfacial] = useState('')
	const [numeroAcidez, setNumeroAcidez] = useState('')
	const [contenidoHumedad, setContenidoHumedad] = useState('')
	const [factorPotenciaLiquida, setFactorPotenciaLiquida] = useState('')
	const [color, setColor] = useState('')
	const [hidrogeno, setHidrogeno] = useState('')
	const [metano, setMetano] = useState('')
	const [etano, setEtano] = useState('')
	const [etileno, setEtileno] = useState('')
	const [acetileno, setAcetileno] = useState('')
	const [dioxidoCarbono, setDioxidoCarbono] = useState('')
	const [monoxidoCarbono, setMonoxidoCarbono] = useState('')

	const [formError, setFormError] = useState(false)
	const [show, setShow] = useState(false)
	const [showAlert, setShowAlert] = useState(false)
	const [title, setTitle] = useState('')
	const [subTitle, setSubTitle] = useState('')
	const [message, setMessage] = useState('')
	const [showSpinner, setShowSpinner] = useState(false)

	const handleCloseModal = () => { setShow(false) }

	useEffect(() => {

		const data = JSON.parse(props.idProvider)
		let corrienteExcitacionBin = data.corriente_excitacion.toString(2)
		
		if(corrienteExcitacionBin.length == 2) {
			corrienteExcitacionBin = '0'+corrienteExcitacionBin
		}

		if(corrienteExcitacionBin.length == 1) {
			corrienteExcitacionBin = '00'+corrienteExcitacionBin
		}

		setIdMedicion(data.idmediciones_transformadores)
		setTransformador(data.transformadores)
		setRelacionTransformacion(data.relacion_transformacion*100)
		setResistenciaDevanados(data.resistencia_devanados*100)
		setce1(corrienteExcitacionBin[0])
		setce2(corrienteExcitacionBin[1])
		setce3(corrienteExcitacionBin[2])
		setFactorPotencia(data.factor_potencia*100)
		setInhibidorOxidacion(data.inhibidor_oxidacion*100)
		setCompuestoFuranico(data.compuestos_furanicos)
		setRigidezDielectrica(data.aceiteFisicoQuimico.rigidez_dieletrica)
		setTensionInterfacial(data.aceiteFisicoQuimico.tension_interfacial)
		setNumeroAcidez(data.aceiteFisicoQuimico.numero_acidez)
		setContenidoHumedad(data.aceiteFisicoQuimico.contenido_humedad)
		setFactorPotenciaLiquida(data.aceiteFisicoQuimico.factor_potencia_liquido)
		setColor(data.aceiteFisicoQuimico.color)
		setHidrogeno(data.gasesDisueltos.hidrogeno)
		setMetano(data.gasesDisueltos.metano)
		setEtano(data.gasesDisueltos.etano)
		setEtileno(data.gasesDisueltos.etileno)
		setAcetileno(data.gasesDisueltos.acetileno)
		setDioxidoCarbono(data.gasesDisueltos.dioxido_carbono)
		setMonoxidoCarbono(data.gasesDisueltos.monoxido_carbono)

		const fetchTransformadores = async () => {

			try {
				const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
				const response = await getTransformadores(user.token)
				setTransformadores(response)
				setLoadingTransfo(false)
				return response
			} catch (error) {
				console.error('Error al cargar los transformadores:', error)
			}
		}
		fetchTransformadores().then(()=>{})
	}, [])

	const createMeasurement = async (event) => {
		setShowSpinner(true)
		event.preventDefault()
		if (
			!relacionTransformacion ||
			!resistenciaDevanados ||
			!ce1 ||
			!ce2 ||
			!ce3 ||
			!factorPotencia ||
			!inhibidorOxidacion ||
			!compuestoFuranico ||
			!rigidezDielectrica ||
			!tensionInterfacial ||
			!numeroAcidez ||
			!contenidoHumedad ||
			!color ||
			!hidrogeno ||
			!metano ||
			!etano ||
			!etileno ||
			!acetileno ||
			!dioxidoCarbono ||
			!monoxidoCarbono 
		) {
			setShowAlert(true)
			setFormError(true)
			window.scrollTo({ top: 0, behavior: 'smooth' })
			setShowSpinner(false)
			return
		}

		try {
			console.log(transformador)
			const data = {
				relacion_transformacion: relacionTransformacion/100,
				resistencia_devanados: resistenciaDevanados/100,
				corriente_excitacion: (ce1*4) + (ce2*2) + (ce3*1),
				factor_potencia: factorPotencia/100,
				inhibidor_oxidacion: inhibidorOxidacion/100,
				compuestos_furanicos: compuestoFuranico,
				transformadores: transformador,
				analisis_aceite_fisico_quimico: {
					rigidez_dieletrica: rigidezDielectrica,
					tension_interfacial: tensionInterfacial,
					numero_acidez: numeroAcidez,
					contenido_humedad: contenidoHumedad,
					color: color,
					factor_potencia_liquido: factorPotenciaLiquida
				},
				analisis_gases_disueltos: {
					hidrogeno: hidrogeno,
					metano: metano,
					etano: etano,
					etileno: etileno,
					acetileno: acetileno,
					dioxido_carbono: dioxidoCarbono,
					monoxido_carbono: monoxidoCarbono,
					mediciones_transformadores_idmediciones_transformadores: idMedicion
				}
			}
			const user = JSON.parse(window.localStorage.getItem('loggedAppUser'))
			const respond = await editMedicion(user.token, data, idMedicion)
			setTitle('Medición Actualizada')
			setSubTitle('Datos Calculados')
			setMessage('hi_total: ' + respond.data.hi_ponderado)
		}
		catch (e) {
			setTitle('Error')
			setSubTitle('')
			if (e.response?.data?.error?.name === 'TokenExpiredError') {
				logout.logOut()
			}
			setMessage('No puedes realizar esta acción.')
		}
		setShow(true)
		setShowSpinner(false)
	}


	const showCancelModal = (event) => {
		event.preventDefault()
		setShow(true)
		setTitle('Cancelar Edición')
		setSubTitle('')
		setMessage('¿Estás seguro de que deseas cancelar el registro?')
	}

	const closeModal = () => {
		handleConfirmSubmit('Cancel')
	}

	const handleConfirmSubmit = (text) => {
		if (text === 'Cancel') {
			props.handleCloseModal()
		}

		if (text === 'Edit') {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			props.handleCloseModal()
			console.log({text})
			props.handleConfirm(text)
			window.location.reload()
		}

		if (text === 'Acept') {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			props.handleCloseModal()
			props.handleConfirm(text)
		}

		if (text === 'Error') {
			window.scrollTo({ top: 0, behavior: 'smooth' })
			props.handleCloseModal()
			props.handleConfirm(text)
		}
	}

	return (
		<DivForm className='newReportContent'>
			<Col xs={12} className={'formBackground'}>
				<Container>
					<StyledForm onSubmit={createMeasurement}>
						{
							showAlert ? (
								<Alert
									variant="danger"
									onClose={() => setShowAlert(false)}
									dismissible
									className='alert-center'
								>
									<p>
										Por favor diligencie todos los campos del formulario.
									</p>
								</Alert>
							) :
								(<></>)
						}
						<Row xs={12}>
							<Col xs={12} md={6} className={`${!transformador && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Transformador</LabelForm>
								</Col>
								<Col xs={12}>
									<StyledFormSelect
										aria-label="Default select example"
										value={transformador}
										name='transformador'
										placeholder='Transformador'
										onChange={({ target }) => setTransformador(target.value)}
										disabled={!(props.type === 'Editar')}
									>
										<option value=""></option>
										{loadingTransfo ? (
											<option disabled>Cargando...</option>
										) : (
											transformadores.map((item) => (
												<option key={item.idtransformadores} value={item.idtransformadores}>
													{item.nombre}
												</option>
											))
										)}
									</StyledFormSelect>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={6} md={3} className={`${!relacionTransformacion && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Relación de Transformación</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={relacionTransformacion}
										name='relacionTransformacion'
										placeholder='Porcentaje'
										onChange={({ target }) => setRelacionTransformacion(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!resistenciaDevanados && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Resistencia de Devanados</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={resistenciaDevanados}
										name='resistenciaDevanados'
										placeholder='Porcentaje'
										onChange={({ target }) => setResistenciaDevanados(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${(!ce1 || !ce2 || !ce3) && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Corriente de Excitación</LabelForm>
								</Col>
								<Col xs={12}>
									<Row xs={12}>
										<Col xs={4}>
											<InputForm
												type='number'
												value={ce1}
												name='ce1'
												min='0'
												max='1'
												placeholder='bit1'
												onChange={({ target }) => setce1(target.value)}
												disabled={!(props.type === 'Editar')}
											/>
										</Col>
										<Col xs={4}>
											<InputForm
												type='number'
												value={ce2}
												name='ce2'
												min='0'
												max='1'
												placeholder='bit2'
												onChange={({ target }) => setce2(target.value)}
												disabled={!(props.type === 'Editar')}
											/>
										</Col>
										<Col xs={4}>
											<InputForm
												type='number'
												value={ce3}
												name='ce3'
												min='0'
												max='1'
												placeholder='bit3'
												onChange={({ target }) => setce3(target.value)}
												disabled={!(props.type === 'Editar')}
											/>
										</Col>
									</Row>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={6} md={3} className={`${!factorPotencia && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Factor de Potencia</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={factorPotencia}
										name='factorPotencia'
										placeholder='Porcentaje'
										onChange={({ target }) => setFactorPotencia(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!inhibidorOxidacion && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Inhibidor de Oxidación</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={inhibidorOxidacion}
										name='inhibidorOxidacion'
										placeholder='Porcentaje'
										onChange={({ target }) => setInhibidorOxidacion(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!compuestoFuranico && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Compuesto Furanico</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={compuestoFuranico}
										name='compuestoFuranico'
										placeholder='Número'
										onChange={({ target }) => setCompuestoFuranico(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
						</Row>

						<br></br>
						<Row xs={12}>
							<Col xs={12}>
								<LabelForm>Análisis de aceites físico químicos -- Pruebas Dieléctricas</LabelForm>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={6} md={3} className={`${!rigidezDielectrica && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Rigidez Dieléctrica (KV)</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={rigidezDielectrica}
										name='rigidezDielectrica'
										placeholder='Número'
										onChange={({ target }) => setRigidezDielectrica(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!tensionInterfacial && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Tensión Interfacial (N/m)</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={tensionInterfacial}
										name='tensionInterfacial'
										placeholder='Número'
										onChange={({ target }) => setTensionInterfacial(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!numeroAcidez && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Número de Acidez</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={numeroAcidez}
										name='numeroAcidez'
										placeholder='Número'
										onChange={({ target }) => setNumeroAcidez(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!contenidoHumedad && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Contenido de Humedad</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={contenidoHumedad}
										name='contenidoHumedad'
										placeholder='Número'
										onChange={({ target }) => setContenidoHumedad(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={6} md={3} className={`${!color && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Color</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={color}
										name='color'
										placeholder='Número'
										onChange={({ target }) => setColor(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={12} md={6} className={`${!factorPotenciaLiquida && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Factor de potencia liquido 25 %</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={factorPotenciaLiquida}
										name='factorPotenciaLiquida'
										placeholder='Número'
										onChange={({ target }) => setFactorPotenciaLiquida(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
						</Row>

						<br></br>
						<Row xs={12}>
							<Col xs={12}>
								<LabelForm>Análisis de Gases Disueltos.</LabelForm>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={6} md={3} className={`${!hidrogeno && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Hidrogeno</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={hidrogeno}
										name='hidrogeno'
										placeholder='Número'
										onChange={({ target }) => setHidrogeno(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!metano && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Metano</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={metano}
										name='metano'
										placeholder='Número'
										onChange={({ target }) => setMetano(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!etano && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Etano</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={etano}
										name='etano'
										placeholder='Número'
										onChange={({ target }) => setEtano(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!etileno && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Etileno</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={etileno}
										name='etileno'
										placeholder='Número'
										onChange={({ target }) => setEtileno(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
						</Row>
						<Row xs={12}>
							<Col xs={6} md={3} className={`${!acetileno && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Acetileno</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={acetileno}
										name='acetileno'
										placeholder='Número'
										onChange={({ target }) => setAcetileno(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!dioxidoCarbono && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Dióxido de Carbono</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={dioxidoCarbono}
										name='dioxidoCarbono'
										placeholder='Número'
										onChange={({ target }) => setDioxidoCarbono(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
							<Col xs={6} md={3} className={`${!monoxidoCarbono && formError ? 'errorForm' : ''}`}>
								<Col xs={12}>
									<LabelForm>Monóxido de Carbono</LabelForm>
								</Col>
								<Col xs={12}>
									<InputForm
										type='number'
										value={monoxidoCarbono}
										name='monoxidoCarbono'
										placeholder='Número'
										onChange={({ target }) => setMonoxidoCarbono(target.value)}
										disabled={!(props.type === 'Editar')}
									/>
								</Col>
							</Col>
						</Row>
						<br></br>
						<Row xs={12}>
							<Col xs={0} lg={3}>
							</Col>
							{
								props.type !== 'Editar' ? 
									(<>
										<Col xs={12} lg={12}>
											<SButton onClick={closeModal}>Cerrar</SButton>
										</Col>
									</>):
									(<>
										<Col xs={12} lg={3}>
											<SButton2 onClick={showCancelModal}>Cancelar</SButton2>
										</Col>
										<Col xs={12} lg={3}>
											<PButton2>Editar</PButton2>
										</Col>
									</>)
							}
							<Col xs={0} lg={3}>
							</Col>
						</Row>
					</StyledForm>
				</Container>
			</Col>
			<CancelAceptModal
				showModal={show}
				handleCloseModal={handleCloseModal}
				title={title}
				message={message}
				handleConfirmSubmit={handleConfirmSubmit}
				subTitle={subTitle}
			/>
			{
				showSpinner ? (
					<div className='divSpinner'>
						<Spinner />
					</div>
				) :
					(
						<></>
					)
			}

		</DivForm >
	)
}

ProviderForm.propTypes = {
	type: PropTypes.string.isRequired,
	idProvider: PropTypes.string.isRequired,
	close: PropTypes.func.isRequired,
	handleConfirm: PropTypes.func.isRequired,
	handleCloseModal: PropTypes.func.isRequired
}