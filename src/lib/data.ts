/* ── Vienna Cuts — domain data (all fictional, demo content) ───────────────── */

export type Lang = 'de' | 'en';

export interface Service {
  id: string;
  img: string;
  price: number;
  duration: number; // minutes
  best: boolean;
  name: Record<Lang, string>;
  desc: Record<Lang, string>;
  includes: Record<Lang, string[]>;
}

export const SERVICES: Service[] = [
  {
    id: 'classic',
    img: '/images/service-classic.jpg',
    price: 35,
    duration: 45,
    best: false,
    name: { de: 'Classic Haircut', en: 'Classic Haircut' },
    desc: {
      de: 'Der zeitlose Herrenschnitt — Beratung, Waschen, Schneiden und präzises Finish mit Schere und Maschine.',
      en: 'The timeless men’s cut — consultation, wash, cut and precision finish with scissors and clippers.',
    },
    includes: {
      de: ['Persönliche Beratung', 'Waschen & Styling', 'Kontur mit Rasiermesser'],
      en: ['Personal consultation', 'Wash & styling', 'Razor-finished contour'],
    },
  },
  {
    id: 'fade',
    img: '/images/service-fade.jpg',
    price: 40,
    duration: 50,
    best: true,
    name: { de: 'Skin Fade', en: 'Skin Fade' },
    desc: {
      de: 'Nahtloser Übergang bis zur Haut — Signature-Fade, Kontur und Finish. Unsere meistgebuchte Technik.',
      en: 'Seamless gradient down to the skin — signature fade, contour and finish. Our most-booked technique.',
    },
    includes: {
      de: ['Skin-Fade-Technik', 'Heißes Kontur-Finish', 'Styling inkl. Produkt'],
      en: ['Skin fade technique', 'Hot contour finish', 'Styling incl. product'],
    },
  },
  {
    id: 'beard',
    img: '/images/service-beard.jpg',
    price: 15,
    duration: 20,
    best: false,
    name: { de: 'Beard Trim', en: 'Beard Trim' },
    desc: {
      de: 'Bart in Form — Trimmen, Konturieren und heißes Finish für ein gepflegtes, klares Erscheinungsbild.',
      en: 'Beard in shape — trim, razor contour and hot finish for a clean, deliberate look.',
    },
    includes: {
      de: ['Formgebung & Trim', 'Rasiermesser-Kontur', 'Warmes Tuch'],
      en: ['Shape & trim', 'Razor contour', 'Warm towel'],
    },
  },
  {
    id: 'combo',
    img: '/images/service-combo.jpg',
    price: 45,
    duration: 60,
    best: false,
    name: { de: 'Haircut & Beard', en: 'Haircut & Beard' },
    desc: {
      de: 'Das komplette Programm — Herrenschnitt plus Bart-Finish. Abgestimmt wie aus einer Hand.',
      en: 'The complete programme — men’s cut plus beard finish. Crafted as one piece, by one hand.',
    },
    includes: {
      de: ['Classic Haircut', 'Beard Trim mit Kontur', 'Styling & Produkt'],
      en: ['Classic Haircut', 'Beard Trim with razor contour', 'Styling & product'],
    },
  },
  {
    id: 'premium',
    img: '/images/service-premium.jpg',
    price: 60,
    duration: 75,
    best: false,
    name: { de: 'Premium Grooming', en: 'Premium Grooming' },
    desc: {
      de: 'Das volle Ritual — Haarschnitt, Bart-Finish, heißes Handtuch und Gesichtsbehandlung in einem Termin.',
      en: 'The full ritual — haircut, beard finish, hot towel and facial treatment in a single appointment.',
    },
    includes: {
      de: ['Haircut & Beard', 'Heißes Handtuch-Ritual', 'Gesichtsreinigung & Maske'],
      en: ['Haircut & Beard', 'Hot towel ritual', 'Facial cleanse & mask'],
    },
  },
];

export interface Barber {
  id: string;
  img: string;
  years: number;
  name: string;
  role: Record<Lang, string>;
  spec: Record<Lang, string>;
  bio: Record<Lang, string>;
}

export const BARBERS: Barber[] = [
  {
    id: 'jonas',
    img: '/images/barber-1.jpg',
    years: 9,
    name: 'Jonas Berger',
    role: { de: 'Inhaber & Master Barber', en: 'Founder & Master Barber' },
    spec: { de: 'Skin Fades & klassische Schnitte', en: 'Skin fades & classic cuts' },
    bio: {
      de: 'Jonas gründete Vienna Cuts aus der Überzeugung, dass ein guter Schnitt ein Gespräch ist. Trainiert in Wien und Mailand, seit 9 Jahren hinter dem Stuhl — bekannt für chirurgisch präzise Fades und Gelassenheit im Stuhl 01.',
      en: 'Jonas founded Vienna Cuts believing a great cut is a conversation. Trained in Vienna and Milan, nine years behind the chair — known for surgical fades and calm, unhurried chair time at Station 01.',
    },
  },
  {
    id: 'marco',
    img: '/images/barber-2.jpg',
    years: 7,
    name: 'Marco Steiner',
    role: { de: 'Senior Barber — Bart & Rasur', en: 'Senior Barber — Beard & Shave' },
    spec: { de: 'Bartdesign & Heißtuch-Rasur', en: 'Beard design & hot-towel shave' },
    bio: {
      de: 'Marco ist der Bart-Flüsterer des Studios. Sein Handwerk: Form, Kontur und die alte Schule der heißen Rasur — mit Wachs, Tüchern und einem Rasiermesser, das er seit der Lehre führt.',
      en: 'Marco is the studio’s beard whisperer. His craft: shape, contour and old-school hot-towel shaves — wax, towels and a straight razor he has carried since his apprenticeship.',
    },
  },
  {
    id: 'david',
    img: '/images/barber-3.jpg',
    years: 4,
    name: 'David Auer',
    role: { de: 'Barber — Moderne Schnitte', en: 'Barber — Modern Cuts' },
    spec: { de: 'Textur, Stufen & Styling', en: 'Texture, layers & styling' },
    bio: {
      de: 'David bringt den modernen Blick: französische Texturschnitte, natürliche Stufen und Styling, das auch zuhause hält. Schnell, ruhig, detailverliebt — besonders bei dickem und widerspenstigem Haar.',
      en: 'David brings the modern eye: French texture crops, natural layers and styling that holds up at home. Fast, calm and detail-obsessed — especially with thick, stubborn hair.',
    },
  },
  {
    id: 'lena',
    img: '/images/barber-4.jpg',
    years: 6,
    name: 'Lena Hofmann',
    role: { de: 'Barber — Herrenstyling', en: 'Barber — Men’s Styling' },
    spec: { de: 'Precision Styling & Pflege', en: 'Precision styling & care' },
    bio: {
      de: 'Lena ist die ruhigste Hand im Studio — Präzisionsschnitte, Herrenstyling und eine Beratung, die ehrlich sagt, was steht und was nicht. Ihre Messlatte: jeder verlässt den Stuhl besser, als er gekommen ist.',
      en: 'Lena has the calmest hands in the studio — precision cuts, men’s styling and advice that honestly says what suits you and what doesn’t. Her bar: everyone leaves the chair better than they arrived.',
    },
  },
];

/* ── Opening hours (Europe/Vienna) ────────────────────────────────────────── */
export const HOURS: { de: string; en: string; open: number | null; close: number | null }[] = [
  { de: 'Montag', en: 'Monday', open: 9, close: 19 },
  { de: 'Dienstag', en: 'Tuesday', open: 9, close: 19 },
  { de: 'Mittwoch', en: 'Wednesday', open: 9, close: 19 },
  { de: 'Donnerstag', en: 'Thursday', open: 9, close: 20 },
  { de: 'Freitag', en: 'Friday', open: 9, close: 20 },
  { de: 'Samstag', en: 'Saturday', open: 10, close: 17 },
  { de: 'Sonntag', en: 'Sunday', open: null, close: null },
];

export type ApptStatus = 'pending' | 'confirmed' | 'completed' | 'canceled';

export interface Appointment {
  id: string;
  serviceId: string;
  barberId: string | 'any';
  dateISO: string; // YYYY-MM-DD
  time: string; // HH:mm
  name: string;
  email: string;
  phone: string;
  note: string;
  status: ApptStatus;
  createdAt: number;
  demoSeed?: boolean;
}

export const getService = (id: string) => SERVICES.find((s) => s.id === id)!;
export const getBarber = (id: string | 'any') => (id === 'any' ? null : BARBERS.find((b) => b.id === id) ?? null);

export const timeToMinutes = (t: string) => {
  const [h, m] = t.split(':').map(Number);
  return h * 60 + m;
};
export const minutesToTime = (mins: number) => {
  const h = Math.floor(mins / 60);
  const m = mins % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}`;
};

/** Current wall-clock parts in Europe/Vienna (DST-aware via Intl). */
export function viennaNow(): { dateISO: string; minutes: number } {
  const now = new Date();
  const parts = new Intl.DateTimeFormat('en-CA', {
    timeZone: 'Europe/Vienna',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    hour12: false,
  }).formatToParts(now);
  const get = (t: string) => parts.find((p) => p.type === t)?.value ?? '00';
  return {
    dateISO: `${get('year')}-${get('month')}-${get('day')}`,
    minutes: Number(get('hour')) % 24 * 60 + Number(get('minute')),
  };
}

export function addDaysISO(baseISO: string, days: number): string {
  const [y, m, d] = baseISO.split('-').map(Number);
  const dt = new Date(Date.UTC(y, m - 1, d + days));
  return dt.toISOString().slice(0, 10);
}
