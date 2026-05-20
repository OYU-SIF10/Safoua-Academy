import { createContext, useContext, useState, useEffect } from 'react';
import { getMe } from '../services/api';
import { ROLES } from '../constants';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [token, setToken] = useState(localStorage.getItem('token'));
  const [loading, setLoading] = useState(true);

  // ─── Charger l'utilisateur au démarrage ──────────────────────────────────
  useEffect(() => {
    const initAuth = async () => {
      const savedToken = localStorage.getItem('token');
      if (savedToken) {
        try {
          const res = await getMe();
          setUser(res.data.data);
        } catch {
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          setToken(null);
        }
      }
      setLoading(false);
    };
    initAuth();
  }, []);

  // ─── Connexion ────────────────────────────────────────────────────────────
  const loginUser = (userData, userToken) => {
    localStorage.setItem('token', userToken);
    localStorage.setItem('user', JSON.stringify(userData));
    setToken(userToken);
    setUser(userData);
  };

  // ─── Déconnexion ──────────────────────────────────────────────────────────
  const logoutUser = () => {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    setToken(null);
    setUser(null);
  };

  // ─── Vérification des rôles ───────────────────────────────────────────────
  const isEtudiant = user?.role === ROLES.STUDENT;
  const isEnseignant = user?.role === ROLES.TEACHER;
  const isAdmin = user?.role === ROLES.ADMIN;
  const isAuthenticated = !!token && !!user;

  return (
    <AuthContext.Provider
      value={{
        user,
        token,
        loading,
        loginUser,
        logoutUser,
        isEtudiant,
        isEnseignant,
        isAdmin,
        isAuthenticated,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// ─── Hook personnalisé ────────────────────────────────────────────────────
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé dans AuthProvider');
  }
  return context;
};

export default AuthContext;