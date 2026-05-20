import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { login } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from '../constants';

const Login = () => {
  const navigate = useNavigate();
  const { loginUser, isAuthenticated, user } = useAuth();

  useEffect(() => {
    // Redirect if already authenticated
    if (isAuthenticated && user) {
      navigate(ROLE_ROUTES[user.role] || '/', { replace: true });
    }
  }, [isAuthenticated, user, navigate]);

  const [formData, setFormData] = useState({ email: '', mot_de_passe: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const res = await login(formData);
      const { token, data } = res.data;
      loginUser(data, token);
      navigate(ROLE_ROUTES[data.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex w-full max-w-3xl min-h-[520px]">

        {/* ── Panneau gauche vert ──────────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-between w-5/12 p-10 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #22c55e 100%)' }}
        >
          {/* Cercles décoratifs */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full" />

          <div className="relative flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs">✦</div>
            <span className="font-semibold text-sm">Safoua Academy</span>
          </div>

          <div className="relative">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              WELCOME<br />BACK
            </h2>
            <p className="text-sm text-white/80 mb-6">
              Accès aux cours, suivi vocal et espace enseignants.
            </p>
            <div className="space-y-2 text-sm text-white/90">
              <div className="flex items-center gap-2">🛡️ Connexion sécurisée</div>
              <div className="flex items-center gap-2">✉️ Support: support@safoua.com</div>
            </div>
          </div>
          <div />
        </div>

        {/* ── Formulaire droite ────────────────────────────────── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">LOGIN ACCOUNT</p>
              <h1 className="text-xl font-bold text-gray-800">Safoua Academy</h1>
            </div>
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M18 8h-1V6c0-2.76-2.24-5-5-5S7 3.24 7 6v2H6c-1.1 0-2 .9-2 2v10c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V10c0-1.1-.9-2-2-2zm-6 9c-1.1 0-2-.9-2-2s.9-2 2-2 2 .9 2 2-.9 2-2 2zm3.1-9H8.9V6c0-1.71 1.39-3.1 3.1-3.1 1.71 0 3.1 1.39 3.1 3.1v2z"/>
              </svg>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
                <input
                  type="email" name="email" value={formData.email}
                  onChange={handleChange} placeholder="email@exemple.com" required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a] transition-colors"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                <input
                  type="password" name="mot_de_passe" value={formData.mot_de_passe}
                  onChange={handleChange} placeholder="••••••••••" required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a] transition-colors"
                />
              </div>
            </div>

            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Connexion...</>
              ) : 'Se connecter'}
            </button>

            <div className="flex items-center justify-between text-sm">
              <Link to="/forgot-password" className="text-gray-400 text-xs hover:text-[#1a7a4a] transition-colors">👁️ Mot de passe oublié</Link>
            </div>


            <p className="text-center text-sm text-gray-500">
              Pas encore de compte ?{' '}
              <Link to="/register" className="text-[#1a7a4a] font-semibold hover:underline">S'inscrire</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Login;