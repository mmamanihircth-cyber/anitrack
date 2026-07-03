import mongoose from "mongoose";
import { WORKSPACE_COLLECTION_NAME } from "./workspace.model.js";
import { USER_COLLECTION_NAME } from "./user.model.js";
import { MEMBER_WORKSPACE_ROLES } from "../constants/memberRoles.constant.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";

const workspaceMemberSchema = new mongoose.Schema({
    fk_workspace_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: WORKSPACE_COLLECTION_NAME // Apunta a la Comunidad
    },
    fk_user_id: {
        type: mongoose.Schema.ObjectId,
        required: true,
        ref: USER_COLLECTION_NAME // Apunta al Usuario
    },
    fecha_creacion: {
        type: Date,
        default: Date.now,
        required: true
    },
    rol: {
        type: String,
        enum: [MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.USER],
        default: MEMBER_WORKSPACE_ROLES.USER // Entra como 'Miembro' por defecto
    },
    puesto_personalizado: {
        type: String,
        default: "" // Ej: "Officer", "Creador de Contenido", "Fan de Kakashi"
    },
    estatus_invitacion: {
        type: String,
        enum: [
            MEMBER_INVITATION_STATUS.PENDING, 
            MEMBER_INVITATION_STATUS.ACCEPTED, 
            MEMBER_INVITATION_STATUS.REJECTED
        ],
        default: MEMBER_INVITATION_STATUS.PENDING
    },
    fecha_expiracion_invitacion: {
        type: Date,
        default: null
    }
});

export const WORKSPACE_MEMBER_MODEL_NAME = 'WorkspaceMember';
const WorkspaceMember = mongoose.model(WORKSPACE_MEMBER_MODEL_NAME, workspaceMemberSchema);

export default WorkspaceMember;