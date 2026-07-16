import express from 'express';

import authMiddleware from '../middlewares/auth.middleware.js';
import workspaceController from '../controllers/workspace.controller.js';
import workspaceMiddleware from '../middlewares/workspace.middleware.js';
import { MEMBER_WORKSPACE_ROLES } from '../constants/memberRoles.constant.js';
import memberWorkspaceController from '../controllers/memberWorkspace.controller.js';

const workspaceRouter = express.Router();
// 1. Traer todos los workspaces (pestaña Explorar)
// Colocada al principio para evitar conflictos de casteo con :workspace_id
workspaceRouter.get('/all', workspaceController.getAllPublic); 

// 2. Procesar invitaciones de miembros
workspaceRouter.get(
    '/:workspace_id/members/:decision',
    memberWorkspaceController.processInvitation
);

// ==========================================
// 🔒 RUTAS PRIVADAS (Requieren estar Autenticado)
// ==========================================
workspaceRouter.use(authMiddleware);

// Crear un nuevo workspace
workspaceRouter.post('/', workspaceController.create);

// Obtener los workspaces del propio usuario
workspaceRouter.get('/', workspaceController.getAllByUser);

// Obtener un workspace por ID (Requiere validar rol de membresía)
workspaceRouter.get(
    '/:workspace_id', 
    workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN, MEMBER_WORKSPACE_ROLES.MEMBER]), 
    workspaceController.getById
);

// Eliminar un workspace (Solo Owner)
workspaceRouter.delete('/:workspace_id', workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]), workspaceController.deleteById);

// Editar un workspace (Solo Owner)
workspaceRouter.put('/:workspace_id', workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER]), workspaceController.updateById);

// Invitar a un miembro (Owner o Admin)
workspaceRouter.post('/:workspace_id/members', workspaceMiddleware([MEMBER_WORKSPACE_ROLES.OWNER, MEMBER_WORKSPACE_ROLES.ADMIN]), memberWorkspaceController.inviteUser);

export default workspaceRouter;