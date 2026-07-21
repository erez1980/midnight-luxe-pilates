import React, { useEffect, useState } from 'react';
import { X, UserRound } from 'lucide-react';
import { motion, AnimatePresence } from 'motion/react';
import Button from './ui/Button';
import { BusinessType, ProfileDetails, saveProfileDetails } from '../utils/profile';

interface ProfileSetupProps {
  open: boolean;
  userId: string;
  userName?: string;
  initialDetails?: ProfileDetails | null;
  onClose: () => void;
  onSaved: () => void;
}

const inputClass =
  'w-full rounded-xl bg-background border border-outline/30 px-4 py-3 text-on-surface text-sm focus:outline-none focus:border-secondary transition-colors';

// One-time onboarding form for the details Google login doesn't provide —
// contact and business info needed for customer management and (later)
// invoicing. Dismissible: it must never block actual use of the app.
export default function ProfileSetup({ open, userId, userName, initialDetails, onClose, onSaved }: ProfileSetupProps) {
  const [phone, setPhone] = useState(initialDetails?.phone ?? '');
  const [studioName, setStudioName] = useState(initialDetails?.studioName ?? '');
  const [businessType, setBusinessType] = useState<BusinessType | ''>(initialDetails?.businessType ?? '');
  const [businessId, setBusinessId] = useState(initialDetails?.businessId ?? '');
  const [marketingOptIn, setMarketingOptIn] = useState(initialDetails?.marketingOptIn ?? false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  // Re-sync fields each time the dialog opens — details may have loaded (or
  // been saved) since the component first mounted.
  useEffect(() => {
    if (!open) return;
    setPhone(initialDetails?.phone ?? '');
    setStudioName(initialDetails?.studioName ?? '');
    setBusinessType(initialDetails?.businessType ?? '');
    setBusinessId(initialDetails?.businessId ?? '');
    setMarketingOptIn(initialDetails?.marketingOptIn ?? false);
    setError('');
  }, [open, initialDetails]);

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();
    setSaving(true);
    setError('');
    const result = await saveProfileDetails(userId, {
      phone,
      studioName,
      businessType,
      businessId,
      marketingOptIn,
    });
    setSaving(false);
    if (result.ok) {
      onSaved();
    } else {
      setError('השמירה נכשלה. אפשר לנסות שוב, או לסגור ולהשלים מאוחר יותר.');
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[60] flex items-end sm:items-center justify-center bg-black/60 backdrop-blur-sm p-0 sm:p-6"
        >
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 40 }}
            transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
            className="w-full sm:max-w-lg max-h-[92vh] overflow-y-auto rounded-t-3xl sm:rounded-3xl border border-outline/30 bg-surface-container-high p-6 sm:p-8 shadow-2xl"
          >
            <div className="flex items-start justify-between gap-4 mb-5">
              <div>
                <div className="flex items-center gap-2 text-secondary mb-2">
                  <UserRound className="w-4 h-4" />
                  <span className="text-[11px] font-bold tracking-[0.2em]">השלמת פרופיל</span>
                </div>
                <h2 className="serif-text text-2xl font-bold text-on-surface">
                  {userName ? `נעים להכיר, ${userName.split(' ')[0]}` : 'נעים להכיר'}
                </h2>
                <p className="text-sm text-on-surface-variant mt-1 leading-relaxed">
                  כמה פרטים שיעזרו לנו לנהל את החשבון שלך. הכול אופציונלי — אפשר להשלים גם אחר כך.
                </p>
              </div>
              <button
                type="button"
                onClick={onClose}
                className="shrink-0 p-2 text-on-surface-variant hover:text-on-surface transition-colors"
                aria-label="סגירה"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label htmlFor="profile-phone" className="block text-xs font-bold text-secondary mb-1.5">טלפון</label>
                <input
                  id="profile-phone"
                  type="tel"
                  inputMode="tel"
                  dir="ltr"
                  placeholder="050-0000000"
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  className={`${inputClass} text-left`}
                />
              </div>

              <div>
                <label htmlFor="profile-studio" className="block text-xs font-bold text-secondary mb-1.5">שם הסטודיו / העסק</label>
                <input
                  id="profile-studio"
                  type="text"
                  placeholder="לדוגמה: סטודיו תנועה תל אביב"
                  value={studioName}
                  onChange={(e) => setStudioName(e.target.value)}
                  className={inputClass}
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="profile-business-type" className="block text-xs font-bold text-secondary mb-1.5">סוג עוסק</label>
                  <select
                    id="profile-business-type"
                    value={businessType}
                    onChange={(e) => setBusinessType(e.target.value as BusinessType | '')}
                    className={inputClass}
                  >
                    <option value="">לא רלוונטי / אשלים בהמשך</option>
                    <option value="exempt">עוסק פטור</option>
                    <option value="licensed">עוסק מורשה</option>
                    <option value="company">חברה בע"מ</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="profile-business-id" className="block text-xs font-bold text-secondary mb-1.5">מספר עוסק / ח.פ</label>
                  <input
                    id="profile-business-id"
                    type="text"
                    inputMode="numeric"
                    dir="ltr"
                    value={businessId}
                    onChange={(e) => setBusinessId(e.target.value)}
                    className={`${inputClass} text-left`}
                  />
                </div>
              </div>

              <label className="flex items-start gap-3 rounded-xl border border-outline/20 bg-surface-container p-3.5 cursor-pointer">
                <input
                  type="checkbox"
                  checked={marketingOptIn}
                  onChange={(e) => setMarketingOptIn(e.target.checked)}
                  className="mt-0.5 h-4 w-4 accent-[var(--color-secondary)]"
                />
                <span className="text-xs text-on-surface-variant leading-relaxed">
                  מסכים/ה לקבל עדכונים על תכונות חדשות, תבניות ותוכן מקצועי במייל. אפשר לבטל בכל עת.
                </span>
              </label>

              {error && (
                <div className="rounded-xl border border-rose-500/30 bg-rose-500/10 px-4 py-3 text-xs text-rose-400">
                  {error}
                </div>
              )}

              <div className="flex flex-col-reverse sm:flex-row items-stretch sm:items-center justify-end gap-3 pt-2">
                <Button type="button" variant="ghost" size="md" onClick={onClose} disabled={saving}>
                  אחר כך
                </Button>
                <Button type="submit" variant="primary" size="md" disabled={saving}>
                  {saving ? 'שומר...' : 'שמירת פרטים'}
                </Button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
