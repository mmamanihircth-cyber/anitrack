import React, { useContext, useState, useEffect } from 'react'
import { AuthContext } from '../../context/AuthContext.jsx'
import { useNavigate } from 'react-router'
import { MIS_ANIMES } from '../../Data/animes'
import './HomeScreen.css'
import homeBanner from '../../Asent/home-banner.png'
import { NotificationsDropdown } from '../../Components/NotificationsDropdown/NotificationsDropdown.jsx'
// 🌟 Asegurate de que quede exactamente así:
import { toggleFavorite, getFavorites } from "../../services/interaction.service";

export const HomeScreen = () => {
  const { isLogged, logout, userData } = useContext(AuthContext)
  const navigate = useNavigate()
  const [busqueda, setBusqueda] = useState('')
  const [userList, setUserList] = useState([])
  // --- Agrega esto justo debajo de tus useState ---
  function handleLogout() {
    logout()
    navigate('/login')
  }

  useEffect(() => {
    async function loadUserList() {
      if (!isLogged) return; 
      try {
        const response = await getFavorites();
        
        // Evaluamos de manera flexible lo que mande el backend
        if (response && Array.isArray(response)) {
          setUserList(response);
        } else if (response?.favoritos && Array.isArray(response.favoritos)) {
          setUserList(response.favoritos);
        } else if (response?.data && Array.isArray(response.data)) {
          setUserList(response.data);
        } else if (response?.data?.favoritos && Array.isArray(response.data.favoritos)) {
          setUserList(response.data.favoritos);
        }
      } catch (error) {
        console.error("Error al cargar la lista del usuario en el Home:", error);
      }
    }
    loadUserList();
  }, [isLogged]);

  const handleQuickAdd = async (animeId) => {
    try {
        const data = await toggleFavorite(animeId);
        
        // 🔄 Verificamos si ya estaba agregado en nuestro estado local
        const yaEsta = userList.some(item => item.anime_id === animeId);

        if (yaEsta) {
            // Si ya estaba, significa que el backend lo SACÓ. Lo borramos del estado local.
            setUserList(prev => prev.filter(item => item.anime_id !== animeId));
        } else {
            // Si no estaba, el backend lo AGREGÓ. Lo sumamos al estado local.
            setUserList(prev => [...prev, { anime_id: animeId }]);
        }
    } catch (error) {
        console.error("Error al interactuar con el anime:", error);
        alert("No se pudo actualizar la lista, ¿estás logueado?");
    }
  };

  // 🔍 Filtro para la barra de búsqueda central
  const animesFiltrados = MIS_ANIMES.filter(anime => 
    anime.titulo.toLowerCase().includes(busqueda.toLowerCase())
  )

  // 📊 Filtros para separar las listas del panel derecho
  const topAiring = MIS_ANIMES.filter(a => a.estado === 'airing').sort((a, b) => b.ranking - a.ranking);
  const topUpcoming = MIS_ANIMES.filter(a => a.estado === 'upcoming');
  const topPopular = MIS_ANIMES.filter(a => a.estado === 'popular');

  return (
    <div className="mal-container">
      
      {/* 🔹 HEADER ACTUALIZADO (Con buscador y botones) */}
      <header className="mal-header">
        <div className="header-logo" onClick={() => navigate('/home')}>
          <h1 className="logo-title">
    Ani<span>Track</span>
</h1>
        </div>

        {/* 🔍 BARRA DE BÚSQUEDA CENTRAL */}
        <div className="header-search-container">
          <input 
            type="text" 
            placeholder="Search Anime..." 
            value={busqueda}
            onChange={(e) => setBusqueda(e.target.value)}
            className="header-search-input"
          />
        </div>

        <div className="header-user">
          {isLogged ? (
             <>
             <button 
                className="btn-comunidades" 
                onClick={() => navigate('/communities')}
              >
                Comunidades
              </button>
              <div className="header-actions">
        <NotificationsDropdown />
        </div>

      <div 
        className="profile-link"
        onClick={() => navigate('/profile')}
      >

        <div className="profile-mini-avatar">
          {userData?.imagen_url ? (
      <img 
        src={userData.imagen_url} 
        alt={userData?.nombre} 
        className="avatar-img-mini" 
        /* style={{ width: '100%', height: '100%', borderRadius: '50%', objectFit: 'cover' }} */
      />
    ) : (
      userData?.nombre?.charAt(0).toUpperCase()
    )}
        </div>


        <span className="username">
          @{userData?.nombre || "usuario"}
        </span>

      </div>


      <button 
        className="btn-logout" 
        onClick={handleLogout}
      >
        Cerrar sesión
      </button>

    </>
          ) : (
            <div className="auth-buttons-group">
              <button className="btn-login-header" onClick={() => navigate('/login')}>
                Iniciar Sesión
              </button>
              <button className="btn-register-header" onClick={() => navigate('/register')}>
                Registrarse
              </button>
            </div>
          )}
        </div>
      </header>

      {/* 🔹 CUERPO PRINCIPAL */}
      <div className="mal-layout">
        
        {/* Columna Izquierda: Catálogo dinámico */}
        <main className="mal-main-content">
          <div className="welcome-banner" style={{
        backgroundImage: `url(${homeBanner})`
    }}>

    <div className="banner-overlay"></div>

    <div className="welcome-content">

        <span className="season-badge">
            ✨ Summer 2026
        </span>

        <h2>
            {isLogged
                ? `Welcome back, ${userData?.nombre}!`
                : "Welcome to AniTrack"}
        </h2>

        <p>
            Discover the most popular anime,
            continue watching your favorites
            and build your personal collection.
        </p>

        <div className="hero-buttons">

            <button className="hero-btn-primary">
                Explore Anime
            </button>

            <button className="hero-btn-secondary" onClick={() => navigate('/register')}>
                My List
            </button>

        </div>

    </div>

</div>

          <div className="anime-grid">
            {animesFiltrados.length > 0 ? (
              animesFiltrados.map((anime) => {
                // 🔍 Cruce de datos clave: Verificamos si este anime ya está guardado en la lista del usuario
                const yaEstaAgregado = userList.some(item => item.anime_id === anime.id);

                return (
                  <div key={anime.id} className="anime-card glass-card">
                    <div className="card-rank-box">
                      <span className="rank-label">RANK</span>
                      <span className="rank-value">{anime.ranking !== "N/A" ? anime.ranking : "-"}</span>
                    </div>
                    
                    <img 
                      src={anime.imagen} 
                      alt={anime.titulo} 
                      className="anime-poster" 
                      onClick={() => navigate(`/anime/${anime.id}`)}
                      style={{ cursor: 'pointer' }}
                    />

                    <div className="anime-details">
                      <h3 
                        className="anime-title-link" 
                        onClick={() => navigate(`/anime/${anime.id}`)}
                        style={{ cursor: 'pointer', color: '#7294e3' }}
                      >
                        {anime.titulo}
                      </h3>
                      
                      <p className="anime-synopsis-text">{anime.sinopsis}</p>
                      
                      <div className="anime-meta-row">
                        <span className="meta-badge">{anime.tipo}</span>
                        <span className="meta-eps">{anime.episodios} eps</span>
                        <span className="meta-members">👥 {anime.miembros} members</span>
                        
                        {/* 🎨 BOTÓN INTERACTIVO MODIFICADO */}
                        <button 
  className={yaEstaAgregado ? "btn-added" : "btn-primary"}
  onClick={() => handleQuickAdd(anime.id)} 
>
  {yaEstaAgregado ? "Added" : "+ Add to List"}
</button>
                      </div>
                    </div>
                  </div>
                );
              })
            ) : (
              <p style={{ textAlign: 'center', color: '#6a6f8a', marginTop: '20px' }}>No se encontraron animes con ese nombre.</p>
            )}
          </div>
        </main>

        {/* Columna Derecha: Bloques Apilados */}
        <aside className="mal-sidebar">
          
          {/* Bloque 1: Top Airing */}
          <div className="sidebar-section">
            <h3 className="sidebar-title">Top Airing Anime</h3>
            <ul className="top-anime-list">
              {topAiring.map((anime, index) => (
  <li 
    key={anime.id} 
    className="top-anime-item" 
    onClick={() => navigate(`/anime/${anime.id}`)} 
    style={{ cursor: 'pointer' }}
  >
    <span className="top-index">{index + 1}</span>
    <img src={anime.imagen} alt={anime.titulo} className="top-mini-img" />
    <div className="top-info">
      <h4 className="sidebar-anime-title">{anime.titulo}</h4>
      <p>Score: {anime.ranking}</p>
    </div>
  </li>
))}
            </ul>
            <div className="sidebar-footer">
    View all →
</div>
          </div>

          {/* Bloque 2: Top Upcoming (Abajo del anterior) */}
          <div className="sidebar-section" style={{ marginTop: '30px' }}>
            <h3 className="sidebar-title">Top Upcoming Anime</h3>
            <ul className="top-anime-list">
              {topUpcoming.map((anime, index) => (
                <li key={anime.id} className="top-anime-item">
                  <span className="top-index">{index + 1}</span>
                  <img src={anime.imagen} alt={anime.titulo} className="top-mini-img" />
                  <div className="top-info">
                    <h4>{anime.titulo}</h4>
                    <p>Eps: {anime.episodios}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="sidebar-footer">
    View all →
</div>
          </div>

          <div className="sidebar-section" style={{ marginTop: '30px' }}>
            <h3 className="sidebar-title">Top Popular Anime</h3>
            <ul className="top-anime-list">
              {topPopular.map((anime, index) => (
                <li key={anime.id} className="top-anime-item">
                  <span className="top-index">{index + 1}</span>
                  <img src={anime.imagen} alt={anime.titulo} className="top-mini-img" />
                  <div className="top-info">
                    <h4>{anime.titulo}</h4>
                    <p>Eps: {anime.episodios}</p>
                  </div>
                </li>
              ))}
            </ul>
            <div className="sidebar-footer">
    View all →
</div>
          </div>

        </aside>

      </div>
    </div>
  )
}