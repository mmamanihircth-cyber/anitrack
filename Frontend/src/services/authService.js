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

export async function register(name, email, password, imagen_url) { // 🌟 Agregamos 'imagen_url' acá
    try {
        const response_http = await fetch(`${API_URL}/register`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            // 🌟 Mandamos 'imagen_url' adentro del JSON que recibe tu backend
            body: JSON.stringify({ name, email, password, imagen_url: imagen_url }) 
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

export async function updateUserAvatar(imagen_url) {
    try {
        const token = localStorage.getItem("auth_token");
        const response = await fetch('https://anitrack-back.vercel.app/api/auth/update-avatar', {
            method: "PUT",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ imagen_url })
        });
        const data = await response.json();
        if (!response.ok) throw new Error(data.message || "Error al actualizar el avatar");
        return data; 
    } catch (error) {
        console.error("Error en updateUserAvatar:", error);
        throw error;
    }
}

export async function updateProfile(imagen_url) {

    try {

        const token = localStorage.getItem("auth_token");

        const response_http = await fetch(
            "https://anitrack-back.vercel.app/api/auth/profile",
            {

                method: "PUT",

                headers: {

                    "Content-Type": "application/json",

                    Authorization: `Bearer ${token}`

                },

                body: JSON.stringify({

                    imagen_url

                })

            }
        );

        const data = await response_http.json();

        if(!response_http.ok){

            throw new Error(data.message);

        }

        return data;

    }

    catch(error){

        console.error(error);

        throw error;

    }

}