import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from './context/AuthContext';
import Login from './pages/Login';
import Register from './pages/Register';
import AppLayout from "./components/AppLayout";
import Task from "./components/Task";
import { Toaster } from "react-hot-toast";
import { AuthProvider } from "./context/AuthContext";
import { ProjectProvider } from "./context/ProjectContext";

const PrivateRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return user ? children : <Navigate to="/login" />;
};

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth();
  
  if (loading) {
    return <div>Loading...</div>;
  }
  
  return !user ? children : <Navigate to="/" />;
};

function App() {
  return (
    <AuthProvider>
      <ProjectProvider>
        <Toaster position="top-right" gutter={8} />
        <Routes>
          <Route path="/login" element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          } />
          <Route path="/register" element={
            <PublicRoute>
              <Register />
            </PublicRoute>
          } />
          <Route path="/" element={
            <PrivateRoute>
              <AppLayout />
            </PrivateRoute>
          }>
            <Route
              index
              element={
                <div className="flex flex-col items-center w-full pt-10">
                  <img src="./image/welcome.svg" className="w-5/12" alt="" />
                  <h1 className="text-lg text-gray-600">Select or create new project</h1>
                </div>
              }
            />
            <Route path=":projectId" element={<Task />} />
          </Route>
        </Routes>
      </ProjectProvider>
    </AuthProvider>
  );
}

export default App;
