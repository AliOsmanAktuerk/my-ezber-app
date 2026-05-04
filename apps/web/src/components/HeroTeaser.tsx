import { ArrowRight, CheckCircle2, UsersRound } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useLanguage } from '../features/i18n/LanguageContext';

export function HeroTeaser() {
  const { t } = useLanguage();
  const checks = t('checks');
  const previewCards = t('previewCards');

  return (
    <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-7xl items-center gap-10 px-5 py-12 lg:grid-cols-[1.1fr_0.9fr]">
      <div className="max-w-3xl space-y-7">
        <p className="text-sm font-semibold uppercase tracking-[0.18em] text-emerald-700">
          {t('landingKicker')}
        </p>
        <div className="space-y-5">
          <h1 className="text-5xl font-bold tracking-normal text-slate-950 sm:text-6xl">
            My Cami classroom
          </h1>
          <p className="max-w-2xl text-xl leading-9 text-slate-700">
            {t('landingIntro')}
          </p>
        </div>

        <div className="flex flex-col gap-3 sm:flex-row">
          <Link className="btn-primary" to="/login">
            {t('joinOrLogin')}
            <ArrowRight size={18} aria-hidden="true" />
          </Link>
          <a className="btn-secondary" href="http://localhost:8080/swagger-ui.html">
            {t('viewApi')}
          </a>
        </div>

        <div className="grid gap-3 sm:grid-cols-3">
          {checks.map((item) => (
            <div key={item} className="flex items-center gap-2 rounded-lg border border-slate-200 bg-white p-3 shadow-sm">
              <CheckCircle2 className="shrink-0 text-emerald-600" size={18} aria-hidden="true" />
              <p className="text-sm font-semibold text-slate-700">{item}</p>
            </div>
          ))}
        </div>
      </div>

      <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
        <div className="rounded-lg bg-slate-950 p-5 text-white">
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <div>
              <p className="text-sm text-emerald-300">{t('projectOverview')}</p>
              <h2 className="mt-1 text-2xl font-bold">{t('community')}</h2>
            </div>
            <UsersRound size={24} aria-hidden="true" />
          </div>

          <div className="mt-5 grid gap-3">
            {previewCards.map(([label, text]) => (
              <div key={label} className="rounded-lg bg-white/10 p-4">
                <p className="font-semibold">{label}</p>
                <p className="mt-1 text-sm text-slate-300">{text}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
