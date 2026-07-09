// Borrá o comentá esta línea que falla:
// import ENVIRONMENT from '../config/environment'

const API_URL = 'https://anitrack-back.vercel.app/api/auth';

export async function login(email, password) {
    try {
        const response_http = await fetch(`${API_URL}/login`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ email, password })
        });

        const data = await response_http.json();

        if (!response_http.ok || !data.ok) {
            throw new Error(data.message || 'Error al iniciar sesión');
        }

        return data; 
    } catch (error) {
        console.error("Error en login service:", error);
        throw error;
    }
}

export async function register(name, email, password) {
    try {
        const response_http = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({ name, email, password })
        });

        const data = await response_http.json();

        if (!response_http.ok || !data.ok) {
            throw new Error(data.message || 'Error al registrar el usuario');
        }

        return data;
    } catch (error) {
        console.error("Error en register service:", error);
        throw error;
    }
}
