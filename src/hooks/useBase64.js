export const UseBase64 = () => {
	const getBase64 = (file) => {
		return new Promise((resolve, reject) => {
			if (!file) {
				reject('Archivo no válido')
				return
			}

			const reader = new FileReader()

			reader.onload = function () {
				resolve(reader.result)
			}

			reader.onerror = function (error) {
				reject(error)
			}

			reader.readAsDataURL(file)
		})
	}

	return {
		getBase64,
	}
}
