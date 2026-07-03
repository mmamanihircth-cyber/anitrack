import express from 'express';
import authMiddleware from '../middlewares/auth.middleware.js';
import notificationController from '../controllers/notification.controller.js';

const notificationRouter = express.Router();

notificationRouter.use(authMiddleware);

notificationRouter.get('/', notificationController.getMyNotifications);
notificationRouter.put('/:notification_id/read', notificationController.markAsRead);

export default notificationRouter;