import { FormEvent, useState } from 'react';
import { KeyRound } from 'lucide-react';
import { Link, useSearchParams } from 'react-router-dom';
import { resetPassword } from '../api';
import { LanguageSelect } from '../components/LanguageSelect';
import { useLanguage } from '../features/i18n/LanguageContext';

export function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const { t } = useLanguage();
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);
  const token = searchParams.get('token') ?? '';

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    if (!token) {
      setError(t('invalidToken') as string);
      setLoading(false);
      return;
    }

    try {
      await resetPassword({ token, password });
      setNotice(t('passwordResetDone') as string);
      setPassword('');
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 shadow-sm">
        <div className="mb-4 flex justify-end">
          <LanguageSelect />
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm font-semibold text-emerald-700">{t('protectedArea')}</p>
            <h1 className="mt-2 text-2xl font-bold">{t('resetPassword')}</h1>
            <p className="mt-2 text-sm leading-6 text-slate-600">{t('resetPasswordIntro')}</p>
          </div>

          <label className="field">
            {t('password')}
            <input
              required
              minLength={8}
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              placeholder={t('passwordPlaceholder') as string}
            />
          </label>

          {notice && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button className="btn-primary w-full" disabled={loading} type="submit">
            <KeyRound aria-hidden="true" size={18} />
            {loading ? t('wait') : t('resetPassword')}
          </button>

          <Link className="btn-secondary w-full" to="/login">{t('backToLogin')}</Link>
        </form>
      </section>
    </main>
  );
}
