import { Link } from 'react-router-dom';
import { Code2, HeartHandshake, LockKeyhole, ShieldCheck } from 'lucide-react';
import { HeroTeaser } from '../components/HeroTeaser';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLanguage } from '../features/i18n/LanguageContext';

const featureIcons = [Code2, HeartHandshake, LockKeyhole];

export function PublicHomePage() {
  const { t } = useLanguage();
  const features = t('features');

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur">
        <nav className="mx-auto flex h-16 max-w-7xl items-center justify-between px-5">
          <Link className="inline-flex items-center gap-3 font-bold" to="/">
            <span className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck size={20} aria-hidden="true" />
            </span>
            My Cami classroom
          </Link>
          <div className="flex items-center gap-3">
            <LanguageSelect />
            <Link className="btn-secondary" to="/login">
              <LockKeyhole size={18} aria-hidden="true" />
              {t('login')}
            </Link>
          </div>
        </nav>
      </header>

      <HeroTeaser />

      <section id="features" className="border-t border-slate-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-5 py-10 md:grid-cols-3">
          {features.map(({ title, text }, index) => {
            const Icon = featureIcons[index];

            return (
              <article key={title} className="rounded-lg border border-slate-200 p-5 shadow-sm">
                <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
                  <Icon size={18} aria-hidden="true" />
                </div>
                <h3 className="mt-4 text-lg font-bold">{title}</h3>
                <p className="mt-2 leading-7 text-slate-600">{text}</p>
              </article>
            );
          })}
        </div>
      </section>

      <footer className="border-t border-slate-200 bg-slate-950 text-white">
        <div className="mx-auto grid max-w-7xl gap-8 px-5 py-8 md:grid-cols-[1.3fr_1fr_1fr]">
          <div>
            <div className="inline-flex items-center gap-3 font-bold">
              <span className="inline-flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-600 text-white">
                <ShieldCheck size={18} aria-hidden="true" />
              </span>
              My Cami classroom
            </div>
            <p className="mt-4 max-w-md text-sm leading-7 text-slate-300">
              {t('footerText')}
            </p>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{t('project')}</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <a className="hover:text-white" href="https://opensource.org/license/mit">{t('mitLicense')}</a>
              <a className="hover:text-white" href="#features">{t('contribute')}</a>
              <a className="hover:text-white" href="#features">{t('projectValues')}</a>
            </div>
          </div>

          <div>
            <h2 className="text-sm font-semibold uppercase tracking-[0.16em] text-slate-400">{t('links')}</h2>
            <div className="mt-4 grid gap-2 text-sm text-slate-300">
              <Link className="hover:text-white" to="/login">{t('login')}</Link>
              <a className="hover:text-white" href="http://localhost:8080/swagger-ui.html">{t('swaggerUi')}</a>
              <a className="hover:text-white" href="http://localhost:8080/v3/api-docs">{t('openApiJson')}</a>
            </div>
          </div>
        </div>
        <div className="border-t border-white/10 px-5 py-4">
          <p className="mx-auto max-w-7xl text-sm text-slate-400">
            {t('copyright')}
          </p>
        </div>
      </footer>
    </main>
  );
}
