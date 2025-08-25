import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
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
import TeamPage from './pages/TeamPage';
import ActionsPage from './pages/ActionsPage';
import ChatBot from './components/ChatBot';
import NewsletterAdminPage from './pages/NewsletterAdminPage';
import CookieConsent from './components/CookieConsent';
import CookiePolicyPage from './pages/CookiePolicyPage';

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

function App() {
  return (
    <Router basename="/">
      <div className="min-h-screen">
        <Header />
        <main>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/actions" element={<ActionsPage />} />
            <Route path="/team" element={<TeamPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/mediatheque" element={<MediathequePage />} />
            <Route path="/admin/newsletter" element={<NewsletterAdminPage />} />
            <Route path="/cookies" element={<CookiePolicyPage />} />
            {/* Redirection pour les anciennes URLs ou erreurs */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </main>
        <Footer />
        <ChatBot />
        <CookieConsent />
      </div>
    </Router>
  );
}

export default App;