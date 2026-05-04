import { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../features/i18n/LanguageContext';

type GoogleCredentialResponse = {
  credential?: string;
};

type GoogleButtonRenderer = {
  initialize: (options: {
    client_id: string;
    callback: (response: GoogleCredentialResponse) => void;
  }) => void;
  renderButton: (
    parent: HTMLElement,
    options: {
      theme: 'outline';
      size: 'large';
      text: 'continue_with';
      shape: 'rectangular';
      width: string;
    },
  ) => void;
};

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: GoogleButtonRenderer;
      };
    };
  }
}

type GoogleSignInButtonProps = {
  onCredential: (credential: string) => Promise<void>;
  onError: (message: string) => void;
};

const googleClientId = import.meta.env.VITE_GOOGLE_CLIENT_ID as string | undefined;
const googleScriptId = 'google-identity-services';

export function GoogleSignInButton({ onCredential, onError }: GoogleSignInButtonProps) {
  const { t } = useLanguage();
  const buttonRef = useRef<HTMLDivElement | null>(null);
  const [scriptReady, setScriptReady] = useState(false);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!googleClientId) {
      return;
    }

    if (window.google?.accounts?.id) {
      setScriptReady(true);
      return;
    }

    const existingScript = document.getElementById(googleScriptId);

    if (existingScript) {
      existingScript.addEventListener('load', () => setScriptReady(true), { once: true });
      return;
    }

    const script = document.createElement('script');
    script.id = googleScriptId;
    script.src = 'https://accounts.google.com/gsi/client';
    script.async = true;
    script.defer = true;
    script.onload = () => setScriptReady(true);
    script.onerror = () => onError(t('googleLoadError') as string);
    document.head.appendChild(script);
  }, [onError, t]);

  useEffect(() => {
    if (!scriptReady || !googleClientId || !buttonRef.current || !window.google?.accounts?.id) {
      return;
    }

    buttonRef.current.innerHTML = '';
    window.google.accounts.id.initialize({
      client_id: googleClientId,
      callback: async (response) => {
        if (!response.credential) {
          onError(t('googleMissingCredential') as string);
          return;
        }

        setLoading(true);

        try {
          await onCredential(response.credential);
        } finally {
          setLoading(false);
        }
      },
    });
    window.google.accounts.id.renderButton(buttonRef.current, {
      theme: 'outline',
      size: 'large',
      text: 'continue_with',
      shape: 'rectangular',
      width: '100%',
    });
  }, [onCredential, onError, scriptReady, t]);

  if (!googleClientId) {
    return (
      <button className="btn-secondary w-full" disabled type="button">
        {t('googleUnavailable')}
      </button>
    );
  }

  return (
    <div className="space-y-2">
      <div ref={buttonRef} className="min-h-11" />
      {loading && <p className="text-center text-sm text-slate-500">{t('wait')}</p>}
    </div>
  );
}
