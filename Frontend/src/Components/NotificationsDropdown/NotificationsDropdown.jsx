import React, { useEffect, useState, useContext, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../../context/AuthContext';
import './NotificationsDropdown.css';

export function NotificationsDropdown() {
  const [notifications, setNotifications] = useState([]);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  
  const { isLogged } = useContext(AuthContext);
  const navigate = useNavigate();
  const dropdownRef = useRef(null);
  const token = localStorage.getItem('auth_token');

  // 1. Traer notificaciones del backend
  const fetchNotifications = async () => {
    if (!token) return;
    try {
      setLoading(true);
      const response = await fetch('https://anitrack-back.vercel.app/api/notifications', { // 👈 Tu backend local
  headers: {
    'Authorization': `Bearer ${token}`
  }
});
      /* const response = await fetch('https://anitrack-back.vercel.app/api/notification', {
        headers: {
          'Authorization': `Bearer ${token}`
        }
      }); */
      const result = await response.json();
      if (result.ok) {
        const list = result.data.notifications || result.data || [];
        setNotifications(list);
      }
    } catch (err) {
      console.error("Error cargando notificaciones:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isLogged) {
      fetchNotifications();
      // Opcional: Podés meter un setInterval cada 30s para que busque notificaciones nuevas en segundo plano
    }
  }, [isLogged]);

  // Cerrar el menú si hacés clic afuera del componente
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // Dentro de NotificationsDropdown.jsx
const handleNotificationClick = async (notif) => {
  setIsOpen(false); 
  try {
    // 🟢 CORREGIDO: Agregamos "/read" al final de la URL para que coincida con tu router
    await fetch(`https://anitrack-back.vercel.app/api/notifications/${notif._id}/read`, {
      method: 'PUT',
      headers: {
        'Authorization': `Bearer ${token}`
      }
    });

    // Actualizar estado local inmediatamente
    setNotifications(prev =>
      prev.map(n => n._id === notif._id ? { ...n, leido: true } : n)
    );

    // Redirigir al destino (por ejemplo, al workspace correspondiente)
    if (notif.redirection_url) {
      navigate(notif.redirection_url);
    } else if (notif.fk_workspace_id) {
      navigate(`/workspace/${notif.fk_workspace_id}`);
    }
  } catch (err) {
    console.error("Error al procesar la notificación:", err);
  }
};

  const getIcon = (tipo) => {
    switch (tipo?.toUpperCase()) {
      case 'LIKE': return '❤️';
      case 'REPLY': return '💬';
      case 'COMMUNITY': return '🌍';
      default: return '🔔';
    }
  };

  const unreadCount = notifications.filter(n => !n.leido).length;

  return (
    <div className="notifications-dropdown-container" ref={dropdownRef}>
      {/* Botón de la Campana */}
      <button className="bell-button" onClick={() => setIsOpen(!isOpen)}>
        <span className="bell-icon">🔔</span>
        {unreadCount > 0 && <span className="bell-badge">{unreadCount}</span>}
      </button>

      {/* Menú Desplegable */}
      {isOpen && (
        <div className="notifications-dropdown">
          <div className="dropdown-header">
            <h3>Notificaciones</h3>
            {unreadCount > 0 && <span className="unread-text">{unreadCount} pendientes</span>}
          </div>

          <div className="dropdown-body">
            {loading ? (
              <p className="state-text">Cargando...</p>
            ) : notifications.length === 0 ? (
              <p className="state-text">Sin notificaciones por aquí. ¡Todo al día! 😎</p>
            ) : (
              <div className="notifications-scroll">
                {notifications.map((notif) => (
                  <div
  key={notif._id}
  className={`dropdown-item ${notif.leido ? 'read' : 'unread'}`}
  onClick={() => handleNotificationClick(notif)}
>
  <span className="item-icon">{getIcon(notif.tipo)}</span>
  <div className="item-content">
    <p className="item-message">{notif.mensaje}</p>
    <span className="item-time">
      {/* 🟢 CORREGIDO: Usamos "notif.fecha" que es el campo real de tu MongoDB */}
      {new Date(notif.fecha).toLocaleDateString(undefined, {
        hour: '2-digit',
        minute: '2-digit'
      })}
    </span>
  </div>
  {!notif.leido && <span className="item-unread-dot" />}
</div>
                ))}
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}