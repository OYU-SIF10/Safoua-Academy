import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { register } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROLES, ROLE_ROUTES } from '../constants';

const Register = () => {
  const navigate = useNavigate();
  const { loginUser } = useAuth();

  const [formData, setFormData] = useState({
    nom: '', prenom: '', email: '',
    mot_de_passe: '', confirmer: '', role: '',
  });
  const [accepte, setAccepte] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    if (!accepte) return setError("Veuillez accepter les conditions d'utilisation");
    if (!formData.role) return setError('Veuillez choisir un profil');
    if (formData.mot_de_passe !== formData.confirmer)
      return setError('Les mots de passe ne correspondent pas');
    if (formData.mot_de_passe.length < 6)
      return setError('Le mot de passe doit contenir au moins 6 caractères');

    setLoading(true);
    try {
      const res = await register(formData);
      const { token, data: userData } = res.data;
      loginUser(userData, token);
      navigate(ROLE_ROUTES[userData.role] || '/');
    } catch (err) {
      setError(err.response?.data?.message || "Erreur lors de l'inscription");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-xl overflow-hidden flex w-full max-w-3xl">

        {/* ── Panneau gauche vert ──────────────────────────────── */}
        <div
          className="hidden md:flex flex-col justify-between w-5/12 p-10 text-white relative overflow-hidden"
          style={{ background: 'linear-gradient(135deg, #1a7a4a 0%, #22c55e 100%)' }}
        >
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full" />

          <div className="relative flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs">✦</div>
            <span className="font-semibold text-sm">Safoua Academy</span>
          </div>

          <div className="relative">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              CRÉER<br />UN COMPTE
            </h2>
            <p className="text-sm text-white/80 mb-6">
              Inscrivez-vous pour accéder aux cours et au suivi personnalisé.
            </p>
            <div className="space-y-2 text-sm text-white/90">
              <div className="flex items-center gap-2">🛡️ Profil vérifié</div>
              <div className="flex items-center gap-2">✉️ Confirmation email</div>
            </div>
          </div>
          <div />
        </div>

        {/* ── Formulaire droite ────────────────────────────────── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-6">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">INSCRIPTION</p>
              <h1 className="text-xl font-bold text-gray-800">Safoua Academy</h1>
            </div>
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 12c2.7 0 4.8-2.1 4.8-4.8S14.7 2.4 12 2.4 7.2 4.5 7.2 7.2 9.3 12 12 12zm0 2.4c-3.2 0-9.6 1.6-9.6 4.8v2.4h19.2v-2.4c0-3.2-6.4-4.8-9.6-4.8z"/>
              </svg>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-3">
            {/* Nom + Profil */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Nom complet</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                  <input type="text" name="nom" value={formData.nom} onChange={handleChange}
                    placeholder="Ex: Mohamed Ait Ali" required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Profil</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs z-10">🛡️</span>
                  <select name="role" value={formData.role} onChange={handleChange} required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a] appearance-none bg-white"
                  >
                    <option value="">Choisir...</option>
                    <option value={ROLES.STUDENT}>Étudiant</option>
                    <option value={ROLES.TEACHER}>Enseignant</option>
                  </select>
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-xs pointer-events-none">▾</span>
                </div>
              </div>
            </div>

            {/* Prénom */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Prénom</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">👤</span>
                <input type="text" name="prenom" value={formData.prenom} onChange={handleChange}
                  placeholder="Ex: Ali" required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a]"
                />
              </div>
            </div>

            {/* Email */}
            <div>
              <label className="block text-sm text-gray-600 mb-1">Email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
                <input type="email" name="email" value={formData.email} onChange={handleChange}
                  placeholder="etudiant@exemple.com" required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a]"
                />
              </div>
            </div>

            {/* Mot de passe + Confirmer */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm text-gray-600 mb-1">Mot de passe</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                  <input type="password" name="mot_de_passe" value={formData.mot_de_passe}
                    onChange={handleChange} placeholder="••••••••" required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm text-gray-600 mb-1">Confirmer</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔒</span>
                  <input type="password" name="confirmer" value={formData.confirmer}
                    onChange={handleChange} placeholder="••••••••" required
                    className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a]"
                  />
                </div>
              </div>
            </div>

            {/* Bouton */}
            <button type="submit" disabled={loading}
              className="w-full py-3 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                </svg>Inscription...</>
              ) : "S'inscrire"}
            </button>

            {/* Conditions + Déjà un compte */}
            <div className="flex items-center justify-between text-sm">
              <label className="flex items-center gap-2 text-gray-600 cursor-pointer">
                <input type="checkbox" checked={accepte} onChange={(e) => setAccepte(e.target.checked)}
                  className="accent-[#1a7a4a]"
                />
                J'accepte les conditions
              </label>
              <Link to="/login" className="text-gray-500 hover:text-[#1a7a4a] text-sm transition-colors">
                Déjà un compte ?
              </Link>
            </div>

            {/* Conseil */}
            <div className="p-3 bg-gray-50 rounded-lg">
              <p className="text-sm font-semibold text-gray-700 mb-1">Conseil</p>
              <p className="text-xs text-gray-500">
                Sélectionnez Étudiant ou Enseignant pour activer le bon espace.
              </p>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Register;