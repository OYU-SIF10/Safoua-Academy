import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { getMyEnrollments } from '../services/api';
import { useAuth } from '../context/AuthContext';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import ProgressCircle from '../components/Progresscircle';

const Progression = () => {
  const { logoutUser } = useAuth();
  const [enrollments, setEnrollments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);
  const [activeTab, setActiveTab]     = useState('progression');

  useEffect(() => {
    const fetch = async () => {
      setError(null);
      try {
        const res = await getMyEnrollments();
        setEnrollments(res.data.data || []);
      } catch (err) {
        setError('Impossible de charger votre progression. Veuillez réessayer.');
        setEnrollments([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  // ── Stats globales ────────────────────────────────────────────────────
  const totalLecons     = enrollments.reduce((s, e) => s + (e.progression_lecons?.length || 0), 0);
  const completedLecons = enrollments.reduce((s, e) => s + (e.progression_lecons?.filter((l) => l.est_completee).length || 0), 0);
  const tempsTotal      = enrollments.reduce((s, e) => s + (e.progression_lecons?.reduce((ss, l) => ss + (l.temps_passe_minutes || 0), 0) || 0), 0);
  const quizReussis     = enrollments.reduce((s, e) => s + (e.progression_lecons?.filter((l) => l.score_quiz >= 70).length || 0), 0);
  const scoresSum       = enrollments.reduce((s, e) => s + (e.progression_lecons?.reduce((ss, l) => ss + (l.score_quiz || 0), 0) || 0), 0);

  const progressionGlobale = totalLecons > 0 ? Math.round((completedLecons / totalLecons) * 100) : 0;
  const heures  = Math.floor(tempsTotal / 60);
  const minutes = tempsTotal % 60;
  const scoreMoyen = completedLecons > 0 ? Math.round(scoresSum / completedLecons) : 0;

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar activePage="progression" />

      <div className="max-w-5xl mx-auto px-6 py-8">
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
        {/* ── Tabs ─────────────────────────────────────────────────────── */}
        <div className="flex gap-2 mb-8">
          {[
            { key: 'progression', label: 'Progression' },
            { key: 'quiz',        label: 'Quiz & Résultats' },
          ].map((tab) => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`px-5 py-2 rounded-lg text-sm font-semibold transition-colors ${
                activeTab === tab.key ? 'bg-[#1a7a4a] text-white' : 'text-gray-500 hover:bg-gray-100'
              }`}
            >{tab.label}</button>
          ))}
        </div>

        {/* ── Tab Progression ──────────────────────────────────────────── */}
        {activeTab === 'progression' && (
          <>
            {/* Progression globale */}
            <div className="bg-white rounded-2xl p-6 shadow-sm mb-6">
              <h2 className="text-lg font-bold text-gray-800 mb-6">Progression globale</h2>
              {loading ? (
                <div className="animate-pulse h-32 bg-gray-100 rounded-xl" />
              ) : (
                <div className="flex items-center gap-8 flex-wrap">
                  {/* Cercle SVG */}
                  <ProgressCircle value={progressionGlobale} size="md" />

                  {/* Stats 2x2 */}
                  <div className="flex-1 grid grid-cols-2 gap-4 min-w-0">
                    {[
                      { label: 'Leçons complétées', val: `${completedLecons}/${totalLecons}` },
                      { label: 'Temps passé',       val: `${heures}h ${minutes}min` },
                      { label: 'Quiz réussis',      val: quizReussis },
                      { label: 'Score moyen',       val: `${scoreMoyen}%` },
                    ].map((s, i) => (
                      <div key={i} className="bg-[#f0faf4] rounded-xl p-4">
                        <p className="text-xs text-gray-500 mb-1">{s.label}</p>
                        <p className="text-2xl font-extrabold text-gray-800">{s.val}</p>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Progression par cours */}
            <div className="bg-white rounded-2xl p-6 shadow-sm">
              <h2 className="text-lg font-bold text-gray-800 mb-4">Progression par module</h2>
              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map((i) => <div key={i} className="animate-pulse h-10 bg-gray-100 rounded-lg" />)}
                </div>
              ) : enrollments.length === 0 ? (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-3">📚</p>
                  <p className="text-sm">Aucun cours en cours</p>
                  <Link to="/catalogue" className="text-[#1a7a4a] text-sm font-semibold hover:underline mt-2 block">
                    Découvrir le catalogue →
                  </Link>
                </div>
              ) : (
                <div className="space-y-5">
                  {enrollments.map((enrollment) => {
                    const prog       = enrollment.progression || 0;
                    const isComplete = enrollment.statut === 'complété';
                    return (
                      <div key={enrollment._id}>
                        <div className="flex items-center justify-between mb-1.5">
                          <div className="flex items-center gap-2">
                            {isComplete && <span className="text-[#1a7a4a] text-base">✅</span>}
                            <span className="text-sm font-medium text-gray-700">
                              {enrollment.cours_id?.titre || 'Cours'}
                            </span>
                          </div>
                          <span className={`text-sm font-bold ${isComplete ? 'text-[#1a7a4a]' : 'text-gray-600'}`}>
                            {prog}%
                          </span>
                        </div>
                        <div className="w-full h-2 bg-gray-100 rounded-full overflow-hidden">
                          <div
                            className="h-full bg-[#1a7a4a] rounded-full transition-all duration-700"
                            style={{ width: `${prog}%` }}
                          />
                        </div>
                        <div className="flex justify-between mt-1 text-xs text-gray-400">
                          <span>{enrollment.cours_id?.categorie}</span>
                          <Link to={`/cours/${enrollment.cours_id?._id}`}
                            className="text-[#1a7a4a] hover:underline"
                          >Continuer →</Link>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>
          </>
        )}

        {/* ── Tab Quiz ─────────────────────────────────────────────────── */}
        {activeTab === 'quiz' && (
          <div className="bg-white rounded-2xl p-6 shadow-sm">
            <h2 className="text-lg font-bold text-gray-800 mb-4">Quiz & Résultats</h2>
            <div className="space-y-3">
              {enrollments.flatMap((e) =>
                (e.progression_lecons || [])
                  .filter((l) => l.score_quiz !== null && l.score_quiz !== undefined)
                  .map((l, i) => (
                    <div key={`${e._id}-${i}`}
                      className="flex items-center justify-between p-4 border border-gray-100 rounded-xl hover:bg-gray-50 transition-colors"
                    >
                      <div>
                        <p className="text-sm font-medium text-gray-700">Leçon {i + 1}</p>
                        <p className="text-xs text-gray-400">{e.cours_id?.titre}</p>
                      </div>
                      <div className={`px-3 py-1.5 rounded-full text-sm font-bold ${
                        l.score_quiz >= 70 ? 'bg-[#e8f7ef] text-[#1a7a4a]' : 'bg-red-50 text-red-500'
                      }`}>
                        {l.score_quiz}%
                      </div>
                    </div>
                  ))
              )}
              {enrollments.every((e) =>
                !e.progression_lecons?.some((l) => l.score_quiz !== null && l.score_quiz !== undefined)
              ) && (
                <div className="text-center py-10 text-gray-400">
                  <p className="text-4xl mb-3">📝</p>
                  <p className="text-sm">Aucun quiz complété pour le moment</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      <Footer simple />
    </div>
  );
};

export default Progression;