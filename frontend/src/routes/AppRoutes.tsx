// frontend/src/routes/AppRoutes.tsx
import React from 'react';
import { Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';

// Pages
import Home from '../pages/Home';
import Login from '../pages/Login';
import Register from '../pages/Register';
import MyProfile from '../pages/MyProfile';
import Forum from '../pages/Forum';
import Courses from '../pages/Courses';
import Users from '../pages/Users';
// Adicione esta importação
import PostDetail from '../pages/PostDetail';
// Layout
import Layout from '../components/layout/Layout';
import UserProfile from '../pages/UserProfile';
import Jobs from '../pages/Jobs';
import Progress from '../pages/Progress';
import Chat from '../pages/Chat';


// Componente para rotas protegidas
interface ProtectedRouteProps {
  children: React.ReactNode;
}

const ProtectedRoute: React.FC<ProtectedRouteProps> = ({ children }) => {
  const { user, loading } = useAuth();
  const location = useLocation();

  if (loading) {
    return (
      <Layout>
        <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '50vh' }}>
          <div>Carregando...</div>
        </div>
      </Layout>
    );
  }

  if (!user) {
    // ✅ Salva a localização atual para redirecionar de volta após login
    return <Navigate to="/login" state={{ from: location }} replace />;
  }

  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <Routes>
      {/* Rotas públicas */}
      <Route path="/login" element={<Login />} />
      <Route path="/registrar" element={<Register />} />

      <Route path="/post/:id" element={
        <ProtectedRoute>
          <Layout>
            <PostDetail />
          </Layout>
        </ProtectedRoute>
      } />


      {/* ✅ CURSOS AGORA É PÚBLICO - qualquer um pode acessar */}
      <Route path="/cursos" element={
        <Layout>
          <Courses />
        </Layout>
      } />

      {/* ✅ HOME TAMBÉM É PÚBLICO */}
      <Route path="/" element={
        <Layout>
          <Home />
        </Layout>
      } />

      {/* Rotas protegidas - requerem autenticação */}
      <Route path="/meu-perfil" element={
        <ProtectedRoute>
          <Layout>
            <MyProfile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/forum" element={
        <ProtectedRoute>
          <Layout>
            <Forum />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/usuarios" element={
        <ProtectedRoute>
          <Layout>
            <Users />
          </Layout>
        </ProtectedRoute>
      } />
      <Route path="/perfil/:id" element={
        <ProtectedRoute>
          <Layout>
            <UserProfile />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/chat/:userId" element={
        <ProtectedRoute>
          <Layout>
            <div>Chat - Em desenvolvimento</div>
          </Layout>
        </ProtectedRoute>
      } />


      <Route path="/progresso" element={
        <ProtectedRoute>
          <Layout>
            <Progress />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/chat" element={
        <ProtectedRoute>
          <Layout>
            <Chat />
          </Layout>
        </ProtectedRoute>
      } />

      <Route path="/vagas" element={
        <ProtectedRoute>
          <Layout>
            <Jobs />
          </Layout>
        </ProtectedRoute>
      } />
      {/* Rota fallback */}
      <Route path="*" element={<Navigate to="/" />} />
    </Routes>
  );
};

export default AppRoutes;