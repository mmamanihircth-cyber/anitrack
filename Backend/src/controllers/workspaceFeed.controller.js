import interactionRepository from "../repositories/interaction.repository.js";
import workspaceMemberRepository from "../repositories/workspaceMember.repository.js";
import ServerError from "../helpers/serverError.helper.js";
import MEMBER_INVITATION_STATUS from "../constants/memberInvitationStatus.constant.js";

class WorkspaceFeedController {

    // 🚀 1. Crear una publicación adentro de una comunidad (Workspace)
    async createPost(request, response) {
        try {
            const { workspace_id } = request.params;
            const { contenido } = request.body;
            
            // Para que esto funcione se debe ejecutar previamente tu authMiddleware
            const user_id = request.user.id; 

            // Validaciones básicas de campo
            if (!contenido || contenido.trim() === '') {
                throw new ServerError("El contenido de la publicación no puede estar vacío", 400);
            }

            // SEGURIDAD: Validamos si el usuario pertenece activamente a este Workspace
            const membership = await workspaceMemberRepository.getMemberByWorkspaceAndUserId(workspace_id, user_id);
            
            if (!membership || membership.estatus_invitacion !== MEMBER_INVITATION_STATUS.ACCEPTED) {
                throw new ServerError("No tenés permisos para publicar en esta comunidad porque no eres miembro activo", 403);
            }

            // Almacenamos la interacción en la base de datos
            const newPost = await interactionRepository.create(workspace_id, user_id, contenido);

            return response.status(201).json({
                ok: true,
                message: "¡Tu publicación ha sido compartida con éxito!",
                data: {
                    post: newPost
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                console.error("Error en InteractionController.createPost:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor al crear la publicación"
                });
            }
        }
    }

    // 📥 2. Obtener el feed completo de publicaciones de un Workspace específico
    async getFeedByWorkspace(request, response) {
        try {
            const { workspace_id } = request.params;
            const user_id = request.user.id;

            // 🚫 COMENTAMOS ESTO TEMPORALMENTE PARA COMPROBAR:
            /*
            const membership = await workspaceMemberRepository.getMemberByWorkspaceAndUserId(workspace_id, user_id);
            
            if (!membership || membership.estatus_invitacion !== MEMBER_INVITATION_STATUS.ACCEPTED) {
                throw new ServerError("No puedes ver el contenido de esta comunidad porque no eres miembro activo", 403);
            }
            */

            // Traemos el feed directamente
            const feed = await interactionRepository.getByWorkspaceId(workspace_id);

            return response.status(200).json({
                ok: true,
                message: "Feed de la comunidad obtenido con éxito",
                data: {
                    feed
                }
            });

        } catch (error) {
            if (error instanceof ServerError) {
                return response.status(error.status).json({
                    ok: false,
                    message: error.message
                });
            } else {
                console.error("Error en InteractionController.getFeedByWorkspace:", error);
                return response.status(500).json({
                    ok: false,
                    message: "Error interno del servidor al cargar el feed"
                });
            }
        }
    }
}

const workspacefeedcontroller = new WorkspaceFeedController();
export default workspacefeedcontroller;