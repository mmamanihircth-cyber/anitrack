import Review from '../models/review.model.js';
import UserList from '../models/userList.model.js';
import Notification from '../models/notification.model.js';
import ServerError from '../helpers/serverError.helper.js';

class InteractionController {
    
    // 1. CREAR O ACTUALIZAR UN COMENTARIO/RESEÑA (Recibe el anime_id de texto del Front)
    async createOrUpdateReview(request, response) {
        try {
            const usuario_id = request.user.id;
            const { anime_id, puntuacion, comentario } = request.body;

            if (!anime_id || !puntuacion) {
                throw new ServerError("El ID del anime y la puntuación son obligatorios", 400);
            }

            // upsert: true se encarga de crear el comentario si no existe, o actualizarlo si el usuario ya comentó ese anime
            const review = await Review.findOneAndUpdate(
                { usuario_id, anime_id },
                { puntuacion, comentario: comentario || "" },
                { new: true, upsert: true }
            );

            return response.status(200).json({
                ok: true,
                message: "¡Tu comentario ha sido guardado con éxito!",
                data: { review }
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al procesar el comentario" });
        }
    }

    // 2. DAR O QUITAR LIKE (Toggle) + Crear Notificación
    async toggleLike(request, response) {
        try {
            const usuario_id = request.user.id;
            const { review_id } = request.params;

            const review = await Review.findById(review_id);
            if (!review) throw new ServerError("No se encontró el comentario", 404);

            // Si ya tenía dislike, se lo sacamos
            review.dislikes = review.dislikes.filter(id => id.toString() !== usuario_id);

            // Si ya tenía like, se lo quitamos. Si no, lo agregamos.
            const yaTieneLike = review.likes.includes(usuario_id);
            if (yaTieneLike) {
                review.likes = review.likes.filter(id => id.toString() !== usuario_id);
            } else {
                review.likes.push(usuario_id);
                
                // Creamos una notificación para el dueño del comentario (si no es él mismo)
                if (review.usuario_id.toString() !== usuario_id) {
                    await Notification.create({
                        usuario_destino_id: review.usuario_id,
                        tipo: 'like',
                        mensaje: `¡A un usuario le gustó tu comentario!`
                    });
                }
            }

            await review.save();
            return response.status(200).json({ ok: true, message: yaTieneLike ? "Like removido" : "Like agregado", data: { likes: review.likes.length } });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al procesar el like" });
        }
    }

    // 3. DAR O QUITAR DISLIKE (Toggle)
    async toggleDislike(request, response) {
        try {
            const usuario_id = request.user.id;
            const { review_id } = request.params;

            const review = await Review.findById(review_id);
            if (!review) throw new ServerError("No se encontró el comentario", 404);

            review.likes = review.likes.filter(id => id.toString() !== usuario_id);

            const yaTieneDislike = review.dislikes.includes(usuario_id);
            if (yaTieneDislike) {
                review.dislikes = review.dislikes.filter(id => id.toString() !== usuario_id);
            } else {
                review.dislikes.push(usuario_id);
            }

            await review.save();
            return response.status(200).json({ ok: true, message: yaTieneDislike ? "Dislike removido" : "Dislike agregado", data: { dislikes: review.dislikes.length } });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al procesar el dislike" });
        }
    }

    // 4. RESPONDER A UN COMENTARIO + Crear Notificación
    async addReply(request, response) {
        try {
            const usuario_id = request.user.id;
            const { review_id } = request.params;
            const { texto } = request.body;

            if (!texto || texto.trim() === "") throw new ServerError("El texto de la respuesta no puede estar vacío", 400);

            const review = await Review.findById(review_id);
            if (!review) throw new ServerError("No se encontró el comentario", 404);

            review.respuestas.push({ usuario_id, texto });
            await review.save();

            // Notificamos al creador de la reseña original
            if (review.usuario_id.toString() !== usuario_id) {
                await Notification.create({
                    usuario_destino_id: review.usuario_id,
                    tipo: 'respuesta',
                    mensaje: `Un usuario respondió a tu comentario: "${texto.substring(0, 20)}..."`
                });
            }

            return response.status(201).json({ ok: true, message: "Respuesta publicada", data: { respuestas: review.respuestas } });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al publicar la respuesta" });
        }
    }

    // 5. AGREGAR O ACTUALIZAR ESTADO EN MI LISTA PERSONAL
    async addOrUpdateInList(request, response) {
        try {
            const usuario_id = request.user.id;
            const { anime_id, estado } = request.body; // anime_id acá también viene como String del Front

            if (!anime_id || !estado) throw new ServerError("Faltan campos obligatorios", 400);

            const itemLista = await UserList.findOneAndUpdate(
                { usuario_id, anime_id },
                { estado },
                { new: true, upsert: true }
            );

            return response.status(200).json({
                ok: true,
                message: `Anime guardado en tu lista como: ${estado}`,
                data: { itemLista }
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al actualizar tu lista" });
        }
    }

    // 6. OBTENER MI LISTA PERSONAL DE ANIMES (Sin populate por el cambio de estrategia)
    async getMyList(request, response) {
        try {
            const usuario_id = request.user.id;
            
            // Trae los objetos con el ID de texto del anime y su estado (viendo, completado, etc)
            const miLista = await UserList.find({ usuario_id });

            return response.status(200).json({
                ok: true,
                data: { miLista }
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al obtener tu lista" });
        }
    }

    // 7. NUEVO MÉTODO: OBTENER COMENTARIOS CON LA INFO DEL USUARIO PEGADA (Populate)
    async getReviewsByAnime(request, response) {
        try {
            const { anime_front_id } = request.params;

            // Busca comentarios del anime e inyecta nombre, email y foto de perfil de los autores automáticamente
            const reviews = await Review.find({ anime_id: anime_front_id })
                .populate('usuario_id', 'nombre email imagen_url') 
                .populate('respuestas.usuario_id', 'nombre imagen_url') 
                .sort({ fecha_publicacion: -1 });

            return response.status(200).json({
                ok: true,
                data: { reviews }
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al obtener comentarios" });
        }
    }
}

const interactionController = new InteractionController();
export default interactionController;