import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Login from './pages/Login'
import Register from './pages/Register'
import Dashboard from './pages/Dashboard'
import CreateGroup from './pages/CreateGroup'
import GroupDetail from './pages/GroupDetail'
import Profile from './pages/Profile'

const ProtectedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e12' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
        <div className="font-display" style={{ fontSize: 20, color: 'var(--accent)' }}>Split Sensei</div>
        <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: 14, marginTop: 8 }}>Loading...</div>
      </div>
    </div>
  )
  return user ? children : <Navigate to="/login" />
}

export default function App() {
  const { user, loading } = useAuth()
  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#0e0e12' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 40, marginBottom: 12 }}>🧭</div>
        <div className="font-display" style={{ fontSize: 20, color: 'var(--accent)' }}>Split Sensei</div>
        <div style={{ color: 'rgba(245,240,232,0.4)', fontSize: 14, marginTop: 8 }}>Loading...</div>
      </div>
    </div>
  )

  return (
    <Routes>
      <Route path="/login" element={user ? <Navigate to="/dashboard" /> : <Login />} />
      <Route path="/register" element={user ? <Navigate to="/dashboard" /> : <Register />} />
      <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
      <Route path="/groups/new" element={<ProtectedRoute><CreateGroup /></ProtectedRoute>} />
      <Route path="/groups/:id" element={<ProtectedRoute><GroupDetail /></ProtectedRoute>} />
      <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      <Route path="*" element={<Navigate to={user ? "/dashboard" : "/login"} />} />
    </Routes>
  )
}