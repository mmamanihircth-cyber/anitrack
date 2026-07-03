import mongoose from "mongoose";

const workspaceSchema = new mongoose.Schema({
    nombre: {
        type: String,
        required: true,
        trim: true
    },
    fecha_creacion: {
        type: Date,
        required: true,
        default: Date.now // Le saqué los () a Date.now para que guarde la fecha exacta al crear, no al levantar el servidor
    },
    descripcion: {
        type: String,
        required: false,
        default: "¡Bienvenidos a nuestra comunidad de anime!" // Un texto por defecto más copado
    },
    imagen_url: {
        type: String,
        default: "" // El truco del link de internet para la foto del club de fans
    },
    estado: {
        type: Boolean,
        required: true,
        default: true // True significa que la comunidad está activa
    }
});

export const WORKSPACE_COLLECTION_NAME = "Workspace";
const Workspace = mongoose.model(WORKSPACE_COLLECTION_NAME, workspaceSchema);
export default Workspace;