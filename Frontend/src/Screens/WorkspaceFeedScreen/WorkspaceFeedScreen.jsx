import React, { useEffect, useState, useContext } from "react"; // 👈 Agregamos useContext
import { useParams, useNavigate } from "react-router-dom";
import { AuthContext } from "../../context/AuthContext.jsx"; // 👈 Importamos tu contexto original
import { getWorkspaceFeed, createWorkspacePost } from "../../services/interaction.service.js";

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

    // Estilos de tu interfaz
    const styles = {
        container: {
            backgroundColor: '#0a0f1d',
            minHeight: '100vh',
            color: '#f3f4f6',
            padding: '40px 20px',
            fontFamily: 'system-ui, -apple-system, sans-serif'
        },
        card: {
            backgroundColor: 'rgba(25, 33, 51, 0.65)',
            border: '1px solid rgba(255, 255, 255, 0.08)',
            borderRadius: '12px',
            padding: '20px',
            backdropFilter: 'blur(10px)',
            boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.3)'
        },
        textarea: {
            backgroundColor: '#111827',
            border: '1px solid #1f2937',
            borderRadius: '8px',
            color: '#fff',
            resize: 'none',
            outline: 'none',
            width: '100%',
            padding: '12px',
            fontSize: '14px'
        },
        btnSubmit: {
            backgroundColor: '#3b82f6',
            color: '#fff',
            border: 'none',
            borderRadius: '6px',
            padding: '8px 20px',
            fontWeight: '600',
            cursor: 'pointer',
            transition: 'background-color 0.2s'
        },
        postCard: {
            backgroundColor: 'rgba(25, 33, 51, 0.45)',
            border: '1px solid rgba(255, 255, 255, 0.05)',
            borderRadius: '10px',
            padding: '16px',
            marginBottom: '16px'
        },
        avatar: {
            width: '42px',
            height: '42px',
            borderRadius: '50%',
            objectFit: 'cover',
            backgroundColor: '#3b82f6',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontWeight: 'bold',
            color: '#fff',
            fontSize: '16px'
        }
    };

    return (
        <div style={styles.container}>
            <div className="container" style={{ maxWidth: '800px', margin: '0 auto' }}>
                
                <button 
                    onClick={() => navigate(-1)} 
                    style={{
                        background: 'transparent',
                        border: 'none',
                        color: '#9ca3af',
                        cursor: 'pointer',
                        marginBottom: '20px',
                        fontSize: '14px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '8px'
                    }}
                >
                    ← Comunidades
                </button>

                {loading ? (
                    <div style={{ textAlign: 'center', padding: '50px' }}>
                        <p style={{ color: '#9ca3af' }}>Cargando debates de la comunidad...</p>
                    </div>
                ) : error ? (
                    <div style={{ ...styles.card, textAlign: 'center' }}>
                        <h4 style={{ color: '#ef4444', marginBottom: '10px' }}>¡Ups! Algo salió mal</h4>
                        <p style={{ color: '#9ca3af' }}>{error}</p>
                    </div>
                ) : (
                    <>
                        <h2 style={{ marginBottom: '24px', fontWeight: '700', fontSize: '28px' }}>
                            Foro de Debate
                        </h2>

                        {/* Formulario para publicar en el foro */}
                        <form onSubmit={handleEnviarPost} style={{ ...styles.card, marginBottom: '30px' }}>
                            <div style={{ marginBottom: '12px' }}>
                                <textarea
                                    style={styles.textarea}
                                    rows="3"
                                    placeholder="¿Qué teorías o comentarios tenés sobre este anime? ¡Compartilo con la comunidad!"
                                    value={nuevoContenido}
                                    onChange={(e) => setNuevoContenido(e.target.value)}
                                    maxLength={1000}
                                />
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button 
                                    type="submit" 
                                    disabled={enviando || !nuevoContenido.trim()}
                                    style={{
                                        ...styles.btnSubmit,
                                        opacity: (enviando || !nuevoContenido.trim()) ? 0.6 : 1,
                                        cursor: (enviando || !nuevoContenido.trim()) ? 'not-allowed' : 'pointer'
                                    }}
                                >
                                    {enviando ? 'Publicando...' : 'Publicar en el feed'}
                                </button>
                            </div>
                        </form>

                        {/* Muro de Publicaciones */}
                        <div>
                            {posts.length === 0 ? (
                                <div style={{ textAlign: 'center', padding: '40px 0' }}>
                                    <p style={{ color: '#9ca3af', fontStyle: 'italic' }}>
                                        No hay comentarios todavía en este foro. ¡Animatelo a empezar el debate!
                                    </p>
                                </div>
                            ) : (
                                posts.map((post) => (
                                    <div key={post.post_id} style={styles.postCard}>
                                        <div style={{ display: 'flex', alignItems: 'center', marginBottom: '12px', gap: '12px' }}>
                                            
                                            {post.user_avatar ? (
                                                <img 
                                                    src={post.user_avatar} 
                                                    alt={post.user_nombre} 
                                                    style={styles.avatar}
                                                />
                                            ) : (
                                                <div style={styles.avatar}>
                                                    {post.user_nombre?.charAt(0).toUpperCase()}
                                                </div>
                                            )}

                                            <div>
                                                <h5 style={{ margin: 0, fontSize: '15px', fontWeight: '600', color: '#fff' }}>
                                                    @{post.user_nombre}
                                                </h5>
                                                <span style={{ fontSize: '12px', color: '#9ca3af' }}>
                                                    {new Date(post.fecha_creacion).toLocaleString()}
                                                </span>
                                            </div>
                                        </div>

                                        <p style={{ 
                                            margin: 0, 
                                            fontSize: '14px', 
                                            lineHeight: '1.6', 
                                            color: '#d1d5db',
                                            whiteSpace: 'pre-line' 
                                        }}>
                                            {post.contenido}
                                        </p>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};