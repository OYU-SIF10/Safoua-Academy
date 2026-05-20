import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrollments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const Certificats = () => {
  const { user, logoutUser } = useAuth();
  const [certificats, setCertificats] = useState([]);
  const [loading, setLoading]         = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyEnrollments();
        setCertificats((res.data.data || []).filter((e) => e.statut === 'complété'));
      } catch {
        setCertificats([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  const formatDate = (dateStr) => {
    if (!dateStr) return '';
    return new Date(dateStr).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  const generateCertifId = (id) => `SAF-${new Date().getFullYear()}-${id?.slice(-3).toUpperCase()}`;

  const handleDownload = (certif) => {
    const content = `CERTIFICAT DE RÉUSSITE\nSafoua Academy\n---\n${user?.nom} ${user?.prenom}\na complété le cours : "${certif.cours_id?.titre}"\nCertificat ID: ${generateCertifId(certif._id)}\nDélivré le: ${formatDate(certif.date_completion)}`;
    const blob = new Blob([content], { type: 'text/plain' });
    const url  = URL.createObjectURL(blob);
    const a    = document.createElement('a');
    a.href = url;
    a.download = `certificat-${certif.cours_id?.titre || 'cours'}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="certificats" />

      <div className="max-w-4xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-8">Mes certificats</h1>

        {loading ? (
          <div className="space-y-4">
            {[1, 2].map((i) => <div key={i} className="animate-pulse bg-white rounded-2xl h-64 shadow-sm" />)}
          </div>
        ) : certificats.length === 0 ? (
          /* ── Aucun certificat ─────────────────────────────────────── */
          <div className="space-y-4">
            <div className="bg-white rounded-2xl p-10 shadow-sm text-center">
              <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="text-4xl">🏆</span>
              </div>
              <p className="text-gray-500 text-sm mb-4">
                Complétez un cours pour obtenir votre certificat
              </p>
              <Link to="/catalogue"
                className="px-6 py-2 bg-[#1a7a4a] text-white rounded-lg text-sm font-semibold hover:bg-[#155f3a] transition-colors"
              >Voir les cours</Link>
            </div>
          </div>
        ) : (
          /* ── Liste des certificats ──────────────────────────────── */
          <div className="space-y-6">
            {certificats.map((certif) => (
              <div key={certif._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                {/* Carte verte */}
                <div className="bg-[#e8f7ef] p-10 text-center border-b-4 border-[#1a7a4a]">
                  <div className="w-16 h-16 border-2 border-[#1a7a4a] rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-[#1a7a4a] text-3xl">🎖️</span>
                  </div>
                  <h2 className="text-2xl font-extrabold text-gray-800 mb-1">Certificat de Réussite</h2>
                  <p className="text-gray-500 text-sm mb-4">Safoua Academy</p>
                  <div className="w-24 border-b border-gray-300 mx-auto mb-4" />
                  <h3 className="text-xl font-bold text-gray-800 mb-2">{certif.cours_id?.titre}</h3>
                  <p className="text-xs text-gray-500">Certificat ID: {generateCertifId(certif._id)}</p>
                  <p className="text-xs text-gray-500">Délivré le {formatDate(certif.date_completion)}</p>
                </div>

                {/* Footer */}
                <div className="px-6 py-4 flex items-center justify-between">
                  <div>
                    <p className="text-xs text-gray-500">Ce certificat atteste de votre réussite au cours</p>
                    <p className="text-sm font-bold text-gray-700">{certif.cours_id?.titre}</p>
                  </div>
                  <button onClick={() => handleDownload(certif)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-[#1a7a4a] hover:bg-[#155f3a] text-white text-sm font-semibold rounded-lg transition-colors"
                  >⬇ Télécharger PDF</button>
                </div>
              </div>
            ))}

            {/* Encart pour plus de certificats */}
            <div className="bg-white rounded-2xl p-8 shadow-sm text-center">
              <div className="w-14 h-14 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-3">
                <span className="text-3xl text-gray-300">🏆</span>
              </div>
              <p className="text-gray-400 text-sm">Continuez vos cours pour obtenir plus de certificats</p>
              <Link to="/progression" className="text-[#1a7a4a] text-sm font-semibold hover:underline mt-2 block">
                Voir ma progression →
              </Link>
            </div>
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
};

export default Certificats;