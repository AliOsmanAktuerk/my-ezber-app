import { BookOpen, DoorOpen, KeyRound, LogOut, School, ShieldCheck } from 'lucide-react';
import { useState } from 'react';
import { LanguageSelect } from './LanguageSelect';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';
import { ClassroomsPage } from '../pages/ClassroomsPage';
import { CoursesPage } from '../pages/CoursesPage';
import { RoomsPage } from '../pages/RoomsPage';

const navIcons = [ShieldCheck, BookOpen, DoorOpen, School];
const navKeys = ['dashboard', 'courses', 'rooms', 'classrooms'] as const;
type NavKey = (typeof navKeys)[number];

export function AppShell() {
  const { user, logout } = useAuth();
  const { t } = useLanguage();
  const [activeSection, setActiveSection] = useState<NavKey>('dashboard');
  const stats = [
    [t('courses'), '0'],
    [t('rooms'), '0'],
    [t('matches'), '0'],
  ];

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950">
      <div className="mx-auto flex min-h-screen max-w-7xl">
        <aside className="hidden w-64 shrink-0 border-r border-slate-200 bg-white px-4 py-5 lg:block">
          <div className="flex items-center gap-3 px-2">
            <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-emerald-600 text-white">
              <ShieldCheck size={20} aria-hidden="true" />
            </div>
            <div>
              <p className="font-bold">My Ezber App</p>
              <p className="text-xs text-slate-500">{t('protectedArea')}</p>
            </div>
          </div>

          <nav className="mt-8 space-y-1">
            {navKeys.map((navKey, index) => {
              const Icon = navIcons[index];
              const isActive = activeSection === navKey;

              return (
                <button
                  key={navKey}
                  type="button"
                  className={isActive ? 'nav-item nav-item-active' : 'nav-item'}
                  onClick={() => setActiveSection(navKey)}
                >
                  <Icon size={18} aria-hidden="true" />
                  {t(navKey)}
                </button>
              );
            })}
          </nav>
        </aside>

        <section className="flex min-w-0 flex-1 flex-col">
          <header className="sticky top-0 z-40 flex min-h-16 flex-wrap items-center justify-between gap-3 border-b border-slate-200 bg-white/95 px-5 py-3 backdrop-blur">
            <div>
              <p className="text-sm font-semibold text-emerald-700">{t(activeSection)}</p>
              <h1 className="text-lg font-bold">{t('administration')}</h1>
            </div>
            <div className="flex items-center gap-3">
              <LanguageSelect />
              <button className="btn-secondary" type="button" onClick={logout}>
                <LogOut aria-hidden="true" size={18} />
                {t('logout')}
              </button>
            </div>
          </header>

          <nav className="grid grid-cols-4 gap-2 border-b border-slate-200 bg-white px-3 py-2 lg:hidden">
            {navKeys.map((navKey, index) => {
              const Icon = navIcons[index];
              const isActive = activeSection === navKey;

              return (
                <button
                  key={navKey}
                  type="button"
                  className={isActive ? 'mobile-nav-item mobile-nav-item-active' : 'mobile-nav-item'}
                  onClick={() => setActiveSection(navKey)}
                >
                  <Icon size={18} aria-hidden="true" />
                  <span>{t(navKey)}</span>
                </button>
              );
            })}
          </nav>

          {activeSection === 'courses' ? (
            <div className="p-5">
              <CoursesPage />
            </div>
          ) : activeSection === 'rooms' ? (
            <div className="p-5">
              <RoomsPage />
            </div>
          ) : activeSection === 'classrooms' ? (
            <div className="p-5">
              <ClassroomsPage />
            </div>
          ) : (
            <div className="grid gap-5 p-5 lg:grid-cols-[1fr_360px]">
              <section className="space-y-5">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-sm font-medium text-emerald-700">{t('signedIn')}</p>
                  <h2 className="mt-2 text-2xl font-bold">{user?.name}</h2>
                  <p className="mt-1 text-slate-600">{user?.email}</p>
                </div>

                <div className="grid gap-4 sm:grid-cols-3">
                  {stats.map(([label, value]) => (
                    <div key={label} className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                      <p className="text-sm text-slate-500">{label}</p>
                      <p className="mt-2 text-3xl font-bold">{value}</p>
                    </div>
                  ))}
                </div>
              </section>

              <aside className="space-y-4">
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('accountHash')}
                  </p>
                  <p className="mt-3 break-all font-mono text-sm text-slate-800">{user?.accountHash}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <p className="text-xs font-semibold uppercase tracking-[0.14em] text-slate-500">
                    {t('roles')}
                  </p>
                  <p className="mt-3 font-medium">{user?.roles.join(', ')}</p>
                </div>
                <div className="rounded-lg border border-slate-200 bg-white p-5 shadow-sm">
                  <div className="inline-flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100 text-slate-700">
                    <KeyRound size={18} aria-hidden="true" />
                  </div>
                  <p className="mt-3 text-sm text-slate-600">
                    {t('secureRoutesText')}
                  </p>
                </div>
              </aside>
            </div>
          )}
        </section>
      </div>
    </main>
  );
}
