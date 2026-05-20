import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getLessonById, getLessons, completeLesson } from '../services/api';

const LessonPlayer = () => {
  const { courseId, lessonId } = useParams();
  const navigate = useNavigate();

  const [lesson, setLesson]   = useState(null);
  const [lessons, setLessons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [completing, setCompleting] = useState(false);
  const [completed, setCompleted]   = useState(false);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const [lessonRes, lessonsRes] = await Promise.all([
          getLessonById(courseId, lessonId),
          getLessons(courseId),
        ]);
        setLesson(lessonRes.data.data);
        setLessons(lessonsRes.data.data || []);
      } catch (err) {
        setError('Impossible de charger la leçon. Veuillez réessayer.');
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, [courseId, lessonId]);

  const currentIndex = lessons.findIndex((l) => l._id === lessonId);
  const nextLesson   = lessons[currentIndex + 1] || null;
  const prevLesson   = lessons[currentIndex - 1] || null;

  const handleComplete = async () => {
    setCompleting(true);
    setError(null);
    try {
      await completeLesson(courseId, lessonId, { temps_passe_minutes: lesson?.duree_minutes || 0 });
      setCompleted(true);
      if (nextLesson) {
        setTimeout(() => navigate(`/lecon/${courseId}/${nextLesson._id}`), 800);
      }
    } catch (err) {
      setError('Erreur lors de l\'enregistrement. Veuillez réessayer.');
    } finally {
      setCompleting(false);
    }
  };

  if (loading) return (
    <div className="min-h-screen bg-white flex items-center justify-center">
      <div className="w-10 h-10 border-4 border-[#1a7a4a] border-t-transparent rounded-full animate-spin" />
    </div>
  );

  if (error) return (
    <div className="min-h-screen bg-white flex items-center justify-center p-6">
      <div className="max-w-md text-center">
        <div className="text-5xl mb-4">⚠️</div>
        <h1 className="text-2xl font-bold text-gray-800 mb-2">Erreur de chargement</h1>
        <p className="text-gray-600 mb-6">{error}</p>
        <button onClick={() => navigate(-1)}
          className="px-6 py-2.5 bg-[#1a7a4a] text-white font-semibold rounded-lg hover:bg-[#155f3a] transition-colors"
        >← Retour</button>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-white flex flex-col">
      {/* ── Header ────────────────────────────────────────────────────── */}
      <div className="bg-[#f0faf4] border-b border-gray-100 py-3 px-6 text-center shrink-0">
        <p className="text-sm font-semibold text-gray-600">Safoua Academy — Lecteur de Leçon</p>
        <div className="w-full h-0.5 bg-gradient-to-r from-[#1a7a4a] to-[#22c55e] mt-3" />
      </div>

      <div className="px-6 py-4 border-b border-gray-100 shrink-0">
        <Link to={`/cours/${courseId}`} className="text-[#1a7a4a] font-extrabold text-lg flex items-center gap-2 hover:underline">
          ← Safoua Academy
        </Link>
      </div>

      <div className="flex-1 max-w-6xl mx-auto w-full px-6 py-6 flex gap-6">
        {/* ── Lecteur principal ──────────────────────────────────────── */}
        <div className="flex-1 min-w-0">
          {/* Error notification */}
          {error && !loading && (
            <div className="mb-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-start gap-3">
              <span className="text-red-600 text-lg">⚠️</span>
              <div>
                <p className="text-sm font-medium text-red-800">{error}</p>
                <button onClick={() => setError(null)} className="text-xs text-red-600 hover:underline mt-1">Fermer</button>
              </div>
            </div>
          )}
          {/* Contenu selon type */}
          {lesson?.type_contenu === 'video' && lesson?.url_media ? (
            <video controls className="w-full rounded-xl bg-black"
              src={`${import.meta.env.VITE_API_URL}/uploads/videos/${lesson.url_media}`}
            />
          ) : lesson?.type_contenu === 'audio' && lesson?.url_media ? (
            <div className="w-full h-64 bg-gray-900 rounded-xl flex flex-col items-center justify-center gap-4">
              <span className="text-6xl">🎵</span>
              <audio controls src={`${import.meta.env.VITE_API_URL}/uploads/audios/${lesson.url_media}`} className="w-3/4" />
            </div>
          ) : lesson?.type_contenu === 'pdf' && lesson?.url_media ? (
            <iframe
              src={`${import.meta.env.VITE_API_URL}/uploads/pdfs/${lesson.url_media}`}
              className="w-full h-96 rounded-xl border border-gray-200" title={lesson.titre}
            />
          ) : lesson?.type_contenu === 'texte' ? (
            <div className="bg-gray-50 rounded-xl p-6 text-gray-700 leading-relaxed min-h-48">
              <p>{lesson?.contenu_texte || 'Contenu de la leçon.'}</p>
            </div>
          ) : (
            /* Placeholder */
            <div className="w-full h-80 bg-gray-900 rounded-xl flex flex-col items-center justify-center gap-3 relative">
              <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center">
                <span className="text-white text-2xl">▶</span>
              </div>
              <p className="text-white/60 text-sm">Lecteur vidéo</p>
              <div className="absolute bottom-4 left-4 right-4 flex items-center gap-3">
                <div className="w-8 h-8 bg-[#1a7a4a] rounded-full flex items-center justify-center shrink-0">
                  <span className="text-white text-xs">▶</span>
                </div>
                <div className="flex-1 h-1 bg-white/20 rounded-full" />
                <span className="text-white/60 text-xs shrink-0">0:00 / 30:00</span>
              </div>
            </div>
          )}

          {/* Infos leçon */}
          <div className="mt-4 mb-6">
            <h1 className="text-xl font-bold text-gray-800">{lesson?.titre}</h1>
            <p className="text-sm text-gray-400 mt-1">
              {lesson?.type_contenu} · {lesson?.duree_minutes || 0} min ·
              Leçon {currentIndex + 1} sur {lessons.length}
            </p>
          </div>

          {/* Boutons navigation */}
          <div className="flex items-center gap-3">
            {prevLesson && (
              <button onClick={() => navigate(`/lecon/${courseId}/${prevLesson._id}`)}
                className="px-4 py-2 border border-gray-200 rounded-lg text-sm text-gray-600 hover:bg-gray-50 transition-colors"
              >← Précédente</button>
            )}
            <button onClick={handleComplete} disabled={completing || completed}
              className="px-6 py-2.5 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg text-sm transition-colors disabled:opacity-60 ml-auto flex items-center gap-2"
            >
              {completed ? '✅ Complétée !' : completing
                ? <><svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"/>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"/>
                  </svg>Enregistrement...</>
                : 'Marquer comme complétée →'}
            </button>
          </div>
        </div>

        {/* ── Panneau droite ─────────────────────────────────────────── */}
        <div className="w-72 shrink-0 space-y-4">
          {/* Ressources */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Ressources</h3>
            <div className="space-y-2">
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-red-400">📄</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">PDF — Règles de prononciation</p>
                    <p className="text-xs text-gray-400">2.3 MB</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">⬇</span>
              </div>
              <div className="flex items-center justify-between p-3 border border-gray-100 rounded-lg hover:bg-gray-50 cursor-pointer transition-colors">
                <div className="flex items-center gap-2">
                  <span className="text-blue-400">🎧</span>
                  <div>
                    <p className="text-sm font-medium text-gray-700">Audio — Exemples de récitation</p>
                    <p className="text-xs text-gray-400">5.1 MB</p>
                  </div>
                </div>
                <span className="text-gray-400 text-sm">⬇</span>
              </div>
            </div>
          </div>

          {/* Navigation */}
          <div className="bg-white border border-gray-100 rounded-xl p-4 shadow-sm">
            <h3 className="font-bold text-gray-800 mb-3">Navigation</h3>
            <div className="space-y-2 mb-4">
              {/* Leçon actuelle */}
              <div className="p-3 bg-[#f0faf4] border border-[#1a7a4a]/20 rounded-lg">
                <p className="text-xs font-semibold text-gray-700">Leçon actuelle</p>
                <p className="text-xs text-gray-500 mt-0.5 flex items-center gap-1">
                  {lesson?.titre} <span className="text-red-400">•</span>
                </p>
              </div>
              {/* Leçon suivante */}
              {nextLesson ? (
                <button onClick={() => navigate(`/lecon/${courseId}/${nextLesson._id}`)}
                  className="w-full p-3 border border-gray-100 rounded-lg text-left hover:bg-gray-50 transition-colors"
                >
                  <p className="text-xs font-semibold text-gray-700">Leçon suivante</p>
                  <p className="text-xs text-gray-500 mt-0.5">{nextLesson.titre}</p>
                </button>
              ) : (
                <div className="p-3 border border-gray-100 rounded-lg text-center">
                  <p className="text-xs text-gray-400">🎉 Dernière leçon du cours</p>
                </div>
              )}
            </div>

            {/* Liste complète */}
            <div className="space-y-1 max-h-48 overflow-y-auto">
              {lessons.map((l, i) => (
                <button key={l._id}
                  onClick={() => navigate(`/lecon/${courseId}/${l._id}`)}
                  className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-colors flex items-center gap-2 ${
                    l._id === lessonId
                      ? 'bg-[#1a7a4a] text-white font-semibold'
                      : 'text-gray-600 hover:bg-gray-50'
                  }`}
                >
                  <span className="shrink-0">{i + 1}.</span>
                  <span className="truncate">{l.titre}</span>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LessonPlayer;