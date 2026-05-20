import { Link } from 'react-router-dom';

// ─────────────────────────────────────────────────────────────────────────────
// Footer universel
// Props :
//   simple : true → juste le copyright (défaut pour les pages internes)
//            false → footer complet avec liens (pour Home)
// ─────────────────────────────────────────────────────────────────────────────

const Footer = ({ simple = false }) => {
  if (simple) {
    return (
      <footer className="bg-gray-900 text-white/60 text-sm text-center py-6">
        © 2026 Safoua Academy. Tous droits réservés.
      </footer>
    );
  }

  return (
    <footer className="bg-gray-900 text-white">
      <div className="max-w-6xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">

          {/* Brand */}
          <div className="md:col-span-2">
            <h3 className="text-xl font-extrabold text-white mb-3">Safoua Academy</h3>
            <p className="text-white/50 text-sm leading-relaxed max-w-xs">
              Plateforme d'apprentissage du Coran, de la langue arabe et des sciences islamiques avec IA intégrée.
            </p>
          </div>

          {/* Liens rapides */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">Plateforme</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li><Link to="/catalogue" className="hover:text-white transition-colors">Catalogue des cours</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">S'inscrire</Link></li>
              <li><Link to="/login" className="hover:text-white transition-colors">Se connecter</Link></li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="text-sm font-semibold text-white/80 mb-3 uppercase tracking-wide">Contact</h4>
            <ul className="space-y-2 text-sm text-white/50">
              <li>support@safoua.com</li>
              <li>Disponible 7j/7</li>
            </ul>
          </div>
        </div>

        {/* Copyright */}
        <div className="border-t border-white/10 pt-6 text-center text-white/40 text-sm">
          © 2026 Safoua Academy. Tous droits réservés.
        </div>
      </div>
    </footer>
  );
};

export default Footer;