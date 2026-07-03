import mongoose from 'mongoose';
import { USER_COLLECTION_NAME } from './user.model.js';

const replySchema = new mongoose.Schema({
    usuario_id: {
        type: mongoose.Schema.Types.ObjectId,
        ref: USER_COLLECTION_NAME,
        required: true
    },
    texto: { type: String, required: true, trim: true },
    fecha: { type: Date, default: Date.now }
});

const reviewSchema = new mongoose.Schema(
    {
        usuario_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: USER_COLLECTION_NAME, // Conecta con el usuario logueado para sacar nombre y foto
            required: true
        },
        anime_id: {
            type: String, // Recibe el ID de texto que inventes en tu Front de React
            required: true
        },
        puntuacion: { type: Number, required: true, min: 1, max: 10 },
        comentario: { type: String, trim: true, default: "" },
        likes: [{ type: mongoose.Schema.Types.ObjectId, ref: USER_COLLECTION_NAME }],
        dislikes: [{ type: mongoose.Schema.Types.ObjectId, ref: USER_COLLECTION_NAME }],
        respuestas: [replySchema],
        fecha_publicacion: { type: Date, default: Date.now }
    }
);

export const REVIEW_COLLECTION_NAME = 'Review';
const Review = mongoose.model(REVIEW_COLLECTION_NAME, reviewSchema);
export default Review;