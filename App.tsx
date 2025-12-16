import React from 'react';
import { HashRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { StoreProvider } from './context/StoreContext';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Auth from './pages/Auth';
import SellerDashboard from './pages/SellerDashboard';
import BuyerDashboard from './pages/BuyerDashboard';
import Cart from './pages/Cart';
import Chatbot from './pages/Chatbot';

const App: React.FC = () => {
  return (
    <StoreProvider>
      <Router>
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
          <Navbar />
          <main>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/auth" element={<Auth />} />
              <Route path="/seller-dashboard" element={<SellerDashboard />} />
              <Route path="/buyer-dashboard" element={<BuyerDashboard />} />
              <Route path="/cart" element={<Cart />} />
              <Route path="/ai-assistant" element={<Chatbot />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </Router>
    </StoreProvider>
  );
};

export default App;
