import Notification from '../models/notification.model.js';

class NotificationController {
    // Obtener las notificaciones del usuario logueado
    async getMyNotifications(request, response) {
        try {
            const usuario_id = request.user.id;
            
            // Traemos las notificaciones ordenadas de la más nueva a la más vieja
            const notifications = await Notification.find({ usuario_destino_id: usuario_id })
                .sort({ fecha: -1 });

            return response.status(200).json({
                ok: true,
                data: { notifications }
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al obtener notificaciones" });
        }
    }

    // Marcar una notificación específica como leída (cuando hacen clic)
    async markAsRead(request, response) {
        try {
            const { notification_id } = request.params;

            await Notification.findByIdAndUpdate(notification_id, { leido: true });

            return response.status(200).json({
                ok: true,
                message: "Notificación marcada como leída"
            });
        } catch (error) {
            console.error(error);
            return response.status(500).json({ ok: false, message: "Error al actualizar la notificación" });
        }
    }
}

const notificationController = new NotificationController();
export default notificationController;