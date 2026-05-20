import { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getMyEnrollments } from '../services/api';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentSuccess = () => {
  const [searchParams] = useSearchParams();
  const [loading, setLoading] = useState(true);
  const [enrollments, setEnrollments] = useState([]);

  const sessionId = searchParams.get('session_id');

  useEffect(() => {
    const fetch = async () => {
      try {
        const res = await getMyEnrollments();
        setEnrollments(res.data.data || []);
      } catch (err) {
        console.error('Failed to fetch enrollments:', err);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="w-10 h-10 border-4 border-[#1a7a4a] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">✅</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Paiement réussi !</h1>
          <p className="text-gray-600 mb-6">
            Merci pour votre achat. Vous êtes maintenant inscrit au(x) cours(s).
          </p>
          <div className="bg-[#f0faf4] border border-[#1a7a4a] rounded-lg p-4 mb-6 text-left">
            <p className="text-sm text-gray-600 mb-2">Vos cours :</p>
            <div className="space-y-2">
              {enrollments.length > 0 ? (
                enrollments.slice(0, 3).map((enrollment) => (
                  <div key={enrollment._id} className="text-sm font-medium text-gray-800">
                    • {enrollment.cours_id?.titre}
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500">Chargement...</p>
              )}
            </div>
          </div>
          <Link
            to="/progression"
            className="block w-full bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold py-3 px-4 rounded-lg transition-colors mb-3"
          >
            Voir mes cours
          </Link>
          <Link
            to="/catalogue"
            className="block text-[#1a7a4a] hover:underline font-medium"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
      <Footer simple />
    </div>
  );
};

export default PaymentSuccess;
