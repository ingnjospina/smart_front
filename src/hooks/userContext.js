// UserContext.js
import React, { createContext, useContext, useReducer } from 'react'
import PropTypes from 'prop-types'

const UserContext = createContext()

const userReducer = (state, action) => {
	switch (action.type) {
	case 'LOGIN':
		return action.payload
	case 'LOGOUT':
		return null
	default:
		return state
	}
}

const UserProvider = ({ children }) => {
	const [user, dispatch] = useReducer(userReducer, null)

	return (
		<UserContext.Provider value={{ user, dispatch }}>
			{children}
		</UserContext.Provider>
	)
}

UserProvider.propTypes = {
	children: PropTypes.node.isRequired,
}

const useUser = () => {
	const context = useContext(UserContext)
	if (!context) {
		throw new Error('useUser debe usarse dentro de un UserProvider')
	}
	return context
}

export { UserProvider, useUser }
