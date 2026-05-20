import { useState } from 'react';
import { Link } from 'react-router-dom';
import { LEVEL_COLORS } from '../constants';

const API_BASE = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';
const IMG_BASE = `${API_BASE.replace('/api', '')}/uploads/images`;

// ── Variante par défaut (grille catalogue) ────────────────────────────────
const DefaultCard = ({ course }) => {
  const [imageError, setImageError] = useState(false);
  console.log('CourseCard received course:', course);

  return (
    <Link to={`/cours/${course._id}`} className="group block h-full">
      <div className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-lg transition-all duration-300 h-full flex flex-col">

        {/* Image */}
        <div className="relative h-48 overflow-hidden bg-gray-100 shrink-0">
          {course.image_couverture && !imageError ? (
            <img
              src={`${IMG_BASE}/${course.image_couverture}`}
              alt={course.titre}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#e8f7ef] to-[#bbf7d0] flex items-center justify-center text-5xl">
              📖
            </div>
          )}
          {/* Badge niveau */}
          <span className={`absolute top-3 left-3 text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_COLORS[course.niveau] || 'bg-gray-100 text-gray-600'}`}>
            {course.niveau}
          </span>
          {/* Badge gratuit */}
          {course.est_gratuit && (
            <span className="absolute top-3 right-3 text-xs font-semibold px-2 py-1 rounded-full bg-white text-[#1a7a4a] border border-[#1a7a4a]">
              Gratuit
            </span>
          )}
        </div>

        {/* Contenu */}
        <div className="p-5 flex flex-col flex-1">
          <p className="text-xs text-[#1a7a4a] font-medium mb-1">{course.categorie}</p>
          <h3 className="font-bold text-gray-800 text-base mb-2 line-clamp-2 group-hover:text-[#1a7a4a] transition-colors flex-1">
            {course.titre}
          </h3>
          <p className="text-gray-500 text-sm line-clamp-2 mb-4">{course.description}</p>

          {/* Footer card */}
          <div className="flex items-center justify-between text-xs text-gray-400 pt-3 border-t border-gray-100">
            <span>👥 {course.nombre_inscrits || 0}</span>
            <span>⭐ {course.note_moyenne > 0 ? course.note_moyenne.toFixed(1) : 'Nouveau'}</span>
            {!course.est_gratuit && course.prix > 0 && (
              <span className="font-bold text-gray-700">€{course.prix}</span>
            )}
          </div>
        </div>
      </div>
    </Link>
  );
};

// ── Variante compacte (home page) ─────────────────────────────────────────
const CompactCard = ({ course }) => (
  <div className="bg-white rounded-2xl p-6 shadow-sm hover:shadow-md transition-shadow">
    <div className="flex items-center justify-between mb-3">
      <span className={`text-xs font-semibold px-3 py-1 rounded-full ${LEVEL_COLORS[course.niveau] || 'bg-gray-100 text-gray-600'}`}>
        {course.niveau}
      </span>
      <span className="text-[#1a7a4a] text-lg">📖</span>
    </div>
    <h3 className="font-bold text-gray-800 text-lg mb-2">{course.titre}</h3>
    <p className="text-gray-500 text-sm mb-4 line-clamp-2">{course.description}</p>
    <Link to={`/cours/${course._id}`} className="text-[#1a7a4a] font-semibold text-sm hover:underline">
      Voir le cours →
    </Link>
  </div>
);

// ── Variante horizontale (mes cours étudiant) ─────────────────────────────
const HorizontalCard = ({ course, progression }) => {
  const [imageError, setImageError] = useState(false);

  return (
    <Link to={`/cours/${course._id}`} className="group block">
      <div className="bg-white rounded-xl overflow-hidden shadow-sm hover:shadow-md transition-shadow flex">
        <div className="w-24 h-24 shrink-0 bg-gradient-to-br from-[#e8f7ef] to-[#bbf7d0] flex items-center justify-center text-3xl">
          {course.image_couverture && !imageError ? (
            <img
              src={`${IMG_BASE}/${course.image_couverture}`}
              alt={course.titre}
              onError={() => setImageError(true)}
              className="w-full h-full object-cover"
            />
          ) : '📖'}
        </div>
        <div className="p-4 flex-1">
          <h3 className="font-bold text-gray-800 text-sm mb-1 group-hover:text-[#1a7a4a] transition-colors">
            {course.titre}
          </h3>
          <p className="text-xs text-gray-400 mb-2">{course.categorie} · {course.niveau}</p>
          {progression !== undefined && (
            <div>
              <div className="flex justify-between text-xs text-gray-400 mb-1">
                <span>Progression</span>
                <span className="font-medium text-[#1a7a4a]">{progression}%</span>
              </div>
              <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                <div className="h-full bg-[#1a7a4a] rounded-full transition-all" style={{ width: `${progression}%` }} />
              </div>
            </div>
          )}
        </div>
      </div>
    </Link>
  );
};

// ── Export principal ──────────────────────────────────────────────────────
const CourseCard = ({ course, variant = 'default', progression }) => {
  if (variant === 'compact') return <CompactCard course={course} />;
  if (variant === 'horizontal') return <HorizontalCard course={course} progression={progression} />;
  return <DefaultCard course={course} />;
};

export default CourseCard;
