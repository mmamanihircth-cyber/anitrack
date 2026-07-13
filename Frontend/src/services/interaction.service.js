const API_URL = 'https://anitrack-back.vercel.app/api/interactions';
const AUTH_TOKEN_LOCALSTORAGE_KEY = "auth_token";

function getAuthToken() {

    return localStorage.getItem(AUTH_TOKEN_LOCALSTORAGE_KEY);

}

export async function toggleFavorite(anime_id) {

    try {

        const token = getAuthToken();

        const response_http = await fetch(`${API_URL}/favorite`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                anime_id
            })

        });

        const data = await response_http.json();

        if (!response_http.ok || !data.ok) {
            throw new Error(data.message || "Error al actualizar favorito");
        }

        return data;

    } catch (error) {

        console.error("Error en toggleFavorite:", error);

        throw error;

    }

}
export async function getFavorites() {

    try {

        const token = getAuthToken();

        const response_http = await fetch(`${API_URL}/favorite`, {

            headers: {
                Authorization: `Bearer ${token}`
            }

        });

        const data = await response_http.json();

        if (!response_http.ok || !data.ok) {
            throw new Error(data.message || "Error al obtener favoritos");
        }

        return data;

    } catch (error) {

        console.error("Error en getFavorites:", error);

        throw error;

    }

}
// 📥 Obtener todos los comentarios de un anime (RUTA PÚBLICA)
export async function getReviewsByAnime(anime_id) {
    try {
        // 🌟 CAMBIO ACÁ: Agregamos '/anime/' en la URL como pide tu backend
        const response_http = await fetch(`${API_URL}/review/anime/${anime_id}`);
        
        const data = await response_http.json();
        
        // Retornamos el array de reviews (adaptalo si tu controller devuelve data.reviews o directo el array)
        if (response_http.ok) {
            return data.reviews || data.data || (Array.isArray(data) ? data : []);
        }
        return [];
    } catch (error) {
        console.error("Error en getReviewsByAnime:", error);
        return [];
    }
}

// 📤 Publicar una review (REQUIERE AUTH)
export async function createReview(anime_id, puntuacion, comentario) {
    try {
        const token = getAuthToken();
        
        // 🌟 RUTA: '/review' (esta estaba bien, pero aseguramos el tipado interno)
        const response_http = await fetch(`${API_URL}/review`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({
                anime_id: String(anime_id), // Lo forzamos a String para tu esquema
                puntuacion: Number(puntuacion),
                comentario
            })
        });

        const data = await response_http.json();
        if (!response_http.ok) {
            throw new Error(data.message || "Error al guardar la review");
        }
        return data.review || data.data || data;
    } catch (error) {
        console.error("Error en createReview:", error);
        throw error;
    }
}
export async function addOrUpdateInList(anime_id, estado) {

    try {

        const token = getAuthToken();

        const response_http = await fetch(`${API_URL}/list`, {

            method: "POST",

            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },

            body: JSON.stringify({
                anime_id,
                estado
            })

        });

        const data = await response_http.json();

        if (!response_http.ok || !data.ok) {
            throw new Error(data.message || "Error al actualizar la lista");
        }

        return data;

    } catch (error) {

        console.error("Error en addOrUpdateInList:", error);

        throw error;

    }

}
// 📤 Dar o quitar Like (Toggle) - REQUIERE AUTH
export async function toggleLikeReview(review_id) {
    try {
        const token = getAuthToken();
        const response_http = await fetch(`${API_URL}/review/${review_id}/like`, {
            method: "POST",
            headers: {
                Authorization: `Bearer ${token}`
            }
        });
        const data = await response_http.json();
        if (!response_http.ok) throw new Error(data.message || "Error al procesar el like");
        return data; // Devuelve { ok: true, message: "...", data: { likes: X } }
    } catch (error) {
        console.error("Error en toggleLikeReview:", error);
        throw error;
    }
}

// 📤 Enviar una respuesta a una Review - REQUIERE AUTH
export async function addReplyToReview(review_id, texto) {
    try {
        const token = getAuthToken();
        const response_http = await fetch(`${API_URL}/review/${review_id}/reply`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                Authorization: `Bearer ${token}`
            },
            body: JSON.stringify({ texto })
        });
        const data = await response_http.json();
        if (!response_http.ok) throw new Error(data.message || "Error al enviar la respuesta");
        return data; // Devuelve { ok: true, message: "...", data: { respuestas: [...] } }
    } catch (error) {
        console.error("Error en addReplyToReview:", error);
        throw error;
    }
}

// Obtener todo el feed de debates de una comunidad (Workspace)
export const getWorkspaceFeed = async (workspaceId, token) => {
    try {
        const response = await fetch(`https://anitrack-back.vercel.app/api/interactions/workspace/${workspaceId}`, {
            method: "GET",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            }
        });
        return await response.json();
    } catch (error) {
        console.error("Error en getWorkspaceFeed:", error);
        throw error;
    }
};

// Publicar un nuevo post en la comunidad
export const createWorkspacePost = async (workspaceId, contenido, token) => {
    try {
        const response = await fetch(`https://anitrack-back.vercel.app/api/interactions/workspace/${workspaceId}`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ contenido })
        });
        return await response.json();
    } catch (error) {
        console.error("Error en createWorkspacePost:", error);
        throw error;
    }
};