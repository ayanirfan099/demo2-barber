/* ── App-wide context: language (persisted) + toast system ───────────────── */
import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { Lang } from './data';
import { STRINGS } from './i18n';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

interface Toast {
  id: number;
  msg: string;
  kind: 'success' | 'error' | 'info';
}

interface AppContextValue {
  lang: Lang;
  setLang: (l: Lang) => void;
  t: (key: string, vars?: Record<string, string | number>) => string;
  toast: (msg: string, kind?: Toast['kind']) => void;
}

const AppContext = createContext<AppContextValue | null>(null);

export function useApp() {
  const ctx = useContext(AppContext);
  if (!ctx) throw new Error('useApp must be used inside AppProvider');
  return ctx;
}

export function AppProvider({ children }: { children: ReactNode }) {
  const [lang, setLangState] = useState<Lang>(() => {
    try {
      return (localStorage.getItem('vienna-cuts-lang') as Lang) || 'de';
    } catch {
      return 'de';
    }
  });
  const [toasts, setToasts] = useState<Toast[]>([]);

  const setLang = useCallback((l: Lang) => {
    setLangState(l);
    try {
      localStorage.setItem('vienna-cuts-lang', l);
    } catch {
      /* ignore */
    }
    document.documentElement.lang = l;
  }, []);

  useEffect(() => {
    document.documentElement.lang = lang;
  }, [lang]);

  const t = useCallback(
    (key: string, vars?: Record<string, string | number>) => {
      let s = STRINGS[lang][key] ?? STRINGS.de[key] ?? key;
      if (vars) {
        for (const [k, v] of Object.entries(vars)) s = s.replace(`{${k}}`, String(v));
      }
      return s;
    },
    [lang]
  );

  const toast = useCallback((msg: string, kind: Toast['kind'] = 'success') => {
    const id = Date.now() + Math.random();
    setToasts((prev) => [...prev.slice(-2), { id, msg, kind }]);
    window.setTimeout(() => setToasts((prev) => prev.filter((x) => x.id !== id)), 4200);
  }, []);

  return (
    <AppContext.Provider value={{ lang, setLang, t, toast }}>
      {children}
      {/* Toast stack */}
      <div aria-live="polite" className="fixed bottom-5 left-1/2 z-[90] flex w-full max-w-md -translate-x-1/2 flex-col gap-2 px-4">
        {toasts.map((toastItem) => (
          <div
            key={toastItem.id}
            role="status"
            className="animate-fade-up flex items-start gap-3 rounded-xl border border-ink-4 bg-ink-2/95 px-4 py-3 shadow-card backdrop-blur"
          >
            {toastItem.kind === 'success' && <CheckCircle2 size={19} className="mt-0.5 shrink-0 text-emerald-400" />}
            {toastItem.kind === 'error' && <AlertCircle size={19} className="mt-0.5 shrink-0 text-red-400" />}
            {toastItem.kind === 'info' && <Info size={19} className="mt-0.5 shrink-0 text-copper-2" />}
            <p className="text-sm leading-snug text-ivory">{toastItem.msg}</p>
            <button
              onClick={() => setToasts((prev) => prev.filter((x) => x.id !== toastItem.id))}
              aria-label="Dismiss"
              className="ml-auto shrink-0 text-taupe-2 transition-colors hover:text-ivory"
            >
              <X size={16} />
            </button>
          </div>
        ))}
      </div>
    </AppContext.Provider>
  );
}
