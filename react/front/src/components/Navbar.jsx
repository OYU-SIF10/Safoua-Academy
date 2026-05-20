import { Link } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// ─────────────────────────────────────────────────────────────────────────────
// Navbar universelle — s'adapte selon le rôle et la page active
//
// Props :
//   activePage : 'catalogue' | 'progression' | 'certificats' |
//                'enseignant' | 'admin' | 'home' (défaut)
// ─────────────────────────────────────────────────────────────────────────────

const Navbar = ({ activePage = 'home' }) => {
  const { user, logoutUser, isEtudiant, isEnseignant, isAdmin, isAuthenticated } = useAuth();

  const linkClass = (page) =>
    `text-sm transition-colors ${
      activePage === page
        ? 'text-[#1a7a4a] font-semibold border-b-2 border-[#1a7a4a] pb-0.5'
        : 'text-gray-500 hover:text-[#1a7a4a]'
    }`;

  return (
    <nav className="bg-white border-b border-gray-100 sticky top-0 z-50">
      <div className="max-w-6xl mx-auto px-6 py-4 flex items-center justify-between">

        {/* ── Logo ──────────────────────────────────────────────── */}
        <Link to="/" className="text-2xl font-extrabold text-[#1a7a4a]">
          Safoua Academy
        </Link>

        {/* ── Liens selon le rôle ───────────────────────────────── */}
        <div className="hidden md:flex items-center gap-8">
          {/* Visiteur / Étudiant */}
          {(!isAuthenticated || isEtudiant) && (
            <>
              <Link to="/catalogue" className={linkClass('catalogue')}>Catalogue</Link>
              {isEtudiant && (
                <>
                  <Link to="/progression" className={linkClass('progression')}>Progression</Link>
                  <Link to="/certificats" className={linkClass('certificats')}>Certificats</Link>
                </>
              )}
            </>
          )}

          {/* Enseignant */}
          {isEnseignant && (
            <Link to="/enseignant" className={linkClass('enseignant')}>Espace Enseignant</Link>
          )}

          {/* Admin */}
          {isAdmin && (
            <Link to="/admin" className={linkClass('admin')}>Admin</Link>
          )}

        </div>

        {/* ── Bouton droite ─────────────────────────────────────── */}
        {isAuthenticated ? (
          <div className="flex items-center gap-3">
            <span className="text-sm text-gray-500 hidden md:block">
              {user?.nom} {user?.prenom}
            </span>
            <button
              onClick={logoutUser}
              className="px-5 py-2 bg-[#1a7a4a] hover:bg-[#155f3a] text-white text-sm font-semibold rounded-lg transition-colors"
            >
              Déconnexion
            </button>
          </div>
        ) : (
          <Link
            to="/register"
            className="px-5 py-2 bg-[#1a7a4a] hover:bg-[#155f3a] text-white text-sm font-semibold rounded-lg transition-colors"
          >
            Commencer
          </Link>
        )}
      </div>
    </nav>
  );
};

export default Navbar;