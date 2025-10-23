import '../../styles/dropZone.css'
import React, {useState} from 'react'
import {PropTypes} from 'prop-types'
import {SButton} from './styleContent'

export const DropZone = (props) => {

    const [isDragOver, setIsDragOver] = useState(false)
    const [size, setSize] = useState(0)
    const [message, setMessage] = useState(false)

    const handleDragEnter = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(true)
    }

    const handleDragLeave = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
    }

    const handleDrop = (e) => {
        e.preventDefault()
        e.stopPropagation()
        setIsDragOver(false)
        calculate(e.dataTransfer.files)
    }

    const handleInputChange = (e) => {
        calculate(e.target.files)
    }

    const calculate = (listUp) => {
        if (listUp.length > 0) {
            const list = []
            let totalSize = size
            Array.from(listUp).forEach(file => {
                totalSize += file.size

                if ((totalSize / 1024 / 1024) < 10) {
                    list.push(file)
                    setSize(totalSize)
                    setMessage(false)
                } else {
                    setMessage(true)
                }
            })
            props.loadFile(list, props.id)
        }
    }

    return (
        <>
            <input
                type="file"
                className="dropzoneFile"
                multiple
                accept={props.type}
                onChange={handleInputChange}
                style={{display: 'none'}}
                id={`input-${props.id}`}
            />
            <div
                className={`dropzone ${isDragOver ? 'active-dropzone' : ''}`}
                onDragOver={(e) => {
                    e.preventDefault();
                    e.stopPropagation();
                }}
                onDragEnter={handleDragEnter}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={(e) => {
                    e.preventDefault(); // Prevenimos submit del formulario
                    document.getElementById(`input-${props.id}`).click(); // Abrimos el explorador de archivos
                }}
            >
                <p>Arrastra y suelta archivos aquí o haz clic para seleccionar</p>
                <SButton onClick={(e) => e.preventDefault()}>Subir archivo 📂</SButton>
            </div>

            <div id="fileList">
                {
                    !message ?
                        <p>Máx 10 MB. Recuerda no colocar caracteres especiales al nombre de los documentos.</p>
                        :
                        <p className='alertMessage'>El archivo supera el tamaño permitido.</p>
                }
            </div>
        </>
    )
}

DropZone.propTypes = {
    loadFile: PropTypes.func.isRequired,
    type: PropTypes.string.isRequired,
    id: PropTypes.string.isRequired
}
