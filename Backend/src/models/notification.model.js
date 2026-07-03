import mongoose from 'mongoose';
import { USER_COLLECTION_NAME } from './user.model.js';

const notificationSchema = new mongoose.Schema(
    {
        usuario_destino_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: USER_COLLECTION_NAME, // El usuario que va a recibir la notificación
            required: true
        },
        tipo: {
            type: String,
            required: true,
            enum: ['like', 'dislike', 'respuesta', 'invitacion'] // Los tipos de eventos
        },
        mensaje: {
            type: String,
            required: true // Ej: "A xX_Otaku_Xx le gustó tu comentario en Re:Zero"
        },
        leido: {
            type: Boolean,
            default: false // Cambia a true cuando el usuario abre la campanita
        },
        fecha: {
            type: Date,
            default: Date.now
        }
    }
);

export const NOTIFICATION_COLLECTION_NAME = 'Notification';
const Notification = mongoose.model(NOTIFICATION_COLLECTION_NAME, notificationSchema);

export default Notification;