import { Link } from 'react-router-dom';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';

const PaymentCancel = () => {
  return (
    <div className="min-h-screen bg-gray-50 flex flex-col">
      <Navbar />
      <div className="flex-1 flex items-center justify-center px-4">
        <div className="bg-white rounded-2xl shadow-lg p-8 max-w-md w-full text-center">
          <div className="text-6xl mb-4">❌</div>
          <h1 className="text-3xl font-extrabold text-gray-800 mb-2">Paiement annulé</h1>
          <p className="text-gray-600 mb-6">
            Votre paiement a été annulé. Vous pouvez réessayer quand vous le souhaitez.
          </p>
          <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
            <p className="text-sm text-amber-800">
              Si vous avez des questions, veuillez nous contacter via le support.
            </p>
          </div>
          <Link
            to="/catalogue"
            className="block w-full bg-[#1a7a4a] hover:bg-[#155f3a] text-white font-semibold py-3 px-4 rounded-lg transition-colors"
          >
            Retour au catalogue
          </Link>
        </div>
      </div>
      <Footer simple />
    </div>
  );
};

export default PaymentCancel;
