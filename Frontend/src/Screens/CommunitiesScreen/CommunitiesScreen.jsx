import React, { useEffect, useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './CommunitiesScreen.css'

export function CommunitiesScreen() {
  const [activeTab, setActiveTab] = useState('my-communities'); // 'my-communities' | 'explore' | 'create'
  
  // Estados para "Mis Comunidades"
  const [myWorkspaces, setMyWorkspaces] = useState([]);
  const [loadingMy, setLoadingMy] = useState(true);

  // Estados para "Explorar"
  const [allWorkspaces, setAllWorkspaces] = useState([]);
  const [loadingExplore, setLoadingExplore] = useState(false);

  // Estado para el formulario de creación
  const [formData, setFormData] = useState({ nombre: '', descripcion: '' });
  const [creating, setCreating] = useState(false);

  const [error, setError] = useState(null);
  const navigate = useNavigate();
  const { isLogged } = useContext(AuthContext);

  const token = localStorage.getItem('auth_token');

  // 1. Cargar "Mis Comunidades"
  const fetchMyWorkspaces = async () => {
    try {
      setLoadingMy(true);
      const response = await fetch('https://anitrack-back.vercel.app/api/workspace', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) { navigate('/login'); return; }
      const result = await response.json();
      if (result.ok) {
        setMyWorkspaces(result.data.workspaces || []);
      }
    } catch (err) {
      console.error(err);
      setError('Error al conectar con el servidor.');
    } finally {
      setLoadingMy(false);
    }
  };

  // 2. Cargar todas las comunidades públicas ("Explorar")
  const fetchExploreWorkspaces = async () => {
    try {
      setLoadingExplore(true);
      const response = await fetch('https://anitrack-back.vercel.app/api/workspace/all', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const result = await response.json();
      if (result.ok) {
        // Guardamos todas las comunidades de la base de datos
        setAllWorkspaces(result.data.workspaces || []);
      }
    } catch (err) {
      console.error(err);
    } finally {
      setLoadingExplore(false);
    }
  };

  useEffect(() => {
    if (!isLogged) { navigate('/login'); return; }
    fetchMyWorkspaces();
  }, [navigate, isLogged]);

  // Ejecutar carga según pestaña seleccionada
  useEffect(() => {
    if (activeTab === 'my-communities') fetchMyWorkspaces();
    if (activeTab === 'explore') fetchExploreWorkspaces();
  }, [activeTab]);

  // 3. Manejar creación de comunidad
  const handleInputChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleCreateWorkspace = async (e) => {
    e.preventDefault();
    if (!formData.nombre.trim()) return;

    try {
      setCreating(true);
      const response = await fetch('https://anitrack-back.vercel.app/api/workspace', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(formData)
      });
      const result = await response.json();
      if (result.ok) {
        setFormData({ nombre: '', descripcion: '' });
        setActiveTab('my-communities'); // Redirige a mis comunidades
      } else {
        alert(result.message);
      }
    } catch (err) {
      console.error(err);
      alert('Error de conexión al crear comunidad.');
    } finally {
      setCreating(false);
    }
  };

  return (
    <div className="communities-container">
      <section className="communities-hero">

    <button
        className="btn-back-home"
        onClick={() => navigate("/home")}
    >
        ← Home
    </button>

    <div className="hero-overlay">

        <span className="hero-badge">
            🌎 Anime Social
        </span>

        <h1>Comunidades de Anime</h1>

        <p>
            Encuentra personas con tus mismos gustos,
            comparte teorías y crea nuevas amistades.
        </p>

    </div>

</section>

      {/* 🟢 BARRA DE PESTAÑAS (TABS) */}
      <nav className="communities-tabs">
        <button 
          className={`tab-btn ${activeTab === 'my-communities' ? 'active' : ''}`}
          onClick={() => setActiveTab('my-communities')}
        >
          Mis Comunidades ({myWorkspaces.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'explore' ? 'active' : ''}`}
          onClick={() => setActiveTab('explore')}
        >
          Explorar
        </button>
        <button 
          className={`tab-btn ${activeTab === 'create' ? 'active' : ''}`}
          onClick={() => setActiveTab('create')}
        >
          ＋ Crear Comunidad
        </button>
      </nav>

      {/* 🟢 CONTENIDO SEGÚN LA PESTAÑA ACTIVA */}
      <main className="communities-content">
        
        {/* PESTAÑA: MIS COMUNIDADES */}
        {activeTab === 'my-communities' && (
          <div className="tab-pane">
            {loadingMy ? (
              <p>Cargando tus comunidades...</p>
            ) : myWorkspaces.length === 0 ? (
              <div className="empty-state">
                <p>Aún no perteneces a ninguna comunidad.</p>
                <button onClick={() => setActiveTab('explore')}>Explorar comunidades disponibles</button>
              </div>
            ) : (
              <div className="communities-grid">
                {myWorkspaces.map((ws) => (
                  <div 
                    key={ws.workspace_id} 
                    className="community-card"
                    onClick={() => navigate(`/workspace/${ws.workspace_id}`)}
                  >
                    <div className="card-badge">Miembro</div>
                    <div className="community-icon">💬</div>
                    <h3>{ws.workspace_nombre}</h3>
                    <p>{ws.workspace_descripcion || 'Sin descripción.'}</p>
                    <button className="enter-btn">Entrar al Portal →</button>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: EXPLORAR COMUNIDADES */}
        {activeTab === 'explore' && (
          <div className="tab-pane">
            {loadingExplore ? (
              <p>Buscando mundos de anime...</p>
            ) : allWorkspaces.length === 0 ? (
              <p>No hay comunidades creadas todavía.</p>
            ) : (
              <div className="communities-grid">
                {allWorkspaces.map((ws) => {
                  // Verificamos si ya somos miembros para poner un estilo visual distintivo
                  const isMember = myWorkspaces.some(myWs => myWs.workspace_id === ws._id);
                  return (
                    <div 
                      key={ws._id} 
                      className={`community-card ${isMember ? 'joined' : ''}`}
                      onClick={() => navigate(`/workspace/${ws._id}`)}
                    >
                      {isMember && <div className="card-badge">Unido</div>}
                      <h3>{ws.nombre}</h3>
                      <p>{ws.descripcion || 'Sin descripción.'}</p>
                      <span className="enter-portal">
                        {isMember ? 'Ver portal →' : 'Unirse y ver portal →'}
                      </span>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

        {/* PESTAÑA: CREAR COMUNIDAD */}
        {activeTab === 'create' && (
          <div className="tab-pane creation-pane">

    <div className="create-community-card">

        <div className="create-header">

            <span className="create-icon">🏰</span>

            <h2>Crear Nueva Comunidad</h2>

            <p>
                Reúne fans de tu anime favorito, comparte teorías,
                noticias y debates con otros miembros.
            </p>

        </div>

        <form
            onSubmit={handleCreateWorkspace}
            className="create-community-form"
        >

            <div className="form-group">

                <label>Nombre de la Comunidad</label>

                <input
                    type="text"
                    name="nombre"
                    placeholder="Ej: Comunidad de Shingeki no Kyojin"
                    value={formData.nombre}
                    onChange={handleInputChange}
                    required
                />

            </div>

            <div className="form-group">

                <label>Descripción</label>

                <textarea
                    name="descripcion"
                    placeholder="¿Qué se hablará aquí?"
                    value={formData.descripcion}
                    onChange={handleInputChange}
                    rows={5}
                />

            </div>

            <button
                type="submit"
                disabled={creating}
                className="btn-submit-create"
            >
                {creating
                    ? "Creando Comunidad..."
                    : "🚀 Crear Comunidad"}
            </button>

        </form>

    </div>

</div>
        )}

      </main>
    </div>
  );
}