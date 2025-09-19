import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { useLocation } from 'react-router-dom';
import Header from './components/Header';
import Hero from './components/Hero';
import TrustBanner from './components/TrustBanner';
import Statistics from './components/Statistics';
import Actions from './components/Actions';
import Team from './components/Team';
import News from './components/News';
import Contact from './components/Contact';
import Footer from './components/Footer';
import AboutPage from './pages/AboutPage';
import ContactPage from './pages/ContactPage';
import MediathequePage from './pages/MediathequePage';
import MediaViewerPage from './pages/MediaViewerPage';
import TeamPage from './pages/TeamPage';
import ActionsPage from './pages/ActionsPage';
import NewsletterAdminPage from './pages/NewsletterAdminPage';
import CookieConsent from './components/CookieConsent';
import CookiePolicyPage from './pages/CookiePolicyPage';
import MediathequeAdminPage from './pages/MediathequeAdminPage';
import AdminDashboard from './pages/AdminDashboard';
import UnsubscribePage from './pages/UnsubscribePage';

const HomePage = () => (
  <>
    <Hero />
    <TrustBanner />
    <Statistics />
    <Actions />
    <Team />
    <News />
    <Contact />
  </>
);

const AppContent = () => {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <div className="min-h-screen">
      {!isAdminRoute && <Header />}
      <main>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/about" element={<AboutPage />} />
          <Route path="/actions" element={<ActionsPage />} />
          <Route path="/team" element={<TeamPage />} />
          <Route path="/contact" element={<ContactPage />} />
          <Route path="/mediatheque" element={<MediathequePage />} />
          <Route path="/mediatheque/:id" element={<MediaViewerPage />} />
          <Route path="/admin/newsletter" element={<NewsletterAdminPage />} />
          <Route path="/cookies" element={<CookiePolicyPage />} />
          <Route path="/admin/mediatheque" element={<MediathequeAdminPage />} />
          <Route path="/unsubscribe" element={<UnsubscribePage />} />
          <Route path="/admin" element={<Navigate to="/admin/mediatheque" replace />} />
          {/* Redirection pour les anciennes URLs ou erreurs */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
      {!isAdminRoute && <Footer />}
      {!isAdminRoute && <CookieConsent />}
    </div>
  );
};

function App() {
  return (
    <Router basename="/">
      <AppContent />
    </Router>
  );
}

export default App;