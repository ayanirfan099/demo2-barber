import { useCallback, useEffect, useState } from 'react';
import { X, ChevronLeft, ChevronRight, Camera } from 'lucide-react';
import { useApp } from '../lib/app-context';
import { Kicker, DemoNote } from '../components/Shared';

type Cat = 'craft' | 'studio' | 'results';
interface GItem { src: string; cat: Cat; de: string; en: string }

const ITEMS: GItem[] = [
  { src: '/images/gallery-2.jpg', cat: 'craft', de: 'Schere & Kamm — Handwerk am Stuhl 02', en: 'Scissors & comb — craft at chair 02' },
  { src: '/images/gallery-4.jpg', cat: 'craft', de: 'Heißtuch-Ritual vor der Rasur', en: 'Hot towel ritual before the shave' },
  { src: '/images/service-fade.jpg', cat: 'craft', de: 'Skin Fade in Arbeit — Kontur mit der Maschine', en: 'Skin fade in progress — clipper contour' },
  { src: '/images/service-beard.jpg', cat: 'craft', de: 'Bart-Kontur mit dem Trimmer', en: 'Beard contour with the trimmer' },
  { src: '/images/about-atmo.jpg', cat: 'studio', de: 'Die Stühle — Leder, Messing, warmes Licht', en: 'The chairs — leather, brass, warm light' },
  { src: '/images/hero.jpg', cat: 'studio', de: 'Stuhl 01 — im Gespräch mit dem Gast', en: 'Chair 01 — in conversation with the guest' },
  { src: '/images/gallery-3.jpg', cat: 'studio', de: 'Die Theke — Amaro, Tonics & Pflegeprodukte', en: 'The counter — amaro, tonics & care products' },
  { src: '/images/gallery-1.jpg', cat: 'studio', de: 'Werkzeug des Studios — Leder, Stahl, Wachs', en: 'Studio tools — leather, steel, wax' },
  { src: '/images/service-classic.jpg', cat: 'results', de: 'Classic Haircut — das Finish', en: 'Classic Haircut — the finish' },
  { src: '/images/service-combo.jpg', cat: 'results', de: 'Schwarzweisser Kontrast — Hair & Beard', en: 'Black & white contrast — hair & beard' },
  { src: '/images/service-premium.jpg', cat: 'results', de: 'Premium Grooming — der volle Ablauf', en: 'Premium Grooming — the full sequence' },
  { src: '/images/barber-1.jpg', cat: 'results', de: 'Jonas am Stuhl — Master Barber seit 2019', en: 'Jonas at the chair — master barber since 2019' },
];

export default function Gallery() {
  const { t, lang } = useApp();
  const [filter, setFilter] = useState<'all' | Cat>('all');
  const [lightbox, setLightbox] = useState<number | null>(null);

  const visible = ITEMS.map((item, index) => ({ item, index })).filter(({ item }) => filter === 'all' || item.cat === filter);

  const close = useCallback(() => setLightbox(null), []);
  const step = useCallback(
    (dir: 1 | -1) => {
      setLightbox((cur) => (cur === null ? cur : (cur + dir + ITEMS.length) % ITEMS.length));
    },
    []
  );

  useEffect(() => {
    if (lightbox === null) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowRight') step(1);
      else if (e.key === 'ArrowLeft') step(-1);
    };
    window.addEventListener('keydown', onKey);
    document.body.style.overflow = 'hidden';
    return () => {
      window.removeEventListener('keydown', onKey);
      document.body.style.overflow = '';
    };
  }, [lightbox, close, step]);

  const filters: { id: 'all' | Cat; label: string }[] = [
    { id: 'all', label: t('gallery.all') },
    { id: 'craft', label: t('gallery.craft') },
    { id: 'studio', label: t('gallery.studio') },
    { id: 'results', label: t('gallery.results') },
  ];

  return (
    <div className="bg-ink pt-24 sm:pt-28">
      <div className="mx-auto max-w-7xl px-5 pb-16 sm:px-6 sm:pb-20 lg:px-8">
        <Kicker>{t('gallery.kicker')}</Kicker>
        <h1 className="font-display text-5xl font-black tracking-tight text-ivory sm:text-6xl">{t('gallery.title')}</h1>

        {/* Filters */}
        <div className="mt-6 flex flex-wrap gap-2" role="group" aria-label="Filter">
          {filters.map((f) => (
            <button
              key={f.id}
              onClick={() => setFilter(f.id)}
              aria-pressed={filter === f.id}
              className={`flex h-10 items-center rounded-full border px-4 text-xs font-bold uppercase tracking-[0.16em] transition-all ${
                filter === f.id
                  ? 'border-copper bg-copper text-ink shadow-[0_6px_20px_-6px] shadow-copper/50'
                  : 'border-white/12 text-ivory-2 hover:border-copper/50 hover:text-copper-2'
              }`}
            >
              {f.label}
            </button>
          ))}
        </div>

        {/* Masonry-ish grid */}
        <div className="mt-8 columns-2 gap-4 md:columns-3 xl:columns-4 [&>*]:mb-4">
          {visible.map(({ item, index }) => (
            <button
              key={item.src + index}
              onClick={() => setLightbox(index)}
              className="group relative block w-full overflow-hidden rounded-2xl border border-white/8 text-left shadow-soft focus-visible:border-copper"
              aria-label={lang === 'de' ? item.de : item.en}
            >
              <img
                src={item.src}
                alt={lang === 'de' ? item.de : item.en}
                loading="lazy"
                className="img-zoom w-full object-cover"
              />
              <span className="absolute inset-0 flex items-end bg-gradient-to-t from-ink/85 via-transparent to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100">
                <span className="flex items-center gap-2 p-3 text-[11px] font-medium leading-snug text-ivory">
                  <Camera size={13} className="shrink-0 text-copper-2" aria-hidden />
                  {lang === 'de' ? item.de : item.en}
                </span>
              </span>
            </button>
          ))}
        </div>

        <DemoNote text={t('gallery.note')} className="mt-4" />
      </div>

      {/* Lightbox */}
      {lightbox !== null && (
        <div
          role="dialog"
          aria-modal="true"
          aria-label={lang === 'de' ? ITEMS[lightbox].de : ITEMS[lightbox].en}
          className="fixed inset-0 z-[80] flex items-center justify-center bg-ink/95 backdrop-blur-md"
          onClick={close}
        >
          <button onClick={close} aria-label={t('common.close')} className="absolute right-4 top-4 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 text-ivory transition-colors hover:border-copper hover:text-copper-2">
            <X size={20} aria-hidden />
          </button>
          <button onClick={(e) => { e.stopPropagation(); step(-1); }} aria-label="Previous image" className="absolute left-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-ivory transition-colors hover:border-copper hover:text-copper-2 sm:left-5">
            <ChevronLeft size={22} aria-hidden />
          </button>
          <figure className="max-h-[86svh] max-w-5xl px-14 sm:px-20" onClick={(e) => e.stopPropagation()}>
            <img
              key={ITEMS[lightbox].src}
              src={ITEMS[lightbox].src}
              alt={lang === 'de' ? ITEMS[lightbox].de : ITEMS[lightbox].en}
              className="animate-fade-up max-h-[72svh] w-auto rounded-2xl border border-white/10 object-contain shadow-card"
            />
            <figcaption className="mt-3 text-center text-xs text-ivory-3">
              {lang === 'de' ? ITEMS[lightbox].de : ITEMS[lightbox].en}
              <span className="ml-3 text-taupe-2">{lightbox + 1} / {ITEMS.length}</span>
            </figcaption>
          </figure>
          <button onClick={(e) => { e.stopPropagation(); step(1); }} aria-label="Next image" className="absolute right-2 z-10 flex h-11 w-11 items-center justify-center rounded-full border border-white/15 bg-ink/60 text-ivory transition-colors hover:border-copper hover:text-copper-2 sm:right-5">
            <ChevronRight size={22} aria-hidden />
          </button>
        </div>
      )}
    </div>
  );
}
