import React, { Suspense, lazy } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { PrivateRoute } from './components/PrivateRoute';
import { LoadingScreen } from './components/LoadingScreen';
import { Clientes } from './components/Clientes';

// Carregamento dinâmico das páginas de auth
const Login = lazy(() => import('./pages/Login'));
const Cadastro = lazy(() => import('./pages/Cadastro'));

// Função para checar se o usuário possui token ativo
const estaAutenticado = () => {
  return Boolean(localStorage.getItem('token') || localStorage.getItem('@CRM:token'));
};

export const App: React.FC = () => {
  const autenticado = estaAutenticado();

  return (
    <BrowserRouter>
      <Suspense fallback={<LoadingScreen />}>
        <Routes>
          {/* Redirecionamento inteligente da raiz */}
          <Route 
            path="/" 
            element={<Navigate to={autenticado ? "/clientes" : "/login"} replace />} 
          />

          {/* Rota pública de login */}
          <Route path="/login" element={<Login />} />

          {/* Rota pública de cadastro */}
          <Route path="/cadastro" element={<Cadastro />} />

          {/* Rota protegida renderizando a tela REAL de Clientes */}
          <Route
            path="/clientes"
            element={
              <PrivateRoute>
                <Clientes />
              </PrivateRoute>
            }
          />

          {/* Qualquer outra URL redireciona com base no status do usuário */}
          <Route 
            path="*" 
            element={<Navigate to={autenticado ? "/clientes" : "/login"} replace />} 
          />
        </Routes>
      </Suspense>
    </BrowserRouter>
  );
};

export default App;