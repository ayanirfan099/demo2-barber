import { HashRouter, Routes, Route, useLocation } from 'react-router-dom';
import { Suspense, lazy, useEffect } from 'react';
import { AppProvider } from './lib/app-context';
import Header from './components/Header';
import Footer from './components/Footer';
import Home from './pages/Home';
import Services from './pages/Services';
import Team from './pages/Team';
import Gallery from './pages/Gallery';
import About from './pages/About';
import Contact from './pages/Contact';
import Booking from './pages/Booking';
import Owner from './pages/Owner';
import Legal from './pages/Legal';

const OwnerLazy = lazy(() => Promise.resolve({ default: Owner }));
const ChooseBooking = lazy(() => import('./pages/ChooseBooking'));
const AiBooking = lazy(() => import('./pages/AiBooking'));

function ScrollAndTitle() {
  const { pathname } = useLocation();
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [pathname]);
  return null;
}

/* Public header/footer are hidden on the owner dashboard (/inhaber). */
function Shell() {
  const { pathname } = useLocation();
  const isAdmin = pathname === '/inhaber';
  return (
    <>
      <ScrollAndTitle />
      {!isAdmin && <Header />}
      <main className="relative">
        <Suspense fallback={<div className="flex min-h-[100svh] items-center justify-center bg-ink pt-24"><div className="h-9 w-9 animate-spin rounded-full border-2 border-copper/30 border-t-copper" aria-hidden /></div>}>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/leistungen" element={<Services />} />
            <Route path="/team" element={<Team />} />
            <Route path="/galerie" element={<Gallery />} />
            <Route path="/studio" element={<About />} />
            <Route path="/kontakt" element={<Contact />} />
              <Route path="/buchen" element={<Booking />} />
              <Route path="/start" element={<ChooseBooking />} />
              <Route path="/ai" element={<AiBooking />} />
            <Route path="/inhaber" element={<OwnerLazy />} />
            <Route path="/impressum" element={<Legal kind="imprint" />} />
            <Route path="/datenschutz" element={<Legal kind="privacy" />} />
            <Route path="*" element={<Home />} />
          </Routes>
        </Suspense>
      </main>
      {!isAdmin && <Footer />}
    </>
  );
}

export default function App() {
  return (
    <AppProvider>
      <HashRouter>
        <Shell />
      </HashRouter>
    </AppProvider>
  );
}
