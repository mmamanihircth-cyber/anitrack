import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import interactionController from '../controllers/interaction.controller.js';

const interactionRouter = express.Router();

// 1. RUTA PÚBLICA: Obtener comentarios de un anime (Función flecha segura)
interactionRouter.get('/review/anime/:anime_front_id', (req, res, next) => {
    return interactionController.getReviewsByAnime(req, res, next);
});

// A partir de acá se requiere token de autenticación
interactionRouter.use(authMiddleware);

// 2. CREAR O ACTUALIZAR COMENTARIO
interactionRouter.post('/review', (req, res, next) => {
    return interactionController.createOrUpdateReview(req, res, next);
});

// 3. DAR LIKE
interactionRouter.post('/review/:review_id/like', (req, res, next) => {
    return interactionController.toggleLike(req, res, next);
});

// 4. DAR DISLIKE
interactionRouter.post('/review/:review_id/dislike', (req, res, next) => {
    return interactionController.toggleDislike(req, res, next);
});

// 5. RESPONDER COMENTARIO
interactionRouter.post('/review/:review_id/reply', (req, res, next) => {
    return interactionController.addReply(req, res, next);
});

// 6. AGREGAR A MI LISTA PERSONAL
interactionRouter.post('/list', (req, res, next) => {
    return interactionController.addOrUpdateInList(req, res, next);
});

// 7. OBTENER MI LISTA PERSONAL
interactionRouter.get('/list', (req, res, next) => {
    return interactionController.getMyList(req, res, next);
});

export default interactionRouter;