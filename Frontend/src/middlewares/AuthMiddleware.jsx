import React, { useContext } from "react";
import { AuthContext } from "../context/AuthContext";
import { Outlet, Navigate } from "react-router"; 

function AuthMiddleware() {
    const { isLogged } = useContext(AuthContext);

    if (isLogged) {
        return <Outlet />;
    } else {
        return <Navigate to='/login' replace />;
    }
}

export default AuthMiddleware;