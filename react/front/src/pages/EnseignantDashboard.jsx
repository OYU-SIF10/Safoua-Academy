import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { getMyCourses, togglePublish, deleteCourse, createCourse } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

// ─── Modal Créer un cours ──────────────────────────────────────────────────
const CreateCourseModal = ({ onClose, onCreated }) => {
  const [form, setForm]     = useState({ titre: '', description: '', categorie: 'Coran', niveau: 'Débutant', langue: 'Arabe', prix: 0, est_gratuit: true });
  const [loading, setLoading] = useState(false);
  const [error, setError]     = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      await createCourse(data);
      onCreated();
      onClose();
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl w-full max-w-lg p-6 shadow-xl">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-lg font-bold text-gray-800">Créer un nouveau cours</h2>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600 text-xl leading-none">✕</button>
        </div>
        {error && <div className="mb-4 p-3 bg-red-50 text-red-600 rounded-lg text-sm">{error}</div>}
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-gray-600 mb-1">Titre</label>
            <input type="text" value={form.titre} onChange={(e) => setForm({ ...form, titre: e.target.value })}
              required placeholder="Ex: Introduction au Tajwid"
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a7a4a]"
            />
          </div>
          <div>
            <label className="block text-sm text-gray-600 mb-1">Description</label>
            <textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })}
              required rows={3} placeholder="Description du cours..."
              className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a7a4a] resize-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm text-gray-600 mb-1">Catégorie</label>
              <select value={form.categorie} onChange={(e) => setForm({ ...form, categorie: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a7a4a]"
              >
                <option>Coran</option>
                <option>Langue Arabe</option>
                <option>Sciences Islamiques</option>
              </select>
            </div>
            <div>
              <label className="block text-sm text-gray-600 mb-1">Niveau</label>
              <select value={form.niveau} onChange={(e) => setForm({ ...form, niveau: e.target.value })}
                className="w-full border border-gray-200 rounded-lg px-3 py-2.5 text-sm focus:outline-none focus:border-[#1a7a4a]"
              >
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
                <option>Expert</option>
              </select>
            </div>
          </div>
          <label className="flex items-center gap-2 text-sm text-gray-600 cursor-pointer">
            <input type="checkbox" checked={form.est_gratuit}
              onChange={(e) => setForm({ ...form, est_gratuit: e.target.checked, prix: e.target.checked ? 0 : form.prix })}
              className="accent-[#1a7a4a]"
            /> Cours gratuit
          </label>
          {!form.est_gratuit && (
            <input type="number" value={form.prix} min={0}
              onChange={(e) => setForm({ ...form, prix: Number(e.target.value) })}
              placeholder="Prix (€)"
              className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a7a4a]"
            />
          )}
          <div className="flex gap-3 pt-2">
            <button type="button" onClick={onClose}
              className="flex-1 py-2.5 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
            >Annuler</button>
            <button type="submit" disabled={loading}
              className="flex-1 py-2.5 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg text-sm disabled:opacity-60 transition-colors"
            >{loading ? 'Création...' : 'Créer le cours'}</button>
          </div>
        </form>
      </div>
    </div>
  );
};

// ─── Dashboard Enseignant ─────────────────────────────────────────────────
const EnseignantDashboard = () => {
  const { user } = useAuth();
  const navigate  = useNavigate();

  const [courses, setCourses]     = useState([]);
  const [loading, setLoading]     = useState(true);
  const [activeTab, setActiveTab] = useState('mes-cours');
  const [showModal, setShowModal] = useState(false);

  const fetchCourses = async () => {
    setLoading(true);
    try {
      const res = await getMyCourses();
      setCourses(res.data.data || []);
    } catch {
      setCourses([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchCourses(); }, []);

  const handleTogglePublish = async (id) => {
    try { await togglePublish(id); fetchCourses(); } catch {}
  };

  const handleDelete = async (id) => {
    if (!confirm('Supprimer ce cours définitivement ?')) return;
    try { await deleteCourse(id); fetchCourses(); } catch {}
  };

  const totalEtudiants = courses.reduce((s, c) => s + (c.nombre_inscrits || 0), 0);
  const publishedCount = courses.filter((c) => c.est_publie).length;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="enseignant" />

      {showModal && (
        <CreateCourseModal onClose={() => setShowModal(false)} onCreated={fetchCourses} />
      )}

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Header ──────────────────────────────────────────────────── */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-extrabold text-gray-800">Espace Enseignant</h1>
            <p className="text-sm text-gray-500 mt-1">Bonjour, {user?.nom} {user?.prenom}</p>
          </div>
          <button onClick={() => setShowModal(true)}
            className="flex items-center gap-2 px-5 py-2.5 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors"
          ><span className="text-lg font-light">+</span> Créer un cours</button>
        </div>

        {/* ── Stats ───────────────────────────────────────────────────── */}
        <div className="grid grid-cols-3 gap-4 mb-8">
          {[
            { label: 'Total cours',     val: courses.length, icon: '📚' },
            { label: 'Cours publiés',   val: publishedCount, icon: '✅' },
            { label: 'Total étudiants', val: totalEtudiants, icon: '👥' },
          ].map((s, i) => (
            <div key={i} className="bg-white rounded-xl p-4 shadow-sm flex items-center gap-4">
              <div className="w-10 h-10 bg-[#e8f7ef] rounded-full flex items-center justify-center text-xl shrink-0">{s.icon}</div>
              <div>
                <p className="text-2xl font-extrabold text-gray-800">{s.val}</p>
                <p className="text-xs text-gray-500">{s.label}</p>
              </div>
            </div>
          ))}
        </div>

        {/* ── Tabs ────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-6">
          {[{ key: 'mes-cours', label: 'Mes cours' }, { key: 'analytiques', label: 'Analytiques' }].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'bg-[#1a7a4a] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── Liste cours ─────────────────────────────────────────────── */}
        {activeTab === 'mes-cours' && (
          <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
            <div className="p-5 border-b border-gray-100">
              <h2 className="font-bold text-gray-800">Mes cours</h2>
            </div>
            {loading ? (
              <div className="p-6 space-y-3">
                {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-16 bg-gray-100 rounded-xl" />)}
              </div>
            ) : courses.length === 0 ? (
              <div className="text-center py-16 text-gray-400">
                <p className="text-4xl mb-3">📚</p>
                <p className="text-sm">Aucun cours créé</p>
                <button onClick={() => setShowModal(true)} className="mt-3 text-[#1a7a4a] text-sm font-semibold hover:underline">
                  Créer votre premier cours →
                </button>
              </div>
            ) : (
              <div className="divide-y divide-gray-50">
                {courses.map((course) => (
                  <div key={course._id} className="flex items-center justify-between px-6 py-4 hover:bg-gray-50 transition-colors">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-3 mb-1 flex-wrap">
                        <h3 className="font-semibold text-gray-800 text-sm truncate">{course.titre}</h3>
                        <span className={`text-xs px-2 py-0.5 rounded-full font-medium shrink-0 ${
                          course.est_publie ? 'bg-[#e8f7ef] text-[#1a7a4a]' : 'bg-amber-50 text-amber-600'
                        }`}>
                          {course.est_publie ? 'Publié' : 'Brouillon'}
                        </span>
                      </div>
                      <p className="text-xs text-gray-400">
                        {course.nombre_inscrits || 0} étudiants · {course.categorie} · {course.niveau}
                      </p>
                    </div>
                    <div className="flex items-center gap-2 ml-4 shrink-0">
                      <button onClick={() => handleTogglePublish(course._id)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                      >{course.est_publie ? '⏸ Dépublier' : '▶ Publier'}</button>
                      <button onClick={() => navigate(`/enseignant/cours/${course._id}`)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                      >✏️ Modifier</button>
                      <button onClick={() => navigate(`/enseignant/stats/${course._id}`)}
                        className="px-3 py-1.5 border border-gray-200 rounded-lg text-xs text-gray-600 hover:bg-gray-100 transition-colors"
                      >📊 Statistiques</button>
                      <button onClick={() => handleDelete(course._id)}
                        className="p-1.5 text-red-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                      >🗑️</button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {activeTab === 'analytiques' && (
          <div className="bg-white rounded-2xl p-10 shadow-sm text-center text-gray-400">
            <p className="text-4xl mb-3">📊</p>
            <p className="text-sm">Les analytiques seront disponibles prochainement</p>
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
};

export default EnseignantDashboard;