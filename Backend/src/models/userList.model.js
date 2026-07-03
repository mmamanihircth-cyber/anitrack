import mongoose from 'mongoose';
import { USER_COLLECTION_NAME } from './user.model.js';

const userListSchema = new mongoose.Schema(
    {
        usuario_id: {
            type: mongoose.Schema.Types.ObjectId,
            ref: USER_COLLECTION_NAME, // Mantiene la relación con el dueño de la lista
            required: true
        },
        anime_id: {
            type: String, // 👈 ¡CAMBIO CLAVE! Recibe el ID de texto que viene directo de tu Front
            required: true
        },
        estado: {
            type: String,
            enum: ['viendo', 'completado', 'planeado', 'drop'], // Tus estados de seguimiento
            required: true,
            default: 'planeado'
        },
        fecha_agregado: {
            type: Date,
            default: Date.now
        }
    }
);

// Índice compuesto para evitar que un mismo usuario agregue dos veces el mismo anime a su lista
userListSchema.index({ usuario_id: 1, anime_id: 1 }, { unique: true });

export const USER_LIST_COLLECTION_NAME = 'UserList';
const UserList = mongoose.model(USER_LIST_COLLECTION_NAME, userListSchema);
export default UserList;