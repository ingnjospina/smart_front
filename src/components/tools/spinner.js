import React from 'react'
import { Audio } from 'react-loader-spinner'

export const Spinner = () => {
	return (
		<Audio
			height="80"
			width="80"
			radius="9"
			color="red"
			ariaLabel="loading"
			wrapperStyle
			wrapperClass
			className = {'spinner'}
		/>
	)
}
