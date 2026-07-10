import { useContext } from "react";
import { AuthContext } from "../../context/AuthContext";
import "./ProfileScreen.css";
import { useNavigate } from "react-router";

const ProfileScreen = () => {

    const navigate = useNavigate();

    const { userData, logout } = useContext(AuthContext);

    return (
        <main className="profile-page">

            <section className="profile-container">

                <button 
    className="profile-back-btn"
    onClick={() => navigate('/home')}
>
    ← Home
</button>

                <h1 className="profile-title">
                    Mi Perfil
                </h1>

                <div className="profile-user">

                    <h2>{userData?.nombre}</h2>

                    <p>{userData?.email}</p>

                </div>

                <div className="profile-stats">

    <div className="stat-card">
        <h3>0</h3>
        <span>Favoritos</span>
    </div>

    <div className="stat-card">
        <h3>0</h3>
        <span>Watching</span>
    </div>

    <div className="stat-card">
        <h3>0</h3>
        <span>Completados</span>
    </div>

    <div className="stat-card">
        <h3>0</h3>
        <span>Reviews</span>
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
            {userData?.fecha_creacion}
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