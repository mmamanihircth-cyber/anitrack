import React, { useEffect, useState, useContext } from "react"; // 👈 Agregamos useContext
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx"; // 👈 Importamos tu contexto original
import { getWorkspaceFeed, createWorkspacePost } from "../../services/interaction.service.js";
import "./WorkspaceFeedScreen.css";

export const WorkspaceFeedScreen = () => {
    const { workspace_id } = useParams();
    const navigate = useNavigate();
    
    // 👤 Consumimos los datos directamente de tu AuthContext
    const { isLogged } = useContext(AuthContext);

    const [posts, setPosts] = useState([]);
    const [nuevoContenido, setNuevoContenido] = useState('');
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [enviando, setEnviando] = useState(false);

    // 🔑 Obtenemos el token con la key exacta que definiste en tu AuthContext
    const token = localStorage.getItem('auth_token'); 

    // Cargar las publicaciones del foro
    const cargarFeed = async () => {
        try {
            setLoading(true);
            setError(null);
            
            // Validamos contra tu estado real de login o la existencia del token
            if (!isLogged || !token) {
                setError("Debes iniciar sesión para ver el feed de esta comunidad.");
                return;
            }

            const res = await getWorkspaceFeed(workspace_id, token);
            if (res.ok) {
                setPosts(res.data?.feed || []);
            } else {
                setError(res.message || "No se pudo cargar el feed.");
            }
        } catch (err) {
            setError("Error de conexión al cargar el feed de la comunidad.");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (workspace_id) {
            cargarFeed();
        }
    }, [workspace_id, isLogged]); // Agregamos isLogged como dependencia para recargar si el estado de auth cambia

    // Manejar el envío de una nueva publicación
    const handleEnviarPost = async (e) => {
        e.preventDefault();
        if (!nuevoContenido.trim()) return;

        try {
            setEnviando(true);
            const res = await createWorkspacePost(workspace_id, nuevoContenido, token);
            
            if (res.ok) {
                setNuevoContenido('');
                // Recargamos el feed para traer el post recién creado
                await cargarFeed(); 
            } else {
                alert(res.message || "Hubo un problema al publicar tu mensaje.");
            }
        } catch (err) {
            console.error("Error al publicar:", err);
            alert("No se pudo enviar la publicación.");
        } finally {
            setEnviando(false);
        }
    };

    return (
    <div className="workspace-page">

        <button
            className="btn-back-home"
            onClick={() => navigate(-1)}
        >
            ← Comunidades
        </button>

        {/* HERO */}

        <section className="workspace-header">

            <div className="workspace-icon">
                💬
            </div>

            <div className="workspace-header-content">

                <h1>Foro de Debate</h1>

                <p>
                    Compartí teorías, opiniones y debatí con otros fanáticos.
                </p>

            </div>

        </section>

        {loading ? (

            <div className="workspace-message">

                <p>Cargando publicaciones...</p>

            </div>

        ) : error ? (

            <div className="workspace-error">

                <h3>Ocurrió un error</h3>

                <p>{error}</p>

            </div>

        ) : (

            <>

                {/* PUBLICAR */}

                <section className="create-post-card">

                    <h2>Crear publicación</h2>

                    <form onSubmit={handleEnviarPost}>

                        <textarea

                            rows={5}

                            placeholder="¿Qué teoría o comentario querés compartir con la comunidad?"

                            value={nuevoContenido}

                            onChange={(e) => setNuevoContenido(e.target.value)}

                            maxLength={1000}

                        />

                        <div className="post-actions">

                            <button

                                className="btn-post"

                                disabled={enviando || !nuevoContenido.trim()}

                            >

                                {enviando
                                    ? "Publicando..."
                                    : "Publicar"}

                            </button>

                        </div>

                    </form>

                </section>

                {/* FEED */}

                <section className="feed-container">

                    {posts.length === 0 ? (

                        <div className="workspace-empty">

                            <h3>
                                Todavía no hay publicaciones
                            </h3>

                            <p>
                                Sé el primero en iniciar una conversación.
                            </p>

                        </div>

                    ) : (

                        posts.map(post => (

                            <article

                                key={post.post_id}

                                className="post-card"

                            >

                                <div className="post-header">

                                    {

                                        post.user_avatar ?

                                            <img

                                                src={post.user_avatar}

                                                alt={post.user_nombre}

                                                className="post-avatar"

                                            />

                                            :

                                            <div className="post-avatar">

                                                {post.user_nombre
                                                    ?.charAt(0)
                                                    .toUpperCase()}

                                            </div>

                                    }

                                    <div>

                                        <h4>

                                            @{post.user_nombre}

                                        </h4>

                                        <span>

                                            {

                                                new Date(
                                                    post.fecha_creacion
                                                ).toLocaleString()

                                            }

                                        </span>

                                    </div>

                                </div>

                                <p className="post-content">

                                    {post.contenido}

                                </p>

                            </article>

                        ))

                    )}

                </section>

            </>

        )}

    </div>
);
};