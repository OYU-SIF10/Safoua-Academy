import { useState } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';

const ForgotPassword = () => {
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccess('');

    try {
      const res = await axios.post('/api/users/forgot-password', { email });
      setSuccess(res.data.message || 'Email de réinitialisation envoyé');
      setEmail('');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la demande');
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
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-white/10 rounded-full" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-40 h-40 bg-white/10 rounded-full" />

          <div className="relative flex items-center gap-2">
            <div className="w-7 h-7 bg-white/20 rounded-full flex items-center justify-center text-xs">✦</div>
            <span className="font-semibold text-sm">Safoua Academy</span>
          </div>

          <div className="relative">
            <h2 className="text-4xl font-extrabold leading-tight mb-4">
              MOT DE PASSE<br />OUBLIÉ
            </h2>
            <p className="text-sm text-white/80 mb-6">
              Pas de problème ! Réinitialisez votre mot de passe en quelques étapes.
            </p>
            <div className="space-y-2 text-sm text-white/90">
              <div className="flex items-center gap-2">🔒 Sécurisé et rapide</div>
              <div className="flex items-center gap-2">✉️ Vérification par email</div>
            </div>
          </div>
          <div />
        </div>

        {/* ── Formulaire droite ────────────────────────────────── */}
        <div className="flex-1 p-8 md:p-10 flex flex-col justify-center">
          <div className="flex items-center justify-between mb-8">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-widest mb-1">RÉINITIALISATION</p>
              <h1 className="text-xl font-bold text-gray-800">Mot de passe oublié</h1>
            </div>
            <div className="w-10 h-10 bg-gray-900 rounded-full flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 1C6.48 1 2 5.48 2 11s4.48 10 10 10 10-4.48 10-10S17.52 1 12 1zm0 18c-4.41 0-8-3.59-8-8s3.59-8 8-8 8 3.59 8 8-3.59 8-8 8zm3.5-9c.83 0 1.5-.67 1.5-1.5S16.33 7 15.5 7 14 7.67 14 8.5s.67 1.5 1.5 1.5zm-7 0c.83 0 1.5-.67 1.5-1.5S9.33 7 8.5 7 7 7.67 7 8.5 7.67 10 8.5 10zm3.5 6.5c2.33 0 4.31-1.46 5.11-3.5H6.89c.8 2.04 2.78 3.5 5.11 3.5z"/>
              </svg>
            </div>
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
              {error}
            </div>
          )}

          {success && (
            <div className="mb-4 p-3 bg-green-50 border border-green-200 rounded-lg text-green-600 text-sm">
              {success}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Adresse email</label>
              <div className="relative">
                <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">✉️</span>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="email@exemple.com"
                  required
                  className="w-full pl-9 pr-3 py-2.5 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] focus:ring-1 focus:ring-[#1a7a4a] transition-colors"
                />
              </div>
            </div>

            <p className="text-xs text-gray-500">
              Nous vous enverrons un email avec un lien de réinitialisation valide 15 minutes.
            </p>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {loading ? (
                <>
                  <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>
                  Envoi en cours...
                </>
              ) : 'Envoyer le lien'}
            </button>

            <p className="text-center text-sm text-gray-500">
              Vous vous souvenez de votre mot de passe ?{' '}
              <Link to="/login" className="text-[#1a7a4a] font-semibold hover:underline">Se connecter</Link>
            </p>
          </form>
        </div>
      </div>
    </div>
  );
};

export default ForgotPassword;
