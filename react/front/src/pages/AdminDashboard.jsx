import { useState, useEffect } from 'react';
import { Link, Navigate } from 'react-router-dom';
import API from '../services/api';
import { useAuth } from '../context/AuthContext';
import { ROLE_ROUTES } from '../constants';

const Sidebar = ({ activeSection, onSelect }) => (
  <div className="w-64 bg-[#1a7a4a] min-h-screen flex-shrink-0">
    <div className="p-6 border-b border-white/10">
      <p className="text-white/60 text-xs uppercase tracking-widest mb-1">ADMIN</p>
      <p className="text-white font-bold text-lg">Safoua Academy</p>
    </div>
    <div className="p-4">
      <p className="text-white/50 text-xs uppercase tracking-widest mb-3 px-2">GESTION</p>
      {[
        { key: 'etudiants', icon: '👤', label: 'Étudiants' },
        { key: 'cours',     icon: '📖', label: 'Cours' },
      ].map((item) => (
        <button key={item.key} onClick={() => onSelect(item.key)}
          className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium mb-1 transition-colors ${
            activeSection === item.key ? 'bg-white text-[#1a7a4a]' : 'text-white/80 hover:bg-white/10'
          }`}
        >
          <span>{item.icon}</span> {item.label}
        </button>
      ))}
    </div>
  </div>
);

const AdminDashboard = () => {
  const { logoutUser, isAdmin } = useAuth();
  const [activeSection, setActiveSection] = useState('etudiants');
  const [users, setUsers]     = useState([]);
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch]   = useState('');
  const [page, setPage]       = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [error, setError] = useState(null);
  const [deletingId, setDeletingId] = useState(null);

  if (!isAdmin) {
    return <Navigate to={ROLE_ROUTES['etudiant']} replace />;
  }

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        if (activeSection === 'etudiants') {
          const res = await API.get(`/users?page=${page}&limit=10`);
          setUsers(res.data.data || []);
          setTotalPages(res.data.totalPages || 1);
        } else {
          const res = await API.get(`/courses?page=${page}&limit=10`);
          setCourses(res.data.data || []);
          setTotalPages(res.data.totalPages || 1);
        }
      } catch { setUsers([]); setCourses([]); }
      finally { setLoading(false); }
    };
    fetchData();
  }, [activeSection, page]);

  const handleDeleteUser = async (id) => {
    if (!window.confirm('Supprimer cet utilisateur ?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await API.delete(`/users/${id}`);
      setUsers((p) => p.filter((u) => u._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const handleDeleteCourse = async (id) => {
    if (!window.confirm('Supprimer ce cours ?')) return;
    setDeletingId(id);
    setError(null);
    try {
      await API.delete(`/courses/${id}`);
      setCourses((p) => p.filter((c) => c._id !== id));
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la suppression');
    } finally {
      setDeletingId(null);
    }
  };

  const filteredUsers   = users.filter((u) => `${u.nom} ${u.prenom} ${u.email}`.toLowerCase().includes(search.toLowerCase()));
  const filteredCourses = courses.filter((c) => c.titre?.toLowerCase().includes(search.toLowerCase()));

  return (
    <div className="min-h-screen bg-gray-50 flex">
      <Sidebar activeSection={activeSection} onSelect={(s) => { setActiveSection(s); setPage(1); setSearch(''); }} />

      <div className="flex-1 flex flex-col">
        {/* Header */}
        <div className="bg-[#f0faf4] border-b border-gray-100 py-3 px-6 text-center text-sm font-semibold text-gray-600 relative">
          Safoua Academy — Admin Dashboard
          <div className="w-full h-0.5 bg-gradient-to-r from-[#1a7a4a] to-[#22c55e] absolute bottom-0 left-0" />
          <button onClick={logoutUser} className="absolute right-6 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-red-500">
            Déconnexion
          </button>
        </div>

        <div className="flex-1 p-8">
          {/* Error notification */}
          {error && (
            <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 text-lg">⚠️</span>
              <div className="flex-1">
                <p className="text-sm font-medium text-red-800">{error}</p>
              </div>
              <button onClick={() => setError(null)} className="text-red-600 hover:text-red-700 text-xl leading-none">×</button>
            </div>
          )}
          {/* Titre + recherche */}
          <div className="flex items-center justify-between mb-6">
            <div>
              <h1 className="text-xl font-extrabold text-gray-800">
                Gestion des {activeSection === 'etudiants' ? 'Étudiants' : 'Cours'}
              </h1>
              <p className="text-xs text-gray-400 mt-0.5">CRUD via API</p>
            </div>
            <div className="relative">
              <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm">🔍</span>
              <input type="text" value={search} onChange={(e) => setSearch(e.target.value)}
                placeholder="Rechercher..." className="pl-9 pr-3 py-2 border border-gray-200 rounded-lg text-sm focus:outline-none focus:border-[#1a7a4a] w-48"
              />
            </div>
          </div>

          {/* Table */}
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            {loading ? (
              <div className="p-8 space-y-3">
                {[1,2,3,4].map((i) => <div key={i} className="h-12 bg-gray-100 animate-pulse rounded-lg" />)}
              </div>
            ) : activeSection === 'etudiants' ? (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['ID','NOM','RÔLE','EMAIL','ACTIONS'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredUsers.length === 0 ? (
                    <tr><td colSpan={5} className="px-5 py-8 text-center text-gray-400">Aucun utilisateur trouvé</td></tr>
                  ) : filteredUsers.map((u, i) => (
                    <tr key={u._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 text-gray-400 text-xs">{String(i + 1).padStart(3,'0')}</td>
                      <td className="px-5 py-4 font-medium text-gray-800">{u.nom} {u.prenom}</td>
                      <td className="px-5 py-4 text-gray-500">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          u.role === 'admin' ? 'bg-purple-100 text-purple-600' :
                          u.role === 'enseignant' ? 'bg-blue-100 text-blue-600' :
                          'bg-[#e8f7ef] text-[#1a7a4a]'
                        }`}>{u.role}</span>
                      </td>
                      <td className="px-5 py-4 text-gray-500">{u.email}</td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <button onClick={() => handleDeleteUser(u._id)} disabled={deletingId === u._id}
                            className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors disabled:opacity-60"
                          >{deletingId === u._id ? '⏳' : '🗑'} Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            ) : (
              <table className="w-full text-sm">
                <thead className="bg-gray-50 border-b border-gray-100">
                  <tr>{['TITRE','CATÉGORIE','NIVEAU','INSCRITS','STATUT','ACTIONS'].map((h) => (
                    <th key={h} className="px-5 py-3 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">{h}</th>
                  ))}</tr>
                </thead>
                <tbody className="divide-y divide-gray-50">
                  {filteredCourses.length === 0 ? (
                    <tr><td colSpan={6} className="px-5 py-8 text-center text-gray-400">Aucun cours trouvé</td></tr>
                  ) : filteredCourses.map((c) => (
                    <tr key={c._id} className="hover:bg-gray-50 transition-colors">
                      <td className="px-5 py-4 font-medium text-gray-800">{c.titre}</td>
                      <td className="px-5 py-4 text-gray-500">{c.categorie}</td>
                      <td className="px-5 py-4 text-gray-500">{c.niveau}</td>
                      <td className="px-5 py-4 text-gray-500">{c.nombre_inscrits || 0}</td>
                      <td className="px-5 py-4">
                        <span className={`text-xs px-2 py-1 rounded-full font-medium ${
                          c.est_publie ? 'bg-[#e8f7ef] text-[#1a7a4a]' : 'bg-amber-50 text-amber-600'
                        }`}>{c.est_publie ? 'Publié' : 'Brouillon'}</span>
                      </td>
                      <td className="px-5 py-4">
                        <div className="flex items-center gap-2">
                          <Link to={`/cours/${c._id}`} className="flex items-center gap-1 px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors">
                            👁 Voir
                          </Link>
                          <button onClick={() => handleDeleteCourse(c._id)} disabled={deletingId === c._id}
                            className="flex items-center gap-1 px-3 py-1.5 border border-red-200 text-red-500 rounded-lg text-xs hover:bg-red-50 transition-colors disabled:opacity-60"
                          >{deletingId === c._id ? '⏳' : '🗑'} Supprimer</button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            )}

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 p-4 border-t border-gray-100">
                <button onClick={() => setPage((p) => Math.max(p-1,1))} disabled={page===1}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50"
                >← Précédent</button>
                <span className="text-xs text-gray-500">Page {page} / {totalPages}</span>
                <button onClick={() => setPage((p) => Math.min(p+1,totalPages))} disabled={page===totalPages}
                  className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs disabled:opacity-40 hover:bg-gray-50"
                >Suivant →</button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;