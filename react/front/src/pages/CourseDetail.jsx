import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getCourseById, getLessons, enrollCourse, createCheckoutSession, getMyEnrollments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const niveauColor = {
  'Débutant':      'bg-[#1a7a4a] text-white',
  'Intermédiaire': 'bg-amber-100 text-amber-700',
  'Expert':        'bg-gray-800 text-white',
  'Avancé':        'bg-blue-100 text-blue-700',
};

const CourseDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user, isEtudiant } = useAuth();

  const [course, setCourse]   = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [enrolling, setEnrolling] = useState(false);
  const [enrolled, setEnrolled]   = useState(false);
  const [error, setError]         = useState('');

  useEffect(() => {
    const fetch = async () => {
      // ✅ Validate ID first
      if (!id) {
        setError('ID du cours manquant');
        setLoading(false);
        return;
      }

      try {
        // ✅ Fetch course and lessons independently
        const courseRes = await getCourseById(id);
        console.log('✅ Course loaded:', courseRes.data);
        setCourse(courseRes.data.data);
        
        // ✅ Fetch lessons separately to isolate errors
        try {
          const lessonsRes = await getLessons(id);
          console.log('✅ Lessons loaded:', lessonsRes.data);
          setLessons(lessonsRes.data.data || []);
        } catch (lessonErr) {
          console.warn('⚠️ Could not load lessons:', lessonErr.response?.status, lessonErr.response?.data?.message);
          setLessons([]); // Set empty array as fallback
        }

        // ✅ Check enrollment if user is student
        if (user && isEtudiant) {
          try {
            const { data: myEnrollmentsRes } = await getMyEnrollments();
            const isEnrolled = myEnrollmentsRes.data?.some(
              e => e.cours_id?._id === id || e.cours_id === id
            );
            setEnrolled(isEnrolled || false);
          } catch (err) {
            console.warn('⚠️ Could not check enrollments:', err.response?.status, err.message);
          }
        }
      } catch (error) {
        console.error('❌ Error fetching course:', error);
        console.error('Error details:', error.response?.status, error.response?.data);
        setError('Cours introuvable');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [id, user]);

  const handleEnroll = async () => {
    if (!user) return navigate('/login');
    setEnrolling(true);
    try {
      if (!course.est_gratuit && course.prix > 0) {
        const res = await createCheckoutSession(id);
        if (res.data.url) {
          window.location.href = res.data.url;
        }
      } else {
        await enrollCourse(id);
        setEnrolled(true);
      }
    } catch (err) {
      const msg = err.response?.data?.message || err.response?.data?.error || 'Erreur';
      if (msg.includes('déjà inscrit')) setEnrolled(true);
      else setError(msg);
    } finally {
      setEnrolling(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-gray-50 flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1a7a4a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error || !course) return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center text-gray-400">
        <div className="text-center">
          <p className="text-5xl mb-4">📚</p>
          <p>{error || 'Cours introuvable'}</p>
          <Link to="/catalogue" className="text-[#1a7a4a] text-sm mt-3 block hover:underline">← Retour au catalogue</Link>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header simplifié avec retour */}
      <div className="bg-white border-b border-gray-100 py-4 px-6">
        <div className="max-w-5xl mx-auto flex items-center gap-3">
          <Link to="/catalogue" className="flex items-center gap-2 text-[#1a7a4a] hover:underline">
            <span>←</span>
            <span className="text-2xl font-extrabold">Safoua Academy</span>
          </Link>
        </div>
      </div>

      <div className="max-w-5xl mx-auto px-6 py-8">
        {/* ── Image + infos ─────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl overflow-hidden shadow-sm mb-6">
          <div className="relative h-72 bg-gradient-to-br from-[#e8f7ef] to-[#bbf7d0]">
            {course.image_couverture ? (
              <img
                src={`http://localhost:5000/uploads/images/${course.image_couverture}`}
                alt={course.titre}
                className="w-full h-full object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center text-7xl">📖</div>
            )}
            <span className={`absolute top-4 left-4 text-xs font-semibold px-3 py-1 rounded-full ${niveauColor[course.niveau] || 'bg-gray-100'}`}>
              {course.niveau}
            </span>
          </div>

          <div className="p-6">
            <div className="flex items-start justify-between gap-4 flex-wrap">
              <div className="flex-1">
                <h1 className="text-2xl font-extrabold text-gray-800 mb-1">{course.titre}</h1>
                <p className="text-sm text-gray-500 mb-3">
                  Par {course.enseignant_id?.nom} {course.enseignant_id?.prenom}
                </p>
                <p className="text-gray-600 text-sm leading-relaxed mb-4">{course.description}</p>
                <div className="flex gap-6 text-sm text-gray-500 flex-wrap">
                  <div className="flex items-center gap-1">
                    <span className="text-[#1a7a4a]">⏱️</span>
                    {/* ✅ Added safety for reduce */}
                    <span>Durée <strong className="text-gray-700">{lessons.reduce((sum, l) => sum + (l.duree_minutes || 0), 0) || 0} min</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#1a7a4a]">👥</span>
                    <span>Étudiants <strong className="text-gray-700">{course.nombre_inscrits || 0}</strong></span>
                  </div>
                  <div className="flex items-center gap-1">
                    <span className="text-[#1a7a4a]">📖</span>
                    <span>Leçons <strong className="text-gray-700">{lessons.length}</strong></span>
                  </div>
                </div>
              </div>

              {/* Prix + Bouton */}
              <div className="text-right shrink-0">
                {course.note_moyenne > 0 && (
                  <div className="flex items-center justify-end gap-1 mb-3">
                    <span className="text-yellow-400 text-lg">★</span>
                    <span className="font-bold text-gray-800">{course.note_moyenne.toFixed(1)}</span>
                    <span className="text-gray-400 text-sm">({course.nombre_inscrits})</span>
                  </div>
                )}
                {course.est_gratuit
                  ? <p className="text-lg font-bold text-[#1a7a4a] mb-3">Gratuit</p>
                  : course.prix > 0 && <p className="text-2xl font-extrabold text-gray-800 mb-3">€{course.prix}</p>
                }
                {(isEtudiant || !user) && (
                  <button onClick={handleEnroll} disabled={enrolling || enrolled}
                    className="px-6 py-3 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors disabled:opacity-60 min-w-[180px]"
                  >
                    {enrolled ? '✅ Inscrit' : enrolling ? 'Inscription...' : "S'inscrire maintenant"}
                  </button>
                )}
                {enrolled && (
                  <Link to="/progression"
                    className="block mt-2 text-sm text-[#1a7a4a] font-semibold hover:underline text-center"
                  >Voir ma progression →</Link>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* ── Objectifs ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Objectifs d'apprentissage</h2>
          <div className="space-y-2">
            {['Comprendre les règles fondamentales', 'Améliorer la prononciation arabe',
              'Maîtriser les pauses et arrêts', 'Appliquer les règles dans la récitation'].map((obj, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="text-[#1a7a4a]">✅</span> {obj}
              </div>
            ))}
          </div>
        </div>

        {/* ── Prérequis ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm mb-4">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Prérequis</h2>
          <div className="space-y-2">
            {['Niveau intermédiaire en arabe', 'Connaissance de base du Tajwid'].map((p, i) => (
              <div key={i} className="flex items-center gap-3 text-gray-600 text-sm">
                <span className="text-gray-400">📄</span> {p}
              </div>
            ))}
          </div>
        </div>

        {/* ── Programme ─────────────────────────────────────────────────── */}
        <div className="bg-white rounded-2xl p-6 shadow-sm">
          <h2 className="text-lg font-bold text-gray-800 mb-4">Programme du cours</h2>
          {lessons.length === 0 ? (
            <p className="text-gray-400 text-sm">Aucune leçon disponible pour le moment.</p>
          ) : (
            <div className="space-y-3">
              {lessons.map((lesson, i) => (
                <div key={lesson._id}
                  className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:border-[#1a7a4a] hover:bg-[#f0faf4] transition-colors"
                >
                  <div className="flex items-center gap-4">
                    <div className="w-8 h-8 bg-[#e8f7ef] rounded-full flex items-center justify-center text-[#1a7a4a] font-bold text-sm shrink-0">
                      {i + 1}
                    </div>
                    <div>
                      <p className="font-medium text-gray-800 text-sm">{lesson.titre}</p>
                      <p className="text-xs text-gray-400">
                        {lesson.type_contenu} · {lesson.duree_minutes || 0} min
                        {lesson.est_gratuite && <span className="ml-2 text-[#1a7a4a]">· Gratuit</span>}
                      </p>
                    </div>
                  </div>
                  {enrolled ? (
                    <Link to={`/lecon/${id}/${lesson._id}`}
                      className="text-xs text-[#1a7a4a] font-semibold hover:underline shrink-0"
                    >Accéder →</Link>
                  ) : (
                    <span className="text-gray-300 text-lg">›</span>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer simple />
    </div>
  );
};

export default CourseDetail;