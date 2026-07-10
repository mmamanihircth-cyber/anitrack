import React, { useContext, useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router'
import { AuthContext } from '../../context/AuthContext'
import { MIS_ANIMES } from '../../Data/animes'
import { toggleFavorite, getFavorites, addOrUpdateInList} from "../../services/interaction.service";
import './AnimeDetailScreen.css'

export const AnimeDetailScreen = () => {

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

    const [userStatus, setUserStatus] = useState("Watching");

    const [userScore, setUserScore] = useState(9);

    const [myScore, setMyScore] = useState(0);

    const [hoverScore, setHoverScore] = useState(0);

    const [favorite, setFavorite] = useState(false);

    const [episodesWatched, setEpisodesWatched] = useState(0);

    const [reviews, setReviews] = useState(anime.reviews || []);

    const [reviewText, setReviewText] = useState("");

    useEffect(() => {

    if (!isLogged) return;

    async function loadFavorites() {

        try {

            const response = await getFavorites();

            const existe = response.data.favoritos.some(
    favorito => Number(favorito.anime_id) === Number(anime.id)
);

            setFavorite(existe);

        } catch (error) {
            console.error(error);
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
        const data = await toggleFavorite(anime.id);
        
        // Usamos 'data' que es donde guardamos el resultado
        setFavorite(data.favorite); 
        
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

function handlePublishReview() {

    if (!reviewText.trim() || selectedStars === 0) return;

    const newReview = {

        id: Date.now(),

        usuario: "You",

        avatar: "",

        fecha: "Just now",

        puntuacion: selectedStars,

        likes: 0,

        comentario: reviewText

    };

    setReviews(prev => [newReview, ...prev]);

    setReviewText("");

    setSelectedStars(0);

    setHoverStars(0);

}



    return (
        <div className="detail-page">

            {/* HERO */}

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
    className={
        favorite
            ? "favorite-btn active"
            : "favorite-btn"
    }
    onClick={handleFavorite}
>
    {favorite
        ? "❤ Added"
        : "♡ Add"}
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
                            {anime.sinopsis}
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

                    {/* RELACIONADOS */}

                    <section className="detail-card">

    <h2>Opening & Ending Themes</h2>

    <div className="themes-container">

        <div className="theme-column">

            <section className="detail-card">

    <h2>🎵 Opening Themes</h2>

    <div className="music-list">

        {anime.openings?.map((opening, index) => (

            <div
                key={index}
                className="music-item"
            >

                <div className="music-number">

                    {String(index + 1).padStart(2, "0")}

                </div>

                <div className="music-info">

                    <strong>{opening.title}</strong>

                    <span>{opening.artist}</span>

                </div>

                <div className="music-icon">

                    ▶

                </div>

            </div>

        ))}

    </div>

</section>

        </div>

        <div className="theme-column">

            <section className="detail-card">

    <h2>🎵 Ending Themes</h2>

    <div className="music-list">

        {anime.endings?.map((ending, index) => (

            <div
                key={index}
                className="music-item"
            >

                <div className="music-number">

                    {String(index + 1).padStart(2, "0")}

                </div>

                <div className="music-info">

                    <strong>{ending.title}</strong>

                    <span>{ending.artist}</span>

                </div>

                <div className="music-icon">

                    ▶

                </div>

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

                    {/* COMENTARIOS */}

                    <section className="detail-card" ref={commentsRef}>

    <h2>Community Reviews</h2>

    <p className="reviews-description">
        Discover what the AniTrack community thinks about this anime.
    </p>

    <div className="reviews-container">

        {reviews.map((review) => (

    <article
        key={review.id}
        className="review-card"
    >

        <div className="review-header">

            <div className="review-user">

                <div className="review-avatar">
                    {review.usuario.charAt(0)}
                </div>

                <div>

                <strong>{JSON.stringify(review.usuario)}</strong> 

                    <span>{review.fecha}</span>

                </div>

            </div>

            <div className="review-score">

                {"★".repeat(review.puntuacion)}
                {"☆".repeat(5 - review.puntuacion)}

            </div>

        </div>

        <p className="review-text">

            {review.comentario}

        </p>

        <div className="review-footer">

            <span className="review-likes">

                ❤️ {review.likes} people found this review helpful

            </span>

            <button className="review-like-btn">

                👍 Helpful

            </button>

        </div>

    </article>

))}

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