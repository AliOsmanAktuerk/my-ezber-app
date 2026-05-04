import { useEffect, useState } from 'react';
import { CheckCircle2, Loader2 } from 'lucide-react';
import { Link, useNavigate, useSearchParams } from 'react-router-dom';
import { useAuth } from '../features/auth/AuthContext';
import { useLanguage } from '../features/i18n/LanguageContext';

export function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { confirmEmail } = useAuth();
  const { t } = useLanguage();
  const [message, setMessage] = useState(t('verifyingEmail') as string);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = searchParams.get('token');

    if (!token) {
      setError(t('invalidToken') as string);
      return;
    }

    confirmEmail(token)
      .then(() => {
        setMessage(t('emailVerified') as string);
        window.setTimeout(() => navigate('/app', { replace: true }), 900);
      })
      .catch((err) => setError(err instanceof Error ? err.message : t('genericError')));
  }, [confirmEmail, navigate, searchParams, t]);

  return (
    <main className="grid min-h-screen place-items-center bg-slate-50 px-5 text-slate-950">
      <section className="w-full max-w-md rounded-lg border border-slate-200 bg-white p-6 text-center shadow-sm">
        {error ? (
          <>
            <p className="rounded-lg bg-red-50 p-3 text-sm text-red-700">{error}</p>
            <Link className="btn-secondary mt-5 w-full" to="/login">{t('backToLogin')}</Link>
          </>
        ) : (
          <>
            <div className="mx-auto inline-flex h-12 w-12 items-center justify-center rounded-lg bg-emerald-50 text-emerald-700">
              {message === t('verifyingEmail') ? <Loader2 className="animate-spin" size={22} /> : <CheckCircle2 size={22} />}
            </div>
            <h1 className="mt-4 text-2xl font-bold">{message}</h1>
          </>
        )}
      </section>
    </main>
  );
}
