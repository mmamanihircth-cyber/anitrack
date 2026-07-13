import React from 'react'
import { Routes, Route, Navigate } from 'react-router'
import { LoginScreen } from './Screens/LoginScreen/LoginScreen'
import { RegisterScreen } from './Screens/RegisterScreen/RegisterScreen'
import { HomeScreen } from './Screens/HomeScreen/HomeScreen'
import { ResetPasswordScreen } from './Screens/ResetPasswordScreen/ResetPasswordScreen'
import { AuthContextProvider } from './context/AuthContext'
import AlreadyAuthMiddleware from './middlewares/AlreadyAuthMiddleware'
import AuthMiddleware from './middlewares/AuthMiddleware'
import { AnimeDetailScreen } from './Screens/AnimeDetailScreen/AnimeDetailScreen'
import { ProfileScreen } from './Screens/ProfileScreen/ProfileScreen'
import { WorkspaceFeedScreen } from './Screens/WorkspaceFeedScreen/WorkspaceFeedScreen'
import './App.css'

const App = () => {
  return (
    <AuthContextProvider>
      <Routes>
        {/* 🌍 RUTA RAÍZ: Si entran a http://localhost:5173/ los manda al Home */}
        <Route path='/' element={<Navigate to='/home' replace />} />

        {/* 🌍 RUTAS PÚBLICAS: Libres para cualquiera */}
        <Route path='/home' element={<HomeScreen />} />
        <Route path='/anime/:id' element={<AnimeDetailScreen />} />

        {/* 🔒 RUTAS PARA INVITADOS: Protegidas por el middleware separado */}
        <Route element={<AlreadyAuthMiddleware />}>
          <Route path='/login' element={<LoginScreen />} />
          <Route path='/register' element={<RegisterScreen />} />
          <Route path='/reset-password' element={<ResetPasswordScreen />} />
        </Route>

        {/* 🔒 RUTAS PROTEGIDAS: Solo logueados */}
        <Route element={<AuthMiddleware />}>
          <Route path='/profile' element={<ProfileScreen />} />
          <Route path="/workspace/:workspace_id" element={<WorkspaceFeedScreen />} />
        </Route>
        
        {/* 🔄 COMODÍN: Cualquier otra cosa rota vuelve al home */}
        <Route path='/*' element={<Navigate to='/home' replace />} />
      </Routes>
    </AuthContextProvider>
  )
}

export default App