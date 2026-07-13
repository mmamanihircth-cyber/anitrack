import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router'; 
import useForm from '../../hooks/useForm';
import useRequest from '../../hooks/useRequest';
import { register } from '../../services/authService'; 
import { AVAILABLE_AVATARS } from '../../Data/avatars';
import '../LoginScreen/LoginScreen.css'; 

export const RegisterScreen = () => {
    const navigate = useNavigate();
    const [showPassword, setShowPassword] = useState(false);
    const [selectedAvatar, setSelectedAvatar] = useState(AVAILABLE_AVATARS[0].url);
    const [isOpen, setIsOpen] = useState(false);

    const {
        sendRequest: sendRequestRegister,
        loading: registerLoading,
        error: registerError,
        box_response: registerResponse
    } = useRequest();

    // 🌟 Sincronizado con tu backend: desestructurás { name, email, password }
    const initial_form_state = {
        name: '',
        email: '',
        password: ''
    };

    function onSubmit(formData) {
    sendRequestRegister(() =>
        register(formData.name, formData.email, formData.password, selectedAvatar)
        );
}

    useEffect(() => {
        if (registerResponse?.ok) {
            navigate('/login'); 
        }
    }, [registerResponse, navigate]);

    const { formState, handleChange, handleSubmit } = useForm(initial_form_state, onSubmit);
    const currentAvatarObj = AVAILABLE_AVATARS.find(a => a.url === selectedAvatar) || AVAILABLE_AVATARS[0];

    return (
        <div className="login-page-container">
            <Link to="/home" className="back-home-btn">
                ← Home
            </Link>

            <div className="login-card">
                <div className="login-logo">
                    <h1>
                        Ani<span>Track</span>
                    </h1>
                    <p>Create your account to start tracking</p>
                </div>

                <form className="login-form" onSubmit={handleSubmit}>
                    {registerError && !registerLoading && (
                        <div className="login-error-msg">
                            {registerError}
                        </div>
                    )}

                    {/* Full Name */}
                    <div className="form-group">
                        <label htmlFor="name">Full Name</label>
                        <input
                            id="name"
                            name="name"
                            type="text"
                            className="login-input"
                            value={formState.name}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Email */}
                    <div className="form-group">
                        <label htmlFor="email">Email Address</label>
                        <input
                            id="email"
                            name="email"
                            type="email"
                            className="login-input"
                            value={formState.email}
                            onChange={handleChange}
                            required
                        />
                    </div>

                    {/* Password */}
                    <div className="form-group">
                        <label htmlFor="password">Password</label>
                        <div className="password-wrapper">
                            <input
                                id="password"
                                name="password"
                                type={showPassword ? 'text' : 'password'}
                                className="login-input"
                                value={formState.password}
                                onChange={handleChange}
                                required
                            />
                            <button
                                type="button"
                                className="toggle-password"
                                onClick={() => setShowPassword(!showPassword)}
                            >
                                {showPassword ? '🙈' : '👁'}
                            </button>
                        </div>
                    </div>

                    <div className="avatar-form-group">
    <label className="avatar-label">Choose Profile Character</label>
    
    {/* Botón del Selector */}
    <div className="avatar-dropdown-btn" onClick={() => setIsOpen(!isOpen)}>
        <div className="avatar-btn-left">
            <img 
                src={currentAvatarObj.url} 
                alt={currentAvatarObj.name} 
                className="avatar-current-img"
            />
            <span className="avatar-current-name">{currentAvatarObj.name}</span>
        </div>
        <span className={`avatar-arrow ${isOpen ? 'open' : ''}`}>
            ▼
        </span>
    </div>

    {/* Menú Desplegable Absoluto */}
    {isOpen && (
        <div className="avatar-dropdown-menu">
            {AVAILABLE_AVATARS.map((avatar) => {
                const isSelected = selectedAvatar === avatar.url;
                return (
                    <div 
                        key={avatar.id}
                        onClick={() => {
                            setSelectedAvatar(avatar.url);
                            setIsOpen(false);
                        }}
                        className={`avatar-option-item ${isSelected ? 'selected' : ''}`}
                    >
                        <img 
                            src={avatar.url} 
                            alt={avatar.name} 
                            className="avatar-option-img"
                        />
                        <span className="avatar-option-name">
                            {avatar.name}
                        </span>
                    </div>
                );
            })}
        </div>
    )}
</div>

                    <button
                        className="btn-register"
                        type="submit"
                        disabled={registerLoading || registerResponse?.ok}
                    >
                        {registerLoading ? 'Creating account...' : 'Register'}
                    </button>
                </form>

                <div className="login-footer">
                    <span>Already have an account?</span>
                    <button className="signup-btn" onClick={() => navigate('/login')}>
                        Sign In
                    </button>
                </div>
            </div>
        </div>
    );
};
