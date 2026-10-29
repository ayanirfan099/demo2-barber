import { Link } from 'react-router-dom';
import { MapPin, Phone, Mail, Clock, Scissors } from 'lucide-react';
import Logo from './Logo';
import { useApp } from '../lib/app-context';
import { HOURS } from '../lib/data';

export default function Footer() {
  const { t, lang } = useApp();
  const year = 2026;
  return (
    <footer className="relative border-t border-copper/15 bg-ink-2">
      <div className="dot-grid absolute inset-0 opacity-60" aria-hidden />
      {/* Marquee */}
      <div className="relative overflow-hidden border-b border-white/5 py-2.5" aria-hidden>
        <div className="animate-marquee flex w-max whitespace-nowrap">
          {[0, 1].map((n) => (
            <span key={n} className="flex items-center gap-6 pr-6 text-[11px] font-bold uppercase tracking-[0.35em] text-taupe">
              {Array.from({ length: 6 }).map((_, i) => (
                <span key={i} className="flex items-center gap-6">
                  Vienna Cuts <Scissors size={11} className="text-copper" /> Premium Barber Studio <span className="text-copper">◆</span> Wien
                </span>
              ))}
            </span>
          ))}
        </div>
      </div>

      <div className="relative mx-auto grid max-w-7xl gap-10 px-5 py-12 sm:grid-cols-2 sm:px-6 lg:grid-cols-4 lg:gap-12 lg:px-8 lg:py-16">
        <div>
          <Link to="/" className="flex items-center gap-2.5">
            <Logo size={40} />
            <span className="font-display text-xl font-black text-ivory">
              VIENNA <span className="text-copper">CUTS</span>
            </span>
          </Link>
          <p className="mt-4 max-w-xs text-sm leading-relaxed text-ivory-3/90">{t('footer.tagline')}</p>
          <p className="mt-4 inline-flex items-center gap-2 rounded-full border border-copper/30 bg-copper/10 px-3 py-1 text-[10px] font-bold uppercase tracking-[0.2em] text-copper-2">
            <span className="h-1.5 w-1.5 rounded-full bg-copper" /> {t('footer.fictional')}
          </p>
        </div>

        <nav aria-label="Footer">
          <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-taupe-2">{t('footer.explore')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            {[
              ['/', 'nav.home'], ['/leistungen', 'nav.services'], ['/team', 'nav.team'],
              ['/galerie', 'nav.gallery'], ['/studio', 'nav.about'], ['/buchen', 'nav.book'],
            ].map(([to, key]) => (
              <li key={to}>
                <Link to={to} className="text-ivory-3/90 transition-colors hover:text-copper-2">{t(key)}</Link>
              </li>
            ))}
          </ul>
        </nav>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-taupe-2">{t('footer.contact')}</h3>
          <ul className="mt-3 space-y-2.5 text-sm text-ivory-3/90">
            <li className="flex items-start gap-2"><MapPin size={15} className="mt-0.5 shrink-0 text-copper" aria-hidden />{t('contact.loc')}</li>
            <li className="flex items-center gap-2"><Phone size={15} className="shrink-0 text-copper" aria-hidden />+43 1 234 56 78 <span className="text-[10px] text-taupe-2">({lang === 'de' ? 'Bsp.' : 'example'})</span></li>
            <li className="flex items-center gap-2"><Mail size={15} className="shrink-0 text-copper" aria-hidden />hallo@vienna-cuts-demo.at</li>
            <li className="flex items-start gap-2"><Clock size={15} className="mt-0.5 shrink-0 text-copper" aria-hidden /><span>{HOURS[0][lang]}–{HOURS[4][lang]} 09–20 · {HOURS[5][lang]} 10–17 · {HOURS[6][lang]} {t('contact.closed')}</span></li>
          </ul>
        </div>

        <div>
          <h3 className="text-[11px] font-bold uppercase tracking-[0.28em] text-taupe-2">{t('footer.legal')}</h3>
          <ul className="mt-3 space-y-2 text-sm">
            <li><Link to="/impressum" className="text-ivory-3/90 transition-colors hover:text-copper-2">{t('footer.imprint')}</Link></li>
            <li><Link to="/datenschutz" className="text-ivory-3/90 transition-colors hover:text-copper-2">{t('footer.privacy')}</Link></li>
            <li><Link to="/inhaber" className="text-ivory-3/90 transition-colors hover:text-copper-2">{t('nav.owner')} →</Link></li>
          </ul>
          <p className="mt-4 text-[10px] leading-relaxed text-taupe">{t('footer.note')}</p>
        </div>
      </div>

      <div className="relative border-t border-white/5 py-4 text-center text-[10px] uppercase tracking-[0.22em] text-taupe">
        © {year} Vienna Cuts · {t('footer.rights')}
      </div>
    </footer>
  );
}
