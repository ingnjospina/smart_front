/* eslint-disable no-undef */
describe('App', ()=>{

	beforeEach (() => {
		cy.visit('http://localhost:3000')
	})

	it('frontpage can be open', ()=>{
		cy.contains('Hola')
	})

	it('Login button click', ()=>{
		cy.contains('Iniciar Sesión').click()
		cy.contains('the email or password is incorrect')
	})

	it('Login button click', ()=>{
		cy.get('[name="email"]').type('diego.danilo.delgado@correounivalle.edu.co')
		cy.get('[name="password"]').type('Diego2023')
		cy.contains('Iniciar Sesión').click()
		cy.contains('the email or password is incorrect')
	})

	it('Login button click', ()=>{
		cy.get('[name="email"]').type('diego.danilo.delgado11@correounivalle.edu.co')
		cy.get('[name="password"]').type('Diego2023')
		cy.contains('Iniciar Sesión').click()
		cy.contains('Consultar Usuarios')
	})

	it('LogOut button click', ()=>{
		cy.get('[name="email"]').type('diego.danilo.delgado11@correounivalle.edu.co')
		cy.get('[name="password"]').type('Diego2023')
		cy.contains('Iniciar Sesión').click()
		cy.contains('Salir').click()
		cy.contains('Hola')
	})

	it('LogOut button click', ()=>{
		cy.get('[name="email"]').type('diego.danilo.delgado11@correounivalle.edu.co')
		cy.get('[name="password"]').type('Diego2023')
		cy.contains('Iniciar Sesión').click()
		cy.contains('Consultar Usuarios').click()
	})
})