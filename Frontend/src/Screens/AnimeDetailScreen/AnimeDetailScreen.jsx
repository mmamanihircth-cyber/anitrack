import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { useLocation } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext'
import { MIS_ANIMES } from '../../Data/animes'
import { toggleFavorite, getMyList, getFavorites, addOrUpdateInList, getReviewsByAnime, createReview, toggleLikeReview, addReplyToReview } from "../../services/interaction.service";
import './AnimeDetailScreen.css'

export const AnimeDetailScreen = () => {

    const { hash } = useLocation();

    const { user } = useContext(AuthContext);
    const { id } = useParams()
    const navigate = useNavigate()
    const { isLogged } = useContext(AuthContext)

    const [selectedStars, setSelectedStars] = useState(0);

    const [hoverStars, setHoverStars] = useState(0);

    const anime = MIS_ANIMES.find(a => a.id === id)

    const relatedAnimes = MIS_ANIMES.filter(a =>
    anime.related?.includes(a.id)
)
    const commentsRef = useRef(null);

    const staffRef = useRef(null);

    const [userStatus, setUserStatus] = useState("watching");

    const [userScore, setUserScore] = useState(9);

    const [myScore, setMyScore] = useState(0);

    const [hoverScore, setHoverScore] = useState(0);

    const [favorite, setFavorite] = useState(false);

    const [episodesWatched, setEpisodesWatched] = useState(0);

    const [reviews, setReviews] = useState([]);

    const [activeReplyId, setActiveReplyId] = useState(null);

    const [replyText, setReplyText] = useState("");

    const [reviewText, setReviewText] = useState("");

useEffect(() => {
    if (!isLogged || !anime?.id) return;

    async function loadUserStatus() {
        try {
            const response = await getMyList();
            const listaUser = response?.data?.miLista || [];
            const item = listaUser.find(
                item => item.anime_id === anime.id
            );

            if (item) {
                setUserStatus(item.estado);
            }
        } catch (error) {
            console.error("Error al cargar el estado del usuario en AnimeDetail:", error);
        }
    }

    loadUserStatus();
}, [anime.id, isLogged]);

    useEffect(() => {
  if (hash) {
    const timer = setTimeout(() => {
      const targetId = hash.replace('#', '');
      const element = document.getElementById(targetId);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth', block: 'center' });
        element.classList.add('highlight-comment');
        setTimeout(() => {
          element.classList.remove('highlight-comment');
        }, 2000);
      }
    }, 400);

    return () => clearTimeout(timer);
  }
}, [hash, reviews]);

    useEffect(() => {
    if (!isLogged || !anime?.id) return;

    async function loadFavorites() {
        try {
            const response = await getFavorites();
            let listaFavoritos = [];
            if (response && Array.isArray(response)) {
                listaFavoritos = response;
            } else if (response?.data && Array.isArray(response.data)) {
                listaFavoritos = response.data;
            } else if (response?.data?.favoritos && Array.isArray(response.data.favoritos)) {
                listaFavoritos = response.data.favoritos;
            } else if (response?.favoritos && Array.isArray(response.favoritos)) {
                listaFavoritos = response.favoritos;
            }
            const existe = listaFavoritos.some(
                fav => String(fav.anime_id) === String(anime.id)
            );

            setFavorite(existe);

        } catch (error) {
            console.error("Error al cargar favoritos en AnimeDetailScreen:", error);
        }
    }

    loadFavorites();
}, [anime.id, isLogged]);

    const increaseEpisodes = () => {
    if (totalEpisodes === null) {
        setEpisodesWatched(prev => prev + 1);
        return;
    }

    setEpisodesWatched(prev => Math.min(prev + 1, totalEpisodes));
};

const decreaseEpisodes = () => {
    setEpisodesWatched(prev => Math.max(prev - 1, 0));
};

    if (!anime) {
        return (
            <div className="detail-error-container">
                <h2>Anime not found</h2>

                <button onClick={() => navigate('/home')}>
                    Back Home
                </button>
            </div>
        )
    }

    const totalEpisodes =
    anime.episodios === "Unknown"
        ? null
        : Number(anime.episodios);

    const statusLabel = {
    watching: "Watching",
    completed: "Completed",
    plan: "Plan to Watch",
    paused: "On Hold",
    dropped: "Dropped"
};

const handleFavorite = async () => {
    try {
        await toggleFavorite(anime.id);
        setFavorite(prev => !prev); 
        
    } catch (error) {
        console.error("Error al actualizar favoritos en pantalla:", error);
    }
};
const handleStatusChange = async (event) => {

    const nuevoEstado = event.target.value;

    setUserStatus(nuevoEstado);

    try {

        await addOrUpdateInList(anime.id, nuevoEstado);

    } catch (error) {

        console.error(error);

    }

};
useEffect(() => {
    if (!anime?.id) return;

    async function fetchReviews() {
        try {
            const respuestaAPI = await getReviewsByAnime(anime.id);
            if (respuestaAPI && respuestaAPI.data && Array.isArray(respuestaAPI.data.reviews)) {
                setReviews(respuestaAPI.data.reviews);
            } else if (respuestaAPI && Array.isArray(respuestaAPI.reviews)) {
                setReviews(respuestaAPI.reviews);
            } else if (Array.isArray(respuestaAPI)) {
                setReviews(respuestaAPI);
            } else {
                setReviews([]); 
            }
        } catch (error) {
            console.error("Error al traer reviews:", error);
            setReviews([]);
        }
    }
    fetchReviews();
}, [anime.id]);

const handlePublishReview = async () => {
    if (!reviewText.trim()) return;

    if (selectedStars === 0) {
        alert("Por favor, selecciona una puntuación antes de publicar tu review.");
        return;
    }
    
    const estrellasSeleccionadas = selectedStars || 5; 
    const puntuacionBase10 = estrellasSeleccionadas * 2; 

    try {
        const respuesta = await createReview(anime.id, puntuacionBase10, reviewText);
        const nuevaReviewRaw = respuesta.review || respuesta.data || respuesta;
        const nombreUsuarioActual = user?.nombre || user?.username;
        const nuevaReviewPopulada = {
        ...nuevaReviewRaw,
        usuario_id: {
            ...nuevaReviewRaw.usuario_id,
            nombre: nombreUsuarioActual 
        }
    };
        setReviews(prev => {
        const listaSegura = Array.isArray(prev) ? prev : [];
        return [nuevaReviewPopulada, ...listaSegura];
    });
        setReviewText("");
        setSelectedStars(0);
    } catch (error) {
    console.error("Error al publicar la review:", error);
}
};

const handleLikeClick = async (reviewId) => {
    if (!isLogged) {
        alert("Debes iniciar sesión para dar like");
        return;
    }
    try {
        const res = await toggleLikeReview(reviewId);
        if (res.ok) {
            setReviews(prevReviews => 
                prevReviews.map(r => {
                    const currentId = r.review?._id || r._id;
                    if (currentId === reviewId) {
                        const reviewData = r.review ? { ...r.review } : { ...r };
                        if(r.review) {
                            return { ...r, review: { ...reviewData, likes: new Array(res.data.likes).fill(1) } };
                        } else {
                            return { ...reviewData, likes: new Array(res.data.likes).fill(1) };
                        }
                    }
                    return r;
                })
            );
        }
    } catch (error) {
        alert(error.message);
    }
};
const handlePublishReply = async (reviewId) => {
    if (!replyText.trim()) return;
    try {
        const res = await addReplyToReview(reviewId, replyText);
        if (res.ok) {
            setReviews(prevReviews => 
                prevReviews.map(r => {
                    const currentId = r.review?._id || r._id;
                    if (currentId === reviewId) {
                        if (r.review) {
                            return { ...r, review: { ...r.review, respuestas: res.data.respuestas } };
                        } else {
                            return { ...r, respuestas: res.data.respuestas };
                        }
                    }
                    return r;
                })
            );
            setReplyText(""); 
            setActiveReplyId(null); 
        }
    } catch (error) {
        alert(error.message);
    }
};
    return (
        <div className="detail-page">

            <section
                className="hero-banner"
                style={{
                    backgroundImage: `url(${anime.imagen})`
                }}
            >

                <div className="hero-overlay">

                    <button
                        className="back-home-btn"
                        onClick={() => navigate('/home')}
                    >
                        ← Home
                    </button>

                    <div className="hero-content">

                        <div className='hero-top'>

                        <img
                            src={anime.imagen}
                            alt={anime.titulo}
                            className="hero-poster"
                        />

                        <div className="hero-info">

                            <span className="hero-type">
                                {anime.tipo}
                            </span>

                            <h1>
                                {anime.titulo}
                            </h1>

                            <p className="hero-status">
                                {anime.estado === 'airing'
                                    ? 'Currently Airing'
                                    : 'Upcoming'}
                            </p>

                            <div className="hero-score">

                                <div className="score-circle">

                                    <span className="score-number">
                                        {anime.ranking}
                                    </span>

                                    <span className="score-text">
                                        Score
                                    </span>

                                </div>

                                <div className="score-stats">

                                    <div>

                                        <strong>
                                            {anime.popularidad}
                                        </strong>

                                        <span>
                                            Popularity
                                        </span>

                                    </div>

                                    <div>

                                        <strong>
                                            {anime.miembros}
                                        </strong>

                                        <span>
                                            Members
                                        </span>

                                    </div>

                                    <div>

                                        <strong>
                                            {anime.episodios}
                                        </strong>

                                        <span>
                                            Episodes
                                        </span>

                                    </div>

                                </div>

                            </div>

                            {isLogged ? (

    <>
        

    </>

) : (

    <div className="hero-buttons">
    {!isLogged ? (
        <button
            className="btn-primary"
            onClick={() => navigate("/login")}
        >
            + Add to List
        </button>
    ) : (
        <div className="status-selector">

            
                <label>My Status</label>
                <select
                    value={userStatus}
                    onChange={(e) => setUserStatus(e.target.value)}
                >
                    <option value="plan">Plan to Watch</option>
                    <option value="watching">Watching</option>
                    <option value="completed">Completed</option>
                    <option value="onhold">On Hold</option>
                    <option value="dropped">Dropped</option>
                </select>
        </div>
    )}
</div>

)}

                        </div>
                        </div>

                        {isLogged && (
                            <section className='your-list-section'>
                                <div className="hero-user-panel">

    <h3 className="user-panel-title">
        Your List
    </h3>

    <div className="user-panel-grid">

        <div className="panel-item">

            <p>

    <strong>Status:</strong>
    <select
        className={`status-select ${userStatus}`}
        value={userStatus}
        onChange={handleStatusChange}
    >
        <option value="watching">Watching</option>
        <option value="completed">Completed</option>
        <option value="plan">Plan to Watch</option>
        <option value="paused">On Hold</option>
        <option value="dropped">Dropped</option>
    </select>

</p>
        
        </div>

        <div className="panel-item">

            <label>Episodes</label>

            <div className="episode-counter">

                <button className="episode-btn" onClick={decreaseEpisodes}>−</button>

                <span>
                    {episodesWatched} / {totalEpisodes ?? "?"}
                </span>

                <button className="episode-btn" onClick={increaseEpisodes}>+</button>

            </div>

        </div>

        <div className="panel-item">

            <label>Your Score</label>

            <div className="score-selector">

                {[1,2,3,4,5,6,7,8,9,10].map(score => (

                    <button
                        key={score}
                        className={
                            userScore === score
                                ? "score-btn active"
                                : "score-btn"
                        }
                        onClick={() => setUserScore(score)}
                    >
                        {score}
                    </button>

                ))}

            </div>

        </div>

        <div className="panel-item">

            <label>Favorite</label>
  <button
    className={favorite ? "favorite-btn active" : "favorite-btn"}
    onClick={handleFavorite}
  >
    {favorite ? "Added" : "+ Add to List"}
  </button>

        </div>

    </div>

    <div className="quick-actions">

        <button
            className="quick-action-btn"
            onClick={() =>
        commentsRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "start",
        })
    }
        >
            💬 Comments
        </button>

        <button 
            className="quick-action-btn"
            onClick={() =>
        staffRef.current?.scrollIntoView({
            behavior: "smooth",
            block: "center",
        })
    }>
            📝 Staff
        </button>

        <button className="quick-action-btn">
            👥 Community
        </button>

        <button
            className="quick-action-btn"
            onClick={() =>
                navigator.share?.({
                    title: anime.titulo,
                    text: anime.sinopsis,
                    url: window.location.href
                })
            }
        >
            🔗 Share
        </button>

    </div>

</div>
                            </section>
                        )}

                    </div>

                </div>

            </section>

            {/* CONTENIDO */}

            <div className="detail-content">

                {/* IZQUIERDA */}

                <aside className="detail-sidebar">

                    <div className="info-card">

                        <h3>Information</h3>

                        <p><strong>Type:</strong> {anime.tipo}</p>

                        <p><strong>Status:</strong> {anime.estado}</p>

                        <p><strong>Episodes:</strong> {anime.episodios}</p>

                        <p><strong>Popularity:</strong> #{anime.popularidad}</p>

                    </div>

                </aside>

                {/* DERECHA */}

                <main className="detail-main">

                    <section className="detail-card">

                        <h2>Synopsis</h2>

                        <p>
                            {anime.sinopsis_complete}
                        </p>

                    </section>

                    <section className="detail-card">

                        <h2>Background</h2>

                        <p>
                            {anime.background}
                        </p>

                    </section>

                    <section className="why-watch-section">

    <h2>✨ Why Watch This Anime?</h2>

<div className="whywatch-grid">

    {anime.whyWatch?.map((item, index) => (

        <div
            key={index}
            className="whywatch-card"
        >

            <div className="whywatch-icon">
                {item.icon}
            </div>

            <h3>{item.title}</h3>

            <p>{item.text}</p>

        </div>

    ))}

</div>

</section>

<section className="characters-section">

    <div className="section-header">

        <h2>Main Characters</h2>

        <span>{anime.characters?.length || 0} Characters</span>

    </div>

    <div className="characters-grid">

        {anime.characters?.map(character => (

            <div
                key={character.id}
                className="character-card"
            >

                <img
                    src={character.imagen}
                    alt={character.nombre}
                    className="character-image"
                />

                <div className="character-info">

                    <h4>

                        {character.nombre}

                    </h4>

                    <span>

                        {character.rol}

                    </span>

                </div>

            </div>

        ))}

    </div>

</section>

                    <section className="detail-card">

    <h2>Opening & Ending Themes</h2>

    <div className="themes-container">

        <div className="theme-column">

            <section className="detail-card">
    <h3>🎵 Opening Themes</h3>
    <div className="music-list">
        {anime.openings?.map((opening, index) => (
            <div className="music-item" key={opening.id || index}>
                <div className="music-number">
                    {String(index + 1).padStart(2, "0")}
                </div>
                
                <div className="music-info">
                    <strong>{opening.title}</strong>
                    <span>{opening.artist}</span>
                </div>

                {opening.song ? (
                    <a
                        className="music-icon"
                        href={opening.song}
                        target="_blank"
                        rel="noreferrer"
                    >
                        ▶
                    </a>
                ) : (
                    <div className="music-icon" style={{ opacity: 0.3, cursor: 'default' }}>
                        ▶
                    </div>
                )}
            </div>
        ))}
    </div>
</section>

        </div>

        <div className="theme-column">

            <section className="detail-card">
    <h3>🎵 Ending Themes</h3>
    <div className="music-list">
        {anime.endings?.map((ending, index) => (
            <div className="music-item" key={ending.id || index}>
                <div className="music-number">
                    {String(index + 1).padStart(2, "0")}
                </div>
                
                <div className="music-info">
                    <strong>{ending.title}</strong>
                    <span>{ending.artist}</span>
                </div>

                {ending.song ? (
                    <a
                        className="music-icon"
                        href={ending.song}
                        target="_blank"
                        rel="noreferrer"
                    >
                        ▶
                    </a>
                ) : (
                    <div className="music-icon" style={{ opacity: 0.3, cursor: 'default' }}>
                        ▶
                    </div>
                )}
            </div>
        ))}
    </div>
</section>

        </div>

    </div>

</section>

    <section className="detail-card" ref={staffRef}>

    <h2>🎬 Production</h2>

    <div className="production-grid">

        <div className="production-item">

            <span>✍</span>

            <div>

                <small>Author</small>

                <strong>{anime.production.autor}</strong>

            </div>

        </div>

        <div className="production-item">

            <span>🏢</span>

            <div>

                <small>Studio</small>

                <strong>{anime.production.estudio}</strong>

            </div>

        </div>

        <div className="production-item">

            <span>🎬</span>

            <div>

                <small>Director</small>

                <strong>{anime.production.director}</strong>

            </div>

        </div>

        <div className="production-item">

            <span>🎵</span>

            <div>

                <small>Music</small>

                <strong>{anime.production.musica}</strong>

            </div>

        </div>

    </div>

</section>

<section className="detail-card">

    <h2>🌐 Official Links</h2>

    <div className="official-links">

        <a
            href={anime.meta.sitioOficial}
            target="_blank"
            rel="noreferrer"
            className="official-link"
        >
            <span>🌍 Official Website</span>
            <span>↗</span>
        </a>

        <a
            href={anime.meta.wikipedia}
            target="_blank"
            rel="noreferrer"
            className="official-link"
        >
            <span>📖 Wikipedia</span>
            <span>↗</span>
        </a>

        <a
            href={anime.meta.twitter}
            target="_blank"
            rel="noreferrer"
            className="official-link"
        >
            <span>🐦 Twitter</span>
            <span>↗</span>
        </a>

        <button
            className="official-link"
            onClick={() => window.open(anime.trailer, "_blank")}
        >
            <span>▶ Trailer</span>
            <span>↗</span>
        </button>

    </div>

</section>

                    <section className="detail-card" ref={commentsRef}>

    <h2>Community Reviews</h2>

    <p className="reviews-description">
        Discover what the AniTrack community thinks about this anime.
    </p>

    <div className="reviews-container">
    {Array.isArray(reviews) && reviews.length > 0 ? (
        reviews.map((review) => {
            const reviewData = review.review ? review.review : review;
            const username = 
                reviewData.usuario_id?.nombre || 
                reviewData.usuario?.nombre || 
                reviewData.nombre ||
                "Anonymous";
                
            const inicial = username.charAt(0).toUpperCase();
            const userAvatarUrl = reviewData.usuario_id?.imagen_url || reviewData.usuario_id?.imagen_url;

            const estrellasRellenas = Math.round((reviewData.puntuacion || 10) / 2);
            const textoComentario = reviewData.comentario || reviewData.texto || "";

            const fechaOriginal = reviewData.fecha_publicacion || reviewData.fecha || new Date();
            const fechaFormateada = new Date(fechaOriginal).toString() !== "Invalid Date"
                ? new Date(fechaOriginal).toLocaleDateString()
                : new Date().toLocaleDateString();

            return (
    <article key={reviewData._id || reviewData.id} 
    id={`review-${reviewData._id || reviewData.id}`} 
    className="review-card">
        <div className="review-header">
            <div className="review-user">
                <div className="review-avatar">
                    {userAvatarUrl ? (
                        <img src={userAvatarUrl} 
            alt={username} 
            className="avatar-img" style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} />
                    ) : (
                        inicial
                    )}
                </div>
                <div>
                    <strong>{username}</strong> 
                    <span>{fechaFormateada}</span>
                </div>
            </div>
            <div className="review-score">
                {"★".repeat(estrellasRellenas)}
                {"☆".repeat(5 - estrellasRellenas)}
            </div>
        </div>
        
        <p className="review-text">{textoComentario}</p>
        
        <div className="review-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
    <div className="review-likes-wrapper" style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
        <span className="review-likes" style={{ display: 'flex', alignItems: 'center', gap: '4px' }}>
            ❤️ {reviewData.likes?.length || 0}
        </span>
        <button 
            className="review-like-btn" 
            onClick={() => handleLikeClick(reviewData._id || reviewData.id)}
            style={{ cursor: 'pointer' }}
        >
            👍
        </button>
    </div>
    {isLogged && (
        <button 
            className="review-reply-toggle-btn"
            onClick={() => {
                const rId = reviewData._id || reviewData.id;
                setActiveReplyId(activeReplyId === rId ? null : rId);
            }}
            style={{ background: 'none', border: 'none', color: '#3b82f6', cursor: 'pointer' }}
        >
            💬 {activeReplyId === (reviewData._id || reviewData.id) ? "Cancel" : `Reply (${reviewData.respuestas?.length || 0})`}
        </button>
    )}
</div>
<div className="review-replies-section">
    {reviewData.respuestas && reviewData.respuestas.length > 0 && (
        <div className="replies-list">
            {reviewData.respuestas.map((reply) => {
                const replyUser = reply.usuario_id?.nombre || "User";
                const replyAvatar = reply.usuario_id?.imagen_url;
                const replyInicial = replyUser.charAt(0).toUpperCase();
                
                const fechaReply = reply.fecha ? new Date(reply.fecha).toLocaleDateString() : new Date().toLocaleDateString();

                return (
                    <div key={reply._id || reply.id} className="reply-item">
                        <div className="reply-user-info">
                            <div className="reply-avatar-mini">
                                {replyAvatar ? (
                                    <img src={replyAvatar} alt={replyUser} />
                                ) : (
                                    replyInicial
                                )}
                            </div>
                            <strong className="reply-username">{replyUser}</strong>
                            <span className="reply-date">{fechaReply}</span>
                        </div>
                        <p className="reply-body-text">{reply.texto}</p>
                    </div>
                );
            })}
        </div>
    )}

    {activeReplyId === (reviewData._id || reviewData.id) && (
        <div className="reply-form-box">
            <input 
                type="text" 
                placeholder="Write a reply..." 
                value={replyText} 
                onChange={(e) => setReplyText(e.target.value)}
                className="reply-input-field"
            />
            <button 
                onClick={() => handlePublishReply(reviewData._id || reviewData.id)}
                disabled={!replyText.trim()}
                className="reply-send-btn"
            >
                Send
            </button>
        </div>
    )}
</div>
    </article>
);
        })
    ) : (
        <p className="no-reviews">No reviews yet. Be the first to comment!</p>
    )}
</div>

    {!isLogged && (

    <div className="login-required">

        <div className="login-required-icon">
            💬
        </div>

        <h3>Join the AniTrack Community</h3>

        <p>

            Rate your favorite anime, write reviews, build your personal list,
            and interact with thousands of anime fans around the world.

        </p>

        <button
            className="btn-primary"
            onClick={() => navigate('/login')}
        >
            Login to Continue
        </button>

    </div>

)}

    {isLogged && (

    <div className="review-form">

        <h3>Write Your Review</h3>

        <p className="review-form-subtitle">
            Share your thoughts with the AniTrack community.
        </p>

        <div className="review-stars">

    {[1,2,3,4,5].map((star) => (

        <span
            key={star}
            className={
                (hoverStars || selectedStars) >= star
                    ? "active-star"
                    : ""
            }
            onMouseEnter={() => setHoverStars(star)}
            onMouseLeave={() => setHoverStars(0)}
            onClick={() => setSelectedStars(star)}
        >
            ★
        </span>

    ))}

</div>

        <textarea
    placeholder="What did you think about this anime?"
    value={reviewText}
    onChange={(e) => setReviewText(e.target.value)}
/>

        <div className="review-actions">

            <button
    className="btn-primary"
    onClick={handlePublishReview}
    disabled={!reviewText.trim()}
>
    Publish Review
</button>

        </div>

    </div>

)}

</section>

                </main>

            </div>

        </div>
    )

}