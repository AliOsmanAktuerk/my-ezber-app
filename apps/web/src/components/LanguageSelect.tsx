import { Languages } from 'lucide-react';
import type { ChangeEvent } from 'react';
import { type Language, languages, useLanguage } from '../features/i18n/LanguageContext';

export function LanguageSelect() {
  const { language, setLanguage, t } = useLanguage();

  function handleChange(event: ChangeEvent<HTMLSelectElement>) {
    setLanguage(event.target.value as Language);
  }

  return (
    <label className="inline-flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-2 text-sm font-semibold text-slate-700 shadow-sm">
      <Languages size={17} aria-hidden="true" />
      <span className="sr-only">{t('language')}</span>
      <select
        aria-label={t('language') as string}
        className="bg-transparent text-sm font-semibold text-slate-700 outline-none"
        value={language}
        onChange={handleChange}
      >
        {languages.map((item) => (
          <option key={item.code} value={item.code}>
            {item.shortLabel}
          </option>
        ))}
      </select>
    </label>
  );
}
