import { useState, useEffect, useRef } from 'react';
import { getCourses } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/Coursecard';

const SkeletonCard = () => (
  <div className="bg-white rounded-2xl overflow-hidden shadow-sm animate-pulse">
    <div className="h-48 bg-gray-200" />
    <div className="p-5 space-y-3">
      <div className="h-3 bg-gray-200 rounded w-1/3" />
      <div className="h-4 bg-gray-200 rounded w-3/4" />
      <div className="h-3 bg-gray-200 rounded w-full" />
      <div className="h-3 bg-gray-200 rounded w-2/3" />
    </div>
  </div>
);

const Catalogue = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const [filters, setFilters] = useState({ categorie: '', niveau: '', langue: '', search: '' });
  const searchTimeoutRef = useRef(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const params = { page, limit: 9 };
        if (filters.categorie) params.categorie = filters.categorie;
        if (filters.niveau)    params.niveau    = filters.niveau;
        if (filters.langue)    params.langue    = filters.langue;
        if (filters.search)    params.search    = filters.search;

        const res = await getCourses(params);
        console.log('API Response:', res.data);
        setCourses(res.data.data || []);
        setTotalPages(res.data.totalPages || 1);
        setTotal(res.data.total || 0);
      } catch (err) {
        setError('Impossible de charger les cours. Veuillez vérifier votre connexion.');
        setCourses([]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, [page, filters]);

  const handleFilterChange = (key, value) => {
    if (key === 'search') {
      clearTimeout(searchTimeoutRef.current);
      searchTimeoutRef.current = setTimeout(() => {
        setFilters((prev) => ({ ...prev, [key]: value }));
        setPage(1);
      }, 300);
    } else {
      setFilters((prev) => ({ ...prev, [key]: value }));
      setPage(1);
    }
  };

  const resetFilters = () => {
    setFilters({ categorie: '', niveau: '', langue: '', search: '' });
    setPage(1);
  };

  const hasFilters = filters.categorie || filters.niveau || filters.langue || filters.search;

  const getPaginationButtons = () => {
    const maxVisible = 7;
    if (totalPages <= maxVisible) {
      return Array.from({ length: totalPages }, (_, i) => i + 1);
    }
    const buttons = [];
    const half = Math.floor(maxVisible / 2);
    let start = Math.max(1, page - half);
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start < maxVisible - 1) start = Math.max(1, end - maxVisible + 1);
    if (start > 1) buttons.push(1);
    if (start > 2) buttons.push('...');
    for (let i = start; i <= end; i++) buttons.push(i);
    if (end < totalPages - 1) buttons.push('...');
    if (end < totalPages) buttons.push(totalPages);
    return buttons;
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="catalogue" />

      <div className="bg-[#f0faf4] border-b border-gray-100 py-3 text-center">
        <p className="text-sm font-semibold text-gray-600">Safoua Academy — Catalogue Cours</p>
        <div className="w-full h-0.5 bg-gradient-to-r from-[#1a7a4a] to-[#22c55e] mt-3" />
      </div>

      <div className="max-w-6xl mx-auto px-6 py-8">
        <h1 className="text-2xl font-extrabold text-gray-800 mb-6">
          Catalogue des cours
          {total > 0 && <span className="ml-3 text-sm font-normal text-gray-400">({total} cours)</span>}
        </h1>

        {/* Filtres */}
        <div className="bg-white rounded-xl p-5 mb-8 shadow-sm">
          <div className="flex items-center gap-2 mb-4 text-gray-600 font-medium text-sm">
            <span>🔽</span> Filtres
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-xs text-gray-500 mb-1">Catégorie</label>
              <select value={filters.categorie} onChange={(e) => handleFilterChange('categorie', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a7a4a]"
              >
                <option value="">Toutes</option>
                <option value="Coran">Coran</option>
                <option value="Langue Arabe">Langue Arabe</option>
                <option value="Sciences Islamiques">Sciences Islamiques</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Niveau</label>
              <select value={filters.niveau} onChange={(e) => handleFilterChange('niveau', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a7a4a]"
              >
                <option value="">Tous</option>
                <option>Débutant</option>
                <option>Intermédiaire</option>
                <option>Avancé</option>
                <option>Expert</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Langue</label>
              <select value={filters.langue} onChange={(e) => handleFilterChange('langue', e.target.value)}
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a7a4a]"
              >
                <option value="">Toutes</option>
                <option>Arabe</option>
                <option>Français</option>
                <option>Anglais</option>
              </select>
            </div>
            <div>
              <label className="block text-xs text-gray-500 mb-1">Recherche</label>
              <input type="text" value={filters.search}
                onChange={(e) => handleFilterChange('search', e.target.value)}
                placeholder="Tajwid, Coran..."
                className="w-full border border-gray-200 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-[#1a7a4a]"
              />
            </div>
          </div>
          {hasFilters && (
            <button onClick={resetFilters} className="mt-3 text-xs text-gray-400 hover:text-red-500 transition-colors">
              ✕ Réinitialiser les filtres
            </button>
          )}
        </div>

        {/* Erreur */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-red-600 text-sm">
            {error}
          </div>
        )}

        {/* Grille cours */}
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {Array(9).fill(0).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : courses.length === 0 ? (
          <div className="text-center py-20 text-gray-400">
            <p className="text-5xl mb-4">📚</p>
            <p className="text-lg font-medium">Aucun cours trouvé</p>
            <p className="text-sm mt-2">Essayez de modifier vos filtres ou vérifier la connexion API</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course) => (
              <CourseCard key={course._id} course={course} variant="default" />
            ))}
          </div>
        )}

        {/* Pagination */}
        {totalPages > 1 && !loading && (
          <div className="flex items-center justify-center gap-3 mt-10">
            <button onClick={() => setPage((p) => Math.max(p - 1, 1))} disabled={page === 1}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >← Précédent</button>
            <div className="flex gap-1">
              {getPaginationButtons().map((p, i) => (
                p === '...' ? (
                  <span key={`dots-${i}`} className="px-2 py-2 text-gray-400">...</span>
                ) : (
                  <button key={p} onClick={() => setPage(p)}
                    className={`w-9 h-9 rounded-lg text-sm font-medium transition-colors ${
                      p === page ? 'bg-[#1a7a4a] text-white' : 'bg-white border border-gray-200 text-gray-600 hover:bg-gray-50'
                    }`}
                  >{p}</button>
                )
              ))}
            </div>
            <button onClick={() => setPage((p) => Math.min(p + 1, totalPages))} disabled={page === totalPages}
              className="px-4 py-2 bg-white border border-gray-200 rounded-lg text-sm font-medium text-gray-600 hover:bg-gray-50 disabled:opacity-40 transition-colors"
            >Suivant →</button>
          </div>
        )}
        {!loading && courses.length > 0 && (
          <p className="text-center text-xs text-gray-400 mt-4">
            Page {page} sur {totalPages} — {total} cours au total
          </p>
        )}
      </div>
      <Footer simple />
    </div>
  );
};

export default Catalogue;
