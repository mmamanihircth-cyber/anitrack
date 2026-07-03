import ENVIRONMENT from "./config/environment.config.js";
import connectMongoDB from "./config/mongodb.config.js";
import express from "express";

/* SOLO EN LOCAL Y SI TIENES PROBLEMAS DE DNS PARA CONECTARTE A MONGODB */
import dns from 'dns';
import authRouter from "./routes/auth.router.js";
import authMiddleware from "./middlewares/auth.middleware.js";
import workspaceRouter from "./routes/workspace.router.js";
import cors from 'cors'; // Importante para los problemas de rutas cruzadas (CORS)
import errorHandlerMiddleware from "./middlewares/error.middleware.js";
import interactionRouter from "./routes/interaction.router.js";
import notificationRouter from "./routes/notification.router.js";

if(ENVIRONMENT.MODE === 'development'){
    dns.setServers(['8.8.8.8', '8.8.4.4']);
}

connectMongoDB();

const app = express();
const PORT = ENVIRONMENT.PORT;

app.use(cors());

app.use(express.json());

// === ENRUTADORES CONECTADOS ===
app.use('/api/interactions', interactionRouter);
app.use('/api/auth', authRouter);
app.use('/api/workspace', workspaceRouter);
app.use('/api/notifications', notificationRouter);

app.get(
    '/api/profile', 
    authMiddleware,
    (request, response) => {
        console.log(
            'Nombre del cliente:',
            request.user.nombre
        );
        return response.json({
            ok: true,
            status: 200,
            message: "Estas autenticado"
        });
    }
);

app.use(errorHandlerMiddleware);

app.listen(PORT, () => {
    console.log(`Servidor corriendo en http://localhost:${PORT}`);
});