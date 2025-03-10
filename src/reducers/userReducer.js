
 
export const userReducer = (state = {}, action) => {
	if(action.type === '@login/loginSuccess') {
		state = action.payload
		return state
	}
	return state
}


export const userRegister = (props) => {
	props.store.dispatch({
		type: '@login/loginSuccess',
		payload: props.user
	})
}


