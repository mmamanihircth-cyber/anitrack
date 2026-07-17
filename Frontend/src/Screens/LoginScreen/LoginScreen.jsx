import { useContext, React, useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router';
import useForm from '../../hooks/useForm';
import { login } from '../../services/authService';
import useRequest from '../../hooks/useRequest';
import { AuthContext } from '../../context/AuthContext';
import './LoginScreen.css';
import { HiEyeSlash } from "react-icons/hi2";
import { RiEyeOffLine } from "react-icons/ri";

export const LoginScreen = () => {
    const { login: syncroLogin } = useContext(AuthContext);
    const navigate = useNavigate();

    const [showPassword, setShowPassword] = useState(false);
    const {
        sendRequest: sendRequestLogin,
        loading: loginRequestLoading,
        error: loginRequestError,
        response: loginRequestResponse
    } = useRequest();
    const initial_form_state = {
        email: '',
        password: ''
    };
    function onSubmit(formData) {
        sendRequestLogin(() =>
            login(formData.email, formData.password)
        );
    }
    useEffect(() => {
        if (loginRequestResponse?.ok) {
            syncroLogin(loginRequestResponse.data.access_token);
            navigate('/home');
        }
    }, [loginRequestResponse, navigate, syncroLogin]);
    const {
        formState,
        handleChange,
        handleSubmit
    } = useForm(initial_form_state, onSubmit);
    return (
        <div className="login-page-container">
            <div className="background-overlay"></div>
            <Link to="/home" className="back-home-btn">
                ← Home
            </Link>
            <div className="login-card">
                <div className="login-logo">
                    <h1>
                        Ani<span>Track</span>
                    </h1>
                    <p>
                        Track your anime journey.
                    </p>
                </div>
                <form
                    className="login-form"
                    onSubmit={handleSubmit}
                >
                    {loginRequestError && !loginRequestLoading && (
                        <div className="login-error-msg">
                            {loginRequestError}
                        </div>
                    )}
                    <div className="form-group">
                        <label htmlFor="email">
                            Username or Email
                        </label>
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
                    <div className="form-group">
                        <label htmlFor="password">
                            Password
                        </label>
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
                                onClick={() =>
                                    setShowPassword(!showPassword)
                                }
                            >
                                {showPassword ? <RiEyeOffLine /> : <HiEyeSlash />}
                            </button>
                        </div>
                    </div>
                    <button
                        className="btn-login"
                        type="submit"
                        disabled={
                            loginRequestLoading ||
                            loginRequestResponse?.ok
                        }
                    >
                        {loginRequestLoading
                            ? 'Logging in...'
                            : 'Login'}
                    </button>
                    <div className="login-links">
                        <button
                            type="button"
                            className="text-link"
                        >
                            Forgot username?
                        </button>
                        <button
                            type="button"
                            className="text-link"
                        >
                            Forgot password?
                        </button>
                    </div>
                </form>
                <div className="login-footer">
                    <span>
                        Don't have an account?
                    </span>
                    <button
                        className="signup-btn"
                        onClick={() => navigate('/register')}
                    >
                        Create Account
                    </button>
                </div>
            </div>
        </div>
    );
};