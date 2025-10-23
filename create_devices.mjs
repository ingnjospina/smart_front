/**
 * Script para crear interruptores y transformadores
 */

import axios from 'axios';

const BACKEND_URL = 'http://127.0.0.1:8000';

// Obtener token del usuario desde localStorage
// Nota: En un script de Node.js no tenemos acceso a localStorage del navegador,
// así que necesitaremos el token manualmente o hacer login primero

async function login() {
    try {
        const response = await axios.post(`${BACKEND_URL}/api/login/`, {
            username: 'admin', // Usuario de prueba
            password: 'admin123' // Contraseña de prueba
        });
        return response.data.token;
    } catch (error) {
        console.error('Error en login:', error.response?.data || error.message);
        throw error;
    }
}

async function createInterruptor(token, nombre, descripcion, nivelesTension, subestacion) {
    try {
        const config = {
            headers: {
                authorization: 'Bearer ' + token
            }
        };

        const data = {
            nombre: nombre,
            descripcion: descripcion,
            niveles_tension: nivelesTension,
            subestacion: subestacion
        };

        const response = await axios.post(`${BACKEND_URL}/api/interruptores/`, data, config);
        console.log(`✓ Interruptor "${nombre}" creado exitosamente`);
        console.log(`  ID: ${response.data.data.idinterruptores}`);
        return response.data;
    } catch (error) {
        console.error(`✗ Error al crear interruptor "${nombre}":`, error.response?.data || error.message);
        throw error;
    }
}

async function createTransformador(token, nombre, descripcion) {
    try {
        const config = {
            headers: {
                authorization: 'Bearer ' + token
            }
        };

        const data = {
            nombre: nombre,
            descripcion: descripcion
        };

        const response = await axios.post(`${BACKEND_URL}/api/tranformadores/`, data, config);
        console.log(`✓ Transformador "${nombre}" creado exitosamente`);
        console.log(`  ID: ${response.data.data.idtransformadores}`);
        return response.data;
    } catch (error) {
        console.error(`✗ Error al crear transformador "${nombre}":`, error.response?.data || error.message);
        throw error;
    }
}

async function main() {
    try {
        console.log('=== Iniciando creación de dispositivos ===\n');

        // 1. Login para obtener token
        console.log('1. Autenticando...');
        const token = await login();
        console.log('✓ Autenticación exitosa\n');

        // 2. Crear interruptores
        console.log('2. Creando interruptores...');
        await createInterruptor(
            token,
            'BUGA 1',
            'Interruptor de potencia BUGA 1 - Subestación Calima',
            '115kV',
            'Calima'
        );

        await createInterruptor(
            token,
            'BUGA 2',
            'Interruptor de potencia BUGA 2 - Subestación Calima',
            '34.5kV',
            'Calima'
        );
        console.log('');

        // 3. Crear transformadores
        console.log('3. Creando transformadores...');
        await createTransformador(
            token,
            'TP6 LV',
            'Transformador de potencia TP6 - Nivel bajo de tensión'
        );

        await createTransformador(
            token,
            'TP5 LV',
            'Transformador de potencia TP5 - Nivel bajo de tensión'
        );
        console.log('');

        console.log('=== ✓ Todos los dispositivos fueron creados exitosamente ===');
    } catch (error) {
        console.error('\n=== ✗ Error durante la ejecución ===');
        console.error(error);
        process.exit(1);
    }
}

main();
