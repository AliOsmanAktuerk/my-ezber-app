import { FormEvent, useState } from 'react';
import { KeyRound, LogIn, Mail, UserPlus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { AuthResponse, forgotPassword, resendVerification } from '../api';
import { GoogleSignInButton } from '../components/GoogleSignInButton';
import { LanguageSelect } from '../components/LanguageSelect';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

type Mode = 'login' | 'register' | 'forgot';

export function LoginPage() {
  const navigate = useNavigate();
  const { signIn, signUp, signInWithGoogle } = useAuth();
  const { t } = useLanguage();
  const [mode, setMode] = useState<Mode>('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [notice, setNotice] = useState('');
  const [loading, setLoading] = useState(false);

  function changeMode(nextMode: Mode) {
    setMode(nextMode);
    setError('');
    setNotice('');
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setLoading(true);
    setError('');
    setNotice('');

    try {
      if (mode === 'forgot') {
        const response = await forgotPassword({ email: form.email });
        setNotice(response.message);
        return;
      }

      const response: AuthResponse = mode === 'login'
        ? await signIn({ email: form.email, password: form.password })
        : await signUp(form);

      if (response.token) {
        setForm({ name: '', email: '', password: '' });
        navigate('/app', { replace: true });
      } else if (mode === 'register') {
        setNotice(t('registrationNeedsVerification') as string);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    } finally {
      setLoading(false);
    }
  }

  async function handleGoogleCredential(credential: string) {
    setError('');
    setNotice('');

    try {
      const response = await signInWithGoogle({ credential });

      if (response.token) {
        setForm({ name: '', email: '', password: '' });
        navigate('/app', { replace: true });
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : t('genericError'));
    }
  }

  async function handleResendVerification() {
    setLoading(true);
    setError('');
    setNotice('');

    try {
      const response = await resendVerification({ email: form.email });
      setNotice(response.message || (t('verificationSent') as string));
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

        <div className="flex rounded-lg bg-slate-100 p-1">
          <button
            className={`segmented ${mode === 'login' || mode === 'forgot' ? 'segmented-active' : ''}`}
            type="button"
            onClick={() => changeMode('login')}
          >
            <LogIn aria-hidden="true" size={16} />
            {t('login')}
          </button>
          <button
            className={`segmented ${mode === 'register' ? 'segmented-active' : ''}`}
            type="button"
            onClick={() => changeMode('register')}
          >
            <UserPlus aria-hidden="true" size={16} />
            {t('register')}
          </button>
        </div>

        <form className="mt-6 space-y-5" onSubmit={handleSubmit}>
          <div>
            <p className="text-sm font-semibold text-emerald-700">{t('protectedArea')}</p>
            <h1 className="mt-2 text-2xl font-bold">
              {mode === 'forgot' ? t('resetPassword') : mode === 'login' ? t('signIn') : t('createAccount')}
            </h1>
            {mode === 'forgot' && (
              <p className="mt-2 text-sm leading-6 text-slate-600">{t('forgotPasswordIntro')}</p>
            )}
          </div>

          {mode === 'register' && (
            <label className="field">
              {t('name')}
              <input
                required
                maxLength={80}
                minLength={2}
                pattern="[A-Za-zÀ-ž0-9 ._'\-]+"
                value={form.name}
                onChange={(event) => setForm({ ...form, name: event.target.value })}
                placeholder="Max Mustermann"
              />
            </label>
          )}

          <label className="field">
            {t('email')}
            <input
              required
              type="email"
              value={form.email}
              onChange={(event) => setForm({ ...form, email: event.target.value })}
              placeholder="max@example.com"
            />
          </label>

          {mode !== 'forgot' && (
            <label className="field">
              {t('password')}
              <input
                required
                minLength={8}
                type="password"
                value={form.password}
                onChange={(event) => setForm({ ...form, password: event.target.value })}
                placeholder={t('passwordPlaceholder') as string}
              />
            </label>
          )}

          {notice && <p className="rounded-lg bg-emerald-50 p-3 text-sm text-emerald-700">{notice}</p>}
          {error && <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button className="btn-primary w-full" disabled={loading} type="submit">
            {mode === 'forgot' ? <Mail aria-hidden="true" size={18} /> : <KeyRound aria-hidden="true" size={18} />}
            {loading
              ? t('wait')
              : mode === 'forgot'
                ? t('sendResetLink')
                : mode === 'login'
                  ? t('signIn')
                  : t('registerAction')}
          </button>

          <div className="flex flex-wrap items-center justify-between gap-3 text-sm">
            {mode === 'login' && (
              <button className="font-semibold text-emerald-700 hover:text-emerald-800" type="button" onClick={() => changeMode('forgot')}>
                {t('forgotPassword')}
              </button>
            )}
            {mode === 'forgot' && (
              <button className="font-semibold text-emerald-700 hover:text-emerald-800" type="button" onClick={() => changeMode('login')}>
                {t('backToLogin')}
              </button>
            )}
            {mode === 'register' && (
              <button
                className="font-semibold text-emerald-700 hover:text-emerald-800 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={loading || !form.email}
                type="button"
                onClick={handleResendVerification}
              >
                {t('resendVerification')}
              </button>
            )}
          </div>
        </form>

        {mode !== 'forgot' && (
          <>
            <div className="my-5 flex items-center gap-3 text-sm text-slate-500">
              <span className="h-px flex-1 bg-slate-200" />
              {t('or')}
              <span className="h-px flex-1 bg-slate-200" />
            </div>

            <GoogleSignInButton
              onCredential={handleGoogleCredential}
              onError={(message) => setError(message)}
            />
          </>
        )}
      </section>
    </main>
  );
}
