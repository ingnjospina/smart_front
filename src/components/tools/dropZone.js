import '../../styles/dropZone.css'
import React, { useState } from 'react'
import { PropTypes } from 'prop-types'


export const DropZone = (props) => {

	const [isDragOver, setIsDragOver] = useState(false)
	const [size, setSize] = useState(0)
	const [message, setMessage] = useState(false)


	const handleDragEnter = (e) => {
		e.preventDefault()
		setIsDragOver(true)
	}

	const handleDragLeave = (e) => {
		e.preventDefault()
		setIsDragOver(false)
	}

	const handleDrop = (e) => {
		e.preventDefault()
		setIsDragOver(false)
		calculate(e.dataTransfer.files)
	}

	const handleInputChange = (e) => {
		e.preventDefault()
		calculate(e.target.files)
	}

	const calculate = (listUp) => {

		if(listUp.length > 0)
		{
			const list = []
			let totalSize = size
			Array.from(listUp).forEach(file => {
				totalSize += file.size

				if ((totalSize / 1024 / 1024) < 10) {
					list.push(file)
					setSize(totalSize)
					setMessage(false)
				}
				else {
					setMessage(true)
				}
			})
			props.loadFile(list)
		}
	}

	return (
		<>
			<input
				type="file"
				id="dropzoneFile"
				className="dropzoneFile"
				multiple
				accept={props.type}
				onChange={handleInputChange}
			/>
			<div
				className={`dropzone ${isDragOver ? 'active-dropzone' : ''}`}
				onDragOver={(e) => e.preventDefault()}
				onDragEnter={handleDragEnter}
				onDragLeave={handleDragLeave}
				onDrop={handleDrop}
			>
				<p>
					Arrastra y suelta imagenes aquí o haz clic para seleccionar archivos
				</p>

				<label htmlFor="dropzoneFile">
					Subir archivo
					<svg
						xmlns="http://www.w3.org/2000/svg"
						width="15"
						height="10"
						viewBox="0 0 15 10"
						fill="none"
					>
						<path
							d="M4.83333 3.75C4.83333 2.36929 6.02724 1.25 7.5 1.25C8.97273 1.25 10.1667 2.36929 10.1667 3.75V4.375H10.8333C12.122 4.375 13.1667 5.35437 13.1667 6.5625C13.1667 7.77063 12.122 8.75 10.8333 8.75H10.1667C9.79847 8.75 9.5 9.02981 9.5 9.375C9.5 9.72019 9.79847 10 10.1667 10H10.8333C12.8584 10 14.5 8.461 14.5 6.5625C14.5 4.86206 13.183 3.44998 11.4531 3.1739C11.1575 1.37633 9.5002 0 7.5 0C5.49983 0 3.84254 1.37633 3.54691 3.1739C1.81701 3.44998 0.5 4.86206 0.5 6.5625C0.5 8.461 2.14162 10 4.16667 10H4.83333C5.20152 10 5.5 9.72019 5.5 9.375C5.5 9.02981 5.20152 8.75 4.83333 8.75H4.16667C2.878 8.75 1.83333 7.77063 1.83333 6.5625C1.83333 5.35437 2.878 4.375 4.16667 4.375H4.83333V3.75ZM9.9714 5.80806L7.9714 3.93306C7.71107 3.68898 7.28893 3.68898 7.0286 3.93306L5.02859 5.80806C4.76825 6.05212 4.76825 6.44788 5.02859 6.69194C5.28895 6.936 5.71105 6.936 5.97141 6.69194L6.83333 5.88387V9.375C6.83333 9.72019 7.1318 10 7.5 10C7.8682 10 8.16667 9.72019 8.16667 9.375V5.88387L9.0286 6.69194C9.28893 6.936 9.71107 6.936 9.9714 6.69194C10.2317 6.44788 10.2317 6.05212 9.9714 5.80806Z"
							fill="#E40613"
						/>
					</svg>
				</label>
			</div>

			<div id="fileList">
				{
					!message ?
						(
							<p>
								Máx 10 MB. Recuerda no colocar caracteres especiales al nombre de los
								documentos.
							</p>
						)
						:
						(
							<p className='alertMessage'>
								Algunos archivos que intentas cargar superan la capacidad permitida.
							</p>
						)
				}
				<ul></ul>
			</div>
		</>
	)
}

DropZone.propTypes = {
	loadFile: PropTypes.func.isRequired,
	type: PropTypes.string.isRequired
}
