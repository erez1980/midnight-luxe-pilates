import React, { useEffect, useMemo, useState } from 'react';
import { AlertTriangle, ChevronDown, Copy, Loader2, LogIn, Search, Trash2 } from 'lucide-react';
import { supabase, supabaseEnabled } from '../lib/supabase';
import { isGalleryAdmin } from '../utils/gallery';
import Button from './ui/Button';

// Rotem's client list (/app/?page=clients): every person who filled the online
// health declaration (/health/), newest first, with their declarations.
// Access is enforced by the database (RLS: public.is_gallery_admin()).

interface ClientRow {
  id: string;
  full_name: string;
  phone: string;
  birth_date: string | null;
  email: string | null;
  emergency_name: string | null;
  emergency_phone: string | null;
  last_declaration_at: string | null;
  created_at: string;
}

interface DeclarationRow {
  id: string;
  client_id: string;
  submitted_at: string;
  answers: { id: string; question: string; answer: 'yes' | 'no' | 'na'; details: string }[];
  has_flags: boolean;
  personal: { full_name: string; birth_date: string; email: string; emergency_name: string; emergency_phone: string };
  guardian_name: string | null;
  signature_png: string;
}

const FORM_LINK = 'https://rkpilatestudio.com/health/';
const ANSWER: Record<string, string> = { yes: 'כן', no: 'לא', na: 'לא רלוונטי' };
const date = (iso: string) => new Intl.DateTimeFormat('he-IL', { dateStyle: 'medium' }).format(new Date(iso));
const phone = (p: string) => (p.length === 10 ? `${p.slice(0, 3)}-${p.slice(3)}` : p);
const yearsOld = (birth: string | null) => {
  if (!birth) return null;
  const b = new Date(birth);
  const now = new Date();
  let age = now.getFullYear() - b.getFullYear();
  if (now < new Date(now.getFullYear(), b.getMonth(), b.getDate())) age--;
  return age;
};
// A declaration older than a year should be renewed.
const isStale = (iso: string | null) => !iso || Date.now() - new Date(iso).getTime() > 365 * 24 * 3600 * 1000;

export default function ClientsAdmin({ email, onGoogleLogin }: { email?: string | null; onGoogleLogin: () => void }) {
  const [clients, setClients] = useState<ClientRow[]>([]);
  const [declarations, setDeclarations] = useState<DeclarationRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [query, setQuery] = useState('');
  const [open, setOpen] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const admin = isGalleryAdmin(email);

  const load = async () => {
    if (!supabase) return;
    setLoading(true);
    const [c, d] = await Promise.all([
      supabase.from('clients').select('*').order('last_declaration_at', { ascending: false, nullsFirst: false }),
      supabase.from('health_declarations').select('*').order('submitted_at', { ascending: false }),
    ]);
    if (c.error || d.error) setError(`לא ניתן לטעון את הלקוחות: ${(c.error || d.error)!.message}`);
    setClients((c.data as ClientRow[]) || []);
    setDeclarations((d.data as DeclarationRow[]) || []);
    setLoading(false);
  };

  useEffect(() => {
    if (admin) load();
    else setLoading(false);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [admin]);

  const byClient = useMemo(() => {
    const map: Record<string, DeclarationRow[]> = {};
    for (const d of declarations) (map[d.client_id] ||= []).push(d);
    return map;
  }, [declarations]);

  const shown = clients.filter((c) => {
    const q = query.trim();
    return !q || c.full_name.includes(q) || c.phone.includes(q.replace(/\D/g, '') || '§');
  });

  const remove = async (c: ClientRow) => {
    if (!supabase) return;
    if (!window.confirm(`למחוק את ${c.full_name} ואת כל הצהרות הבריאות שלה? אי אפשר לבטל.`)) return;
    const { error: delError } = await supabase.from('clients').delete().eq('id', c.id);
    if (delError) setError(`המחיקה נכשלה: ${delError.message}`);
    else load();
  };

  const copyLink = async () => {
    try {
      await navigator.clipboard.writeText(FORM_LINK);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      window.prompt('הקישור לטופס:', FORM_LINK);
    }
  };

  if (!supabaseEnabled) return <p className="py-20 text-center text-on-surface-variant">Supabase לא מוגדר בסביבה הזו.</p>;
  if (!email) {
    return (
      <div className="max-w-md mx-auto py-20 text-center space-y-4">
        <h1 className="serif-text text-3xl text-ink">הלקוחות שלי</h1>
        <p className="text-on-surface-variant">צריך להתחבר כדי לראות את הצהרות הבריאות.</p>
        <Button onClick={onGoogleLogin}>
          <LogIn className="w-4 h-4" /> התחברות עם Google
        </Button>
      </div>
    );
  }
  if (!admin) return <p className="py-20 text-center text-on-surface-variant">אין לחשבון הזה גישה לרשימת הלקוחות.</p>;

  return (
    <div className="max-w-[960px] mx-auto px-4 md:px-8 py-8 space-y-6">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="serif-text text-3xl text-ink">הלקוחות שלי</h1>
          <p className="text-on-surface-variant text-sm mt-1">כל מי שמילא הצהרת בריאות באתר. {clients.length} לקוחות.</p>
        </div>
        <button
          onClick={copyLink}
          className="inline-flex items-center gap-2 rounded-full border border-line px-4 py-2 text-sm hover:border-secondary hover:text-secondary transition-colors cursor-pointer"
        >
          <Copy className="w-4 h-4" /> {copied ? 'הקישור הועתק' : 'העתקת קישור לטופס ללקוחה חדשה'}
        </button>
      </div>

      <label className="relative block">
        <Search className="w-4 h-4 absolute right-4 top-1/2 -translate-y-1/2 text-on-surface-variant" />
        <input
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="חיפוש לפי שם או טלפון"
          className="w-full rounded-2xl border border-line bg-white/80 pr-11 pl-4 py-3 focus:outline-none focus:ring-2 focus:ring-secondary/20"
        />
      </label>

      {error && <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm text-red-800">{error}</p>}
      {loading ? (
        <div className="py-16 flex justify-center"><Loader2 className="w-6 h-6 animate-spin text-on-surface-variant" /></div>
      ) : shown.length === 0 ? (
        <p className="py-16 text-center text-on-surface-variant">{clients.length ? 'לא נמצאו לקוחות.' : 'עדיין אין הצהרות. שלחי ללקוחות את הקישור לטופס.'}</p>
      ) : (
        <ul className="space-y-3">
          {shown.map((c) => {
            const decls = byClient[c.id] || [];
            // Any declaration with a "yes" keeps the badge: a later all-"no"
            // form does not erase what was declared before.
            const flagged = decls.some((d) => d.has_flags);
            const expanded = open === c.id;
            const age = yearsOld(c.birth_date);
            return (
              <li key={c.id} className="rounded-2xl border border-line bg-white/70">
                <button
                  onClick={() => setOpen(expanded ? null : c.id)}
                  aria-expanded={expanded}
                  className="w-full flex items-center gap-3 p-4 text-right cursor-pointer"
                >
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-medium text-ink">{c.full_name}</span>
                      {flagged && (
                        <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2.5 py-0.5 text-xs text-amber-900">
                          <AlertTriangle className="w-3 h-3" /> יש הערות בריאות
                        </span>
                      )}
                      {isStale(c.last_declaration_at) && (
                        <span className="rounded-full bg-surface-container px-2.5 py-0.5 text-xs text-on-surface-variant">הצהרה מעל שנה</span>
                      )}
                    </div>
                    <p className="text-sm text-on-surface-variant mt-0.5">
                      <span dir="ltr">{phone(c.phone)}</span>
                      {age !== null && ` · גיל ${age}`}
                      {c.last_declaration_at && ` · הצהרה אחרונה ${date(c.last_declaration_at)}`}
                    </p>
                  </div>
                  <ChevronDown className={`w-5 h-5 text-on-surface-variant transition-transform ${expanded ? 'rotate-180' : ''}`} />
                </button>

                {expanded && (
                  <div className="border-t border-line p-4 space-y-5 text-sm">
                    <dl className="grid gap-x-6 gap-y-1 sm:grid-cols-2">
                      <div><dt className="inline text-on-surface-variant">טלפון: </dt><dd className="inline"><a dir="ltr" href={`tel:${c.phone}`} className="text-secondary">{phone(c.phone)}</a></dd></div>
                      {c.email && <div><dt className="inline text-on-surface-variant">מייל: </dt><dd className="inline">{c.email}</dd></div>}
                      {c.birth_date && <div><dt className="inline text-on-surface-variant">תאריך לידה: </dt><dd className="inline">{date(c.birth_date)}</dd></div>}
                      {c.emergency_name && (
                        <div><dt className="inline text-on-surface-variant">חירום: </dt><dd className="inline">{c.emergency_name}, <a dir="ltr" href={`tel:${c.emergency_phone}`} className="text-secondary">{phone(c.emergency_phone || '')}</a></dd></div>
                      )}
                    </dl>

                    {decls.map((d, i) => (
                      <section key={d.id} className="rounded-xl bg-surface-container-lowest border border-line p-4">
                        <h3 className="font-medium text-ink">
                          הצהרה מ-{date(d.submitted_at)}{i === 0 && decls.length > 1 ? ' (האחרונה)' : ''}
                          {d.guardian_name && <span className="font-normal text-on-surface-variant"> · נחתם ע״י {d.guardian_name}</span>}
                        </h3>
                        {d.personal && (d.personal.full_name !== c.full_name || d.personal.emergency_phone !== c.emergency_phone || d.personal.birth_date !== c.birth_date) && (
                          <p className="mt-2 rounded-lg bg-amber-50 px-3 py-2 text-amber-900">
                            הפרטים בהצהרה הזו שונים מהרשומה: {d.personal.full_name}, תאריך לידה {d.personal.birth_date}, חירום {d.personal.emergency_name} <span dir="ltr">{phone(d.personal.emergency_phone)}</span>
                            {d.personal.email && `, ${d.personal.email}`}. כדאי לוודא מול הלקוחה.
                          </p>
                        )}
                        <ol className="mt-3 space-y-2 list-decimal pr-5">
                          {d.answers.map((a) => (
                            <li key={a.id}>
                              <span className="text-on-surface-variant">{a.question}</span>{' '}
                              <strong className={a.answer === 'yes' ? 'text-amber-800' : 'text-ink'}>{ANSWER[a.answer]}</strong>
                              {a.details && <span> — {a.details}</span>}
                            </li>
                          ))}
                        </ol>
                        <img src={d.signature_png} alt={`חתימה של ${c.full_name}`} className="mt-4 h-20 w-auto rounded-lg border border-line bg-white" />
                      </section>
                    ))}

                    <button onClick={() => remove(c)} className="inline-flex items-center gap-1.5 text-red-700 hover:underline cursor-pointer">
                      <Trash2 className="w-4 h-4" /> מחיקת הלקוחה וכל ההצהרות
                    </button>
                  </div>
                )}
              </li>
            );
          })}
        </ul>
      )}
    </div>
  );
}
