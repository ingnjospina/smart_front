import axios from 'axios'

const url = 'http://127.0.0.1:8000/api/interruptores/'

export const getInterruptores = async (token) => {
    const config = {
        headers: {
            authorization: 'Bearer ' + token
        },
    }
    const {data} = await axios.get(url, config)
    return data
}

export const getInterruptorById = async (token, id) => {
    const config = {
        headers: {
            authorization: 'Bearer ' + token
        },
    }
    let urlById = url + id + '/'

    const {data} = await axios.get(urlById, config)
    return data
}

export const createInterruptores = async (token, info) => {
    const config = {
        headers: {
            authorization: 'Bearer ' + token
        },
    }

    const {data} = await axios.post(url, info, config)
    return data
}

export const updateInterruptores = async (token, id, info) => {
    const config = {
        headers: {
            authorization: 'Bearer ' + token
        },
    }
    let urlUpdate = url + id + '/'

    const {data} = await axios.put(urlUpdate, info, config)
    return data
}

export const deleteInterruptores = async (token, id) => {
    const config = {
        headers: {
            authorization: 'Bearer ' + token
        },
    }
    let urlDelete = url + id + '/'
    const {data} = await axios.delete(urlDelete, config)
    return data
}

export const getAlertasInterruptores = async (token, queryParams = "") => {
    try {
        const config = {
            headers: {
                authorization: `Bearer ${token}`
            },
        };

        let urlalerts = `${url}alertas/`;

        // Agregar los parámetros si existen
        if (queryParams) {
            urlalerts += `?${queryParams}`;
        }

        const {data} = await axios.get(urlalerts, config);
        return data;
    } catch (error) {
        console.error('Error al obtener alertas:', error);
        throw error;  // Propagar el error para manejarlo en el frontend
    }
};

export const createMedidasInterruptores = async (token, info) => {

    const config = {
        headers: {
            authorization: 'Bearer ' + token
        },
    }

    let urlCreate = `${url}medicion/create/`;

    const {data} = await axios.post(urlCreate, info, config)
    return data
}