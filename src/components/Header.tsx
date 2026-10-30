import { useEffect, useState } from 'react';
import { Link, NavLink, useNavigate, useLocation } from 'react-router-dom';
import { Menu, X, CalendarCheck, Globe, LayoutDashboard } from 'lucide-react';
import { AnimatePresence, motion } from 'framer-motion';
import Logo from './Logo';
import { useApp } from '../lib/app-context';

export default function Header() {
  const { t, lang, setLang } = useApp();
  const [open, setOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    setOpen(false);
    window.scrollTo(0, 0);
  }, [location.pathname]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 24);
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    document.body.style.overflow = open ? 'hidden' : '';
    return () => {
      document.body.style.overflow = '';
    };
  }, [open]);

  const links = [
    { to: '/', label: t('nav.home') },
    { to: '/leistungen', label: t('nav.services') },
    { to: '/team', label: t('nav.team') },
    { to: '/galerie', label: t('nav.gallery') },
    { to: '/studio', label: t('nav.about') },
    { to: '/kontakt', label: t('nav.contact') },
  ];

  return (
    <header
      className={`fixed inset-x-0 top-0 z-50 transition-all duration-300 ${
        scrolled || open ? 'border-b border-white/5 bg-ink/90 shadow-soft backdrop-blur-xl' : 'bg-transparent'
      }`}
    >
      {/* Fictional demo ticker */}
      <div className="border-b border-copper/15 bg-copper/[0.07] px-3 py-1 text-center text-[9px] font-medium uppercase tracking-[0.18em] text-copper-2/90 sm:text-[10px]">
        {t('demo.banner')}
      </div>

      <div className="mx-auto flex h-14 max-w-7xl items-center justify-between gap-2 px-3 sm:h-16 sm:gap-4 sm:px-6 lg:px-8">
        {/* Logo */}
        <Link to="/" aria-label="Vienna Cuts — Home" className="flex shrink-0 items-center gap-2 sm:gap-2.5">
          <Logo size={34} />
          <span className="flex flex-col leading-none">
            <span className="font-display text-[15px] font-black tracking-tight text-ivory sm:text-lg">
              VIENNA <span className="text-copper">CUTS</span>
            </span>
            <span className="mt-0.5 hidden text-[8px] font-semibold uppercase tracking-[0.3em] text-taupe-2 min-[420px]:block sm:text-[9px]">
              Premium Barber Studio
            </span>
          </span>
        </Link>

        {/* Desktop nav */}
        <nav aria-label="Main" className="hidden items-center gap-5 xl:flex">
          {links.map((l) => (
            <NavLink
              key={l.to}
              to={l.to}
              end={l.to === '/'}
              className={({ isActive }) =>
                `link-sweep text-[13px] font-medium tracking-wide transition-colors ${
                  isActive ? 'text-copper-2' : 'text-ivory-2 hover:text-ivory'
                }`
              }
            >
              {l.label}
            </NavLink>
          ))}
        </nav>

        <div className="flex shrink-0 items-center gap-1 sm:gap-2">
          {/* Language switch */}
          <button
            onClick={() => setLang(lang === 'de' ? 'en' : 'de')}
            aria-label={`${t('common.language')}: ${lang === 'de' ? 'Deutsch' : 'English'} — switch`}
            className="flex h-9 items-center gap-1 rounded-lg border border-white/10 bg-white/[0.03] px-1.5 text-[11px] font-bold tracking-wider text-ivory-2 transition-colors hover:border-copper/50 hover:text-copper-2 sm:px-2.5 sm:text-xs"
          >
            <Globe size={13} className="opacity-80" aria-hidden />
            <span className={lang === 'de' ? 'text-copper-2' : 'opacity-60'}>DE</span>
            <span aria-hidden className="opacity-30">/</span>
            <span className={lang === 'en' ? 'text-copper-2' : 'opacity-60'}>EN</span>
          </button>

          {/* Owner shortcut */}
          <button
            onClick={() => navigate('/inhaber')}
            aria-label={t('nav.owner')}
            title={t('nav.owner')}
            className="hidden h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-ivory-2 transition-colors hover:border-copper/50 hover:text-copper-2 sm:flex"
          >
            <LayoutDashboard size={16} aria-hidden />
          </button>

          {/* Booking CTA */}
          <button
            onClick={() => navigate('/start')}
            className="flex h-9 items-center gap-1.5 rounded-lg bg-copper px-2.5 text-[11px] font-bold uppercase tracking-wide text-ink shadow-[0_8px_24px_-8px] shadow-copper/50 transition-all hover:bg-copper-2 active:scale-95 sm:gap-2 sm:px-4 sm:text-xs"
          >
            <CalendarCheck size={14} aria-hidden />
            <span className="hidden min-[420px]:inline">{t('nav.book')}</span>
            <span className="min-[420px]:hidden">{lang === 'de' ? 'Buchen' : 'Book'}</span>
          </button>

          {/* Hamburger */}
          <button
            onClick={() => setOpen((v) => !v)}
            aria-expanded={open}
            aria-controls="mobile-menu"
            aria-label={t('common.menu')}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-white/10 bg-white/[0.03] text-ivory transition-colors hover:text-copper-2 xl:hidden"
          >
            {open ? <X size={19} aria-hidden /> : <Menu size={19} aria-hidden />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {open && (
          <>
            <motion.div
              key="scrim"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 z-40 bg-black/60 backdrop-blur-sm xl:hidden"
              aria-hidden
            />
            <motion.nav
              key="drawer"
              id="mobile-menu"
              aria-label="Mobile"
              initial={{ opacity: 0, y: -12 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -12 }}
              transition={{ duration: 0.28, ease: [0.22, 1, 0.36, 1] }}
              className="absolute inset-x-0 top-full z-50 border-b border-copper/20 bg-ink-2/98 shadow-card backdrop-blur-2xl xl:hidden"
            >
              <div className="mx-auto grid max-w-7xl grid-cols-2 gap-1 p-4 sm:grid-cols-3">
                {links.map((l) => (
                  <NavLink
                    key={l.to}
                    to={l.to}
                    end={l.to === '/'}
                    className={({ isActive }) =>
                      `flex min-h-[44px] items-center rounded-xl border px-4 py-3 text-sm font-semibold transition-colors ${
                        isActive
                          ? 'border-copper/40 bg-copper/10 text-copper-2'
                          : 'border-white/5 bg-white/[0.02] text-ivory-2 hover:text-ivory'
                      }`
                    }
                  >
                    {l.label}
                  </NavLink>
                ))}
                <button
                  onClick={() => navigate('/inhaber')}
                  className="flex min-h-[44px] items-center gap-2 rounded-xl border border-copper/30 bg-copper/10 px-4 py-3 text-sm font-semibold text-copper-2"
                >
                  <LayoutDashboard size={15} aria-hidden /> {t('nav.owner')}
                </button>
              </div>
            </motion.nav>
          </>
        )}
      </AnimatePresence>
    </header>
  );
}
