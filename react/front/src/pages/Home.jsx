import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getCourses } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import CourseCard from '../components/CourseCard';

// ─── Hero ─────────────────────────────────────────────────────────────────
const Hero = () => (
  <section
    className="relative min-h-[85vh] flex items-center"
    style={{
      backgroundImage: `linear-gradient(rgba(0,0,0,0.45), rgba(0,0,0,0.45)),
        url('https://images.unsplash.com/photo-1497633762265-9d179a990aa6?w=1600&q=80')`,
      backgroundSize: 'cover',
      backgroundPosition: 'center',
    }}
  >
    <div className="max-w-6xl mx-auto px-6 py-20">
      <p className="text-white/70 text-xs uppercase tracking-widest mb-4">SAFOUA ACADEMY</p>
      <h1 className="text-5xl md:text-6xl font-extrabold text-white leading-tight mb-4 max-w-xl">
        Maîtrisez le Coran et l'Arabe avec un{' '}
        <span className="text-[#4ade80]">apprentissage intelligent</span>
      </h1>
      <p className="text-white/80 text-lg mb-8 max-w-lg">
        Cours structurés, parcours personnalisé, aide vocale IA et communauté bienveillante.
      </p>
      <div className="flex gap-4 flex-wrap">
        <Link to="/register"
          className="px-6 py-3 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors"
        >Commencer</Link>
        <Link to="/catalogue"
          className="px-6 py-3 bg-white/10 hover:bg-white/20 text-white font-semibold rounded-lg border border-white/30 transition-colors backdrop-blur-sm"
        >Voir les cours</Link>
      </div>
    </div>
  </section>
);

// ─── Avantages ────────────────────────────────────────────────────────────
const avantages = [
  { icon: '⚡', titre: 'Aide Vocale IA',        desc: 'Évaluation instantanée de votre Tajwid et de votre prononciation arabe.' },
  { icon: '❤️', titre: 'Parcours Personnalisé', desc: "L'IA adapte le contenu et le rythme en fonction de vos progrès et lacunes." },
  { icon: '🛡️', titre: 'Environnement Sécurisé', desc: "Connectez-vous avec des enseignants qualifiés dans un espace d'apprentissage protégé." },
];

const Avantages = () => (
  <section className="py-20 bg-white">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-14">Nos Avantages Uniques</h2>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
        {avantages.map((a, i) => (
          <div key={i} className="text-center">
            <div className="w-14 h-14 bg-[#e8f7ef] rounded-full flex items-center justify-center text-2xl mx-auto mb-4">
              {a.icon}
            </div>
            <h3 className="font-bold text-gray-800 mb-2">{a.titre}</h3>
            <p className="text-gray-500 text-sm leading-relaxed">{a.desc}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── Cours Populaires ─────────────────────────────────────────────────────
const CoursPopulaires = ({ courses, loading, error }) => (
  <section className="py-20 bg-[#f0faf4]">
    <div className="max-w-6xl mx-auto px-6">
      <h2 className="text-3xl font-extrabold text-gray-800 text-center mb-14">Nos Cours Populaires</h2>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map((i) => (
            <div key={i} className="bg-white rounded-2xl p-6 animate-pulse">
              <div className="h-6 bg-gray-200 rounded mb-3 w-20"></div>
              <div className="h-5 bg-gray-200 rounded mb-3"></div>
              <div className="h-4 bg-gray-200 rounded w-3/4"></div>
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="text-center py-10">
          <p className="text-red-600 font-semibold mb-4">{error}</p>
          <p className="text-gray-500">Données fictives affichées en attendant la connexion API.</p>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {courses.map((course, i) => (
              <CourseCard key={course._id || i} course={course} variant="compact" />
            ))}
          </div>
          <div className="text-center mt-10">
            <Link to="/catalogue"
              className="px-8 py-3 border-2 border-[#1a7a4a] text-[#1a7a4a] font-semibold rounded-lg hover:bg-[#1a7a4a] hover:text-white transition-colors"
            >Voir tous les cours</Link>
          </div>
        </>
      )}
    </div>
  </section>
);

// ─── Stats ────────────────────────────────────────────────────────────────
const Stats = () => (
  <section className="py-16 bg-[#1a7a4a]">
    <div className="max-w-6xl mx-auto px-6">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center text-white">
        {[
          { val: '1200+', label: 'Étudiants actifs' },
          { val: '45+',   label: 'Cours disponibles' },
          { val: '20+',   label: 'Enseignants qualifiés' },
          { val: '4.8★',  label: 'Note moyenne' },
        ].map((s, i) => (
          <div key={i}>
            <p className="text-4xl font-extrabold mb-1">{s.val}</p>
            <p className="text-white/70 text-sm">{s.label}</p>
          </div>
        ))}
      </div>
    </div>
  </section>
);

// ─── CTA ──────────────────────────────────────────────────────────────────
const CTA = () => (
  <section className="py-20 bg-white text-center">
    <div className="max-w-2xl mx-auto px-6">
      <h2 className="text-3xl font-extrabold text-gray-800 mb-4">
        Prêt à commencer votre voyage ?
      </h2>
      <p className="text-gray-500 mb-8">
        Rejoignez des milliers d'étudiants qui maîtrisent le Coran et la langue arabe avec Safoua Academy.
      </p>
      <Link to="/register"
        className="px-8 py-3 bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold rounded-lg transition-colors"
      >Créer un compte gratuit</Link>
    </div>
  </section>
);

// ─── Page Home ────────────────────────────────────────────────────────────
const Home = () => {
  const [courses, setCourses] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCourses = async () => {
      setLoading(true);
      setError(null);
      try {
        const res = await getCourses({ limit: 3 });
        setCourses(res.data.data || []);
      } catch (err) {
        setError('Impossible de charger les cours depuis l\'API.');
        setCourses([
          { _id: '1', titre: 'Tajwid Avancé',    description: 'Apprenez les règles complexes du Tajwid pour une récitation parfaite.', niveau: 'Expert' },
          { _id: '2', titre: 'Arabe Classique',  description: 'Maîtrisez les bases de la langue arabe classique et moderne.',          niveau: 'Débutant' },
          { _id: '3', titre: 'Fiqh et Usul',     description: 'Introduction aux sciences islamiques fondamentales.',                    niveau: 'Intermédiaire' },
        ]);
      } finally {
        setLoading(false);
      }
    };
    fetchCourses();
  }, []);

  return (
    <div className="min-h-screen">
      <Navbar activePage="home" />
      <Hero />
      <Avantages />
      <CoursPopulaires courses={courses} loading={loading} error={error} />
      <Stats />
      <CTA />
      <Footer simple={false} />
    </div>
  );
};

export default Home;
