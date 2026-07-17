import { useContext, useEffect, useState } from "react";
import { AuthContext } from "../../context/AuthContext";
import { useNavigate } from "react-router";
import { getFavorites, getMyList } from "../../services/interaction.service";
import { MIS_ANIMES } from "../../Data/animes.js"; 
import AvatarSelector from "../../Components/AvatarSelector/AvatarSelector.jsx";
import { updateProfile } from "../../services/authService.js";
import "./ProfileScreen.css";

const ProfileScreen = () => {
    const [myList, setMyList] = useState([]);
    const navigate = useNavigate();
    const [favorites, setFavorites] = useState([]);
    const { userData, logout } = useContext(AuthContext);

    const [selectedAvatar, setSelectedAvatar] = useState("");
    const [editingProfile, setEditingProfile] = useState(false);

    useEffect(() => {
        async function loadFavorites() {
            try {
                const response = await getFavorites();
setFavorites(response.data.favoritos || [])

const responseList = await getMyList();
setMyList(responseList.data?.miLista || []);

            } catch (error) {
                console.error("Error al cargar favoritos y lista en Profile:", error);
            }
        }

        loadFavorites();
    }, []);

    useEffect(() => {
    // 🟢 Cambiamos a userData.imagen_url y sumamos una validación para evitar el string vacío
    if (userData && userData.imagen_url && userData.imagen_url.trim() !== "") {
        setSelectedAvatar(userData.imagen_url);
    } else if (userData) {
        // Fallback: Si el usuario existe pero no tiene foto, le asignamos la primera por defecto
        setSelectedAvatar("/Avatars/avatar4.png"); 
        // 💡 NOTA: Podés importar AVAILABLE_AVATARS[0].url y ponerlo acá como hicimos antes
    }
}, [userData]);

    const isListValid = Array.isArray(myList);
    const watching = myList.filter(item => item.estado === "watching").length;
    const completed = myList.filter(item => item.estado === "completed").length;
    const plan = myList.filter(item => item.estado === "plan").length;
    const paused = myList.filter(item => item.estado === "paused").length;
    const dropped = myList.filter(item => item.estado === "dropped").length;

    const handleSaveProfile = async () => {

    try{

        await updateProfile(selectedAvatar);

        setEditingProfile(false);

    }

    catch(error){

        console.error(error);

    }

}

    return (
        <main className="profile-page">

            <section className="profile-container">

                <div className="profile-header">
        <button 
            className="profile-back-btn"
            onClick={() => navigate('/home')}
        >
            ← Home
        </button>

        <h1 className="profile-title">
            Mi Perfil
        </h1>
    </div>

                <div className="profile-user">

    <div className="profile-user-top">

        <img
    src={selectedAvatar && selectedAvatar.trim() !== "" ? selectedAvatar : "/Avatars/avatar4.png"}
    alt={userData?.nombre || "Usuario"}
    className="profile-avatar"
/>

        <div>

            <h2>{userData?.nombre}</h2>

            <p>{userData?.email}</p>

        </div>

    </div>

    <button
        className="edit-profile-btn"
        onClick={() => setEditingProfile(!editingProfile)}
    >
        {editingProfile ? "Cancelar" : "Editar Perfil"}
    </button>

</div>

{
editingProfile && (

<div className="profile-edit-card">

    <h3>Cambiar personaje</h3>

    <AvatarSelector
        selectedAvatar={selectedAvatar}
        onChange={setSelectedAvatar}
    />

    <button
    className="save-profile-btn"
    onClick={handleSaveProfile}>
    Guardar Cambios
    </button>

</div>

)
}

                <div className="profile-stats">

    <div className="stat-card">
        <h3>{favorites.length}</h3>
        <span>Favoritos</span>
    </div>

    <div className="stat-card">
        <h3>{watching}</h3>
        <span>Watching</span>
    </div>

    <div className="stat-card">
        <h3>{completed}</h3>
        <span>Completados</span>
    </div>

    <div className="stat-card">
        <h3>{plan}</h3>
        <span>Plan to Watch</span>
    </div>

    <div className="stat-card">
        <h3>{paused}</h3>
        <span>On Hold</span>
    </div>

    <div className="stat-card">
        <h3>{dropped}</h3>
        <span>Dropped</span>
    </div>

</div>

<div className="profile-favorites">
    <h2>Mis Favoritos</h2>
    
    {/* Contenedor padre directo para que la grilla funcione impecable */}
    <div className={favorites.length > 0 ? "favorites-grid" : ""}>
        {
            favorites.length === 0
            ? <p>No tienes animes favoritos todavía.</p>
            : favorites.map(favorite => {
    // 🔍 Buscamos en tu archivo de constantes el anime que coincida con el ID de la base de datos
    const animeData = MIS_ANIMES.find(anime => anime.id === favorite.anime_id);

    // 🖼️ Si lo encuentra, usamos su imagen real. Si no (por las dudas), dejamos un fondo oscuro.
    const imageUrl = animeData ? animeData.imagen : "";
    // 📝 Si lo encuentra usás el título oficial, si no, el ID de respaldo
    const titleToShow = animeData ? animeData.titulo : favorite.anime_id;

    return (
        <div 
            key={favorite._id} 
            className="favorite-card"
            style={{
    backgroundImage: imageUrl 
        ? `linear-gradient(to top, rgba(15, 23, 42, 1) 0%, rgba(15, 23, 42, 0.8) 25%, rgba(15, 23, 42, 0) 80%), url(${imageUrl})`
        : 'none'
}}
        >
            <span className="favorite-card-title">
                {titleToShow}
            </span>
        </div>
    );
})
        }
    </div>
</div>

<div className="profile-info-card">

    <h2>
        Información
    </h2>


    <div className="info-row">

        <span>Nombre</span>

        <strong>
            {userData?.nombre}
        </strong>

    </div>


    <div className="info-row">

        <span>Email</span>

        <strong>
            {userData?.email}
        </strong>

    </div>


    <div className="info-row">

        <span>Fecha de creación</span>

        <strong>
  {userData?.fecha_creacion 
    ? new Date(userData.fecha_creacion).toLocaleDateString('es-AR', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric'
      })
    : 'Cargando...'}
</strong>

    </div>


    <div className="info-row">

        <span>ID Usuario</span>

        <strong>
            {userData?.id}
        </strong>

    </div>


</div>

<button 
    className="profile-logout-btn"
    onClick={logout}
>
    Cerrar sesión
</button>

            </section>

        </main>
    );
};

export { ProfileScreen };