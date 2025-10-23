import React, { useState } from 'react'
import { PropTypes } from 'prop-types'

export const CheckboxGroup = (props) => {

	const options = props.optionsList
	const [selectedOptions, setSelectedOptions] = useState([])

	const handleCheckboxChange = (option) => {
		if (selectedOptions.includes(option)) {
			setSelectedOptions(selectedOptions.filter((item) => item !== option))
			props.listSelected(selectedOptions.filter((item) => item !== option))
		} else {
			setSelectedOptions([...selectedOptions, option])
			props.listSelected([...selectedOptions, option])
		}
	}

	return (
		<div>
			{options.map((option) => (
				<div key={option}>
					<input
						type="checkbox"
						id={option}
						checked={selectedOptions.includes(option)}
						onChange={() => handleCheckboxChange(option)}
					/>
					<label htmlFor={option}>{option}</label>
				</div>
			))}
		</div>
	)
}

CheckboxGroup.propTypes = {
	optionsList: PropTypes.array.isRequired,
	listSelected: PropTypes.func.isRequired
}

