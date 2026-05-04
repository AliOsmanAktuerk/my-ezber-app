import { createContext, useContext, useMemo, useState, type PropsWithChildren } from 'react';

export type Language = 'de' | 'en' | 'tr';

const storageKey = 'my-cami.language';

export const languages: Array<{ code: Language; label: string; shortLabel: string }> = [
  { code: 'de', label: 'Deutsch', shortLabel: 'DE' },
  { code: 'en', label: 'English', shortLabel: 'EN' },
  { code: 'tr', label: 'Türkçe', shortLabel: 'TR' },
];

const translations = {
  de: {
    language: 'Sprache',
    login: 'Login',
    register: 'Registrierung',
    registerAction: 'Registrieren',
    protectedArea: 'Geschützter Bereich',
    signIn: 'Einloggen',
    createAccount: 'Konto erstellen',
    name: 'Name',
    email: 'E-Mail',
    password: 'Passwort',
    passwordPlaceholder: 'Mindestens 8 Zeichen',
    wait: 'Bitte warten',
    genericError: 'Ein Fehler ist aufgetreten',
    or: 'oder',
    googleUnavailable: 'Google Login ist noch nicht konfiguriert',
    googleLoadError: 'Google Login konnte nicht geladen werden',
    googleMissingCredential: 'Google hat kein Login-Token zurückgegeben',
    forgotPassword: 'Passwort vergessen?',
    resetPassword: 'Passwort zurücksetzen',
    sendResetLink: 'Reset-Link senden',
    backToLogin: 'Zurück zum Login',
    registrationNeedsVerification: 'Dein Konto wurde erstellt. Bitte bestätige deine E-Mail-Adresse über den Link, den wir dir geschickt haben.',
    resendVerification: 'Bestätigungslink erneut senden',
    verificationSent: 'Wenn die E-Mail existiert und noch nicht bestätigt ist, wurde ein neuer Link versendet',
    forgotPasswordIntro: 'Gib deine E-Mail-Adresse ein. Wenn ein bestätigtes Konto existiert, senden wir dir einen Reset-Link.',
    resetPasswordIntro: 'Vergib ein neues Passwort für dein Konto.',
    emailVerified: 'E-Mail bestätigt. Du wirst angemeldet.',
    verifyingEmail: 'E-Mail wird bestätigt',
    invalidToken: 'Der Link ist ungültig oder fehlt',
    passwordResetDone: 'Passwort wurde aktualisiert. Du kannst dich jetzt einloggen.',
    dashboard: 'Dashboard',
    administration: 'Verwaltung',
    logout: 'Abmelden',
    signedIn: 'Angemeldet',
    courses: 'Kurse',
    rooms: 'Räume',
    users: 'Nutzer',
    matches: 'Matches',
    roles: 'Rollen',
    accountHash: 'Account Hash',
    secureRoutesText: 'Alle Verwaltungsrouten sind durch JWT geschützt und nur mit aktiver Sitzung erreichbar.',
    landingKicker: 'Open Source Lernverwaltung',
    landingIntro:
      'Eine freie Verwaltungsoberfläche für Kurse, Räume, Accounts und Berechtigungen. My Ezber App wird ehrenamtlich gepflegt und ist als gemeinschaftliches Open-Source-Projekt angelegt.',
    joinOrLogin: 'Mitmachen oder anmelden',
    viewApi: 'API ansehen',
    projectOverview: 'Projektübersicht',
    community: 'Gemeinschaft',
    footerText: 'Ein ehrenamtlich verwaltetes Open-Source-Projekt für Lern- und Kursverwaltung.',
    project: 'Projekt',
    links: 'Links',
    mitLicense: 'MIT Lizenz',
    contribute: 'Mitmachen',
    projectValues: 'Projektwerte',
    swaggerUi: 'Swagger UI',
    openApiJson: 'OpenAPI JSON',
    copyright: '© 2026 My Ezber App contributors. Frei nutzbar unter MIT-Lizenz.',
    checks: ['Open Source', 'Ehrenamtlich verwaltet', 'Swagger-dokumentierte REST API'],
    features: [
      {
        title: 'Offen mitentwickeln',
        text: 'Code, API und Projektstruktur sind nachvollziehbar und für Beiträge vorbereitet.',
      },
      {
        title: 'Ehrenamtlich betreut',
        text: 'Das Projekt wird gemeinschaftlich gepflegt und soll Bildung praktisch unterstützen.',
      },
      {
        title: 'Sicher verwalten',
        text: 'JWT-Login, Rollen und Berechtigungen schaffen klare Grenzen für sensible Bereiche.',
      },
    ],
    previewCards: [
      ['Open Source', 'Transparente Entwicklung'],
      ['Ehrenamt', 'Gemeinsam gepflegt'],
      ['Verwaltung', 'Kurse, Räume und Rollen'],
    ],
  },
  en: {
    language: 'Language',
    login: 'Login',
    register: 'Register',
    registerAction: 'Register',
    protectedArea: 'Protected area',
    signIn: 'Sign in',
    createAccount: 'Create account',
    name: 'Name',
    email: 'Email',
    password: 'Password',
    passwordPlaceholder: 'At least 8 characters',
    wait: 'Please wait',
    genericError: 'Something went wrong',
    or: 'or',
    googleUnavailable: 'Google login is not configured yet',
    googleLoadError: 'Google login could not be loaded',
    googleMissingCredential: 'Google did not return a login token',
    forgotPassword: 'Forgot password?',
    resetPassword: 'Reset password',
    sendResetLink: 'Send reset link',
    backToLogin: 'Back to login',
    registrationNeedsVerification: 'Your account was created. Please confirm your email address using the link we sent you.',
    resendVerification: 'Send confirmation link again',
    verificationSent: 'If the email exists and is not verified yet, a new link was sent',
    forgotPasswordIntro: 'Enter your email address. If a verified account exists, we will send a reset link.',
    resetPasswordIntro: 'Choose a new password for your account.',
    emailVerified: 'Email confirmed. You are being signed in.',
    verifyingEmail: 'Confirming email',
    invalidToken: 'The link is invalid or missing',
    passwordResetDone: 'Password was updated. You can sign in now.',
    dashboard: 'Dashboard',
    administration: 'Administration',
    logout: 'Log out',
    signedIn: 'Signed in',
    courses: 'Courses',
    rooms: 'Rooms',
    users: 'Users',
    matches: 'Matches',
    roles: 'Roles',
    accountHash: 'Account hash',
    secureRoutesText: 'All administration routes are protected by JWT and require an active session.',
    landingKicker: 'Open source classroom management',
    landingIntro:
      'A free administration interface for courses, rooms, accounts and permissions. My Ezber App is maintained by volunteers and built as a collaborative open-source project.',
    joinOrLogin: 'Contribute or sign in',
    viewApi: 'View API',
    projectOverview: 'Project overview',
    community: 'Community',
    footerText: 'A volunteer-run open-source project for learning and course management.',
    project: 'Project',
    links: 'Links',
    mitLicense: 'MIT License',
    contribute: 'Contribute',
    projectValues: 'Project values',
    swaggerUi: 'Swagger UI',
    openApiJson: 'OpenAPI JSON',
    copyright: '© 2026 My Ezber App contributors. Available under the MIT License.',
    checks: ['Open source', 'Volunteer-run', 'Swagger-documented REST API'],
    features: [
      {
        title: 'Open to contributors',
        text: 'Code, API and project structure are transparent and ready for community contributions.',
      },
      {
        title: 'Maintained by volunteers',
        text: 'The project is cared for together and aims to support education in practical ways.',
      },
      {
        title: 'Secure administration',
        text: 'JWT login, roles and permissions create clear boundaries for sensitive areas.',
      },
    ],
    previewCards: [
      ['Open source', 'Transparent development'],
      ['Volunteering', 'Maintained together'],
      ['Administration', 'Courses, rooms and roles'],
    ],
  },
  tr: {
    language: 'Dil',
    login: 'Giriş',
    register: 'Kayıt',
    registerAction: 'Kaydol',
    protectedArea: 'Güvenli alan',
    signIn: 'Giriş yap',
    createAccount: 'Hesap oluştur',
    name: 'Ad',
    email: 'E-posta',
    password: 'Şifre',
    passwordPlaceholder: 'En az 8 karakter',
    wait: 'Lütfen bekleyin',
    genericError: 'Bir hata oluştu',
    or: 'veya',
    googleUnavailable: 'Google girişi henüz yapılandırılmadı',
    googleLoadError: 'Google girişi yüklenemedi',
    googleMissingCredential: 'Google giriş tokeni döndürmedi',
    forgotPassword: 'Şifreni mi unuttun?',
    resetPassword: 'Şifreyi sıfırla',
    sendResetLink: 'Sıfırlama bağlantısı gönder',
    backToLogin: 'Girişe dön',
    registrationNeedsVerification: 'Hesabın oluşturuldu. Lütfen gönderdiğimiz bağlantı ile e-posta adresini doğrula.',
    resendVerification: 'Doğrulama bağlantısını tekrar gönder',
    verificationSent: 'E-posta varsa ve henüz doğrulanmadıysa yeni bağlantı gönderildi',
    forgotPasswordIntro: 'E-posta adresini gir. Doğrulanmış bir hesap varsa sıfırlama bağlantısı göndereceğiz.',
    resetPasswordIntro: 'Hesabın için yeni bir şifre belirle.',
    emailVerified: 'E-posta doğrulandı. Oturum açılıyor.',
    verifyingEmail: 'E-posta doğrulanıyor',
    invalidToken: 'Bağlantı geçersiz veya eksik',
    passwordResetDone: 'Şifre güncellendi. Şimdi giriş yapabilirsin.',
    dashboard: 'Panel',
    administration: 'Yönetim',
    logout: 'Çıkış yap',
    signedIn: 'Oturum açık',
    courses: 'Kurslar',
    rooms: 'Odalar',
    users: 'Kullanıcılar',
    matches: 'Eşleşmeler',
    roles: 'Roller',
    accountHash: 'Hesap hash',
    secureRoutesText: 'Tüm yönetim rotaları JWT ile korunur ve aktif oturum gerektirir.',
    landingKicker: 'Açık kaynak sınıf yönetimi',
    landingIntro:
      'Kurslar, odalar, hesaplar ve yetkiler için özgür bir yönetim arayüzü. My Ezber App gönüllüler tarafından sürdürülür ve ortak bir açık kaynak projesi olarak geliştirilir.',
    joinOrLogin: 'Katıl veya giriş yap',
    viewApi: "API'yi görüntüle",
    projectOverview: 'Proje özeti',
    community: 'Topluluk',
    footerText: 'Öğrenme ve kurs yönetimi için gönüllülerin yönettiği açık kaynak bir proje.',
    project: 'Proje',
    links: 'Bağlantılar',
    mitLicense: 'MIT Lisansı',
    contribute: 'Katkı ver',
    projectValues: 'Proje değerleri',
    swaggerUi: 'Swagger UI',
    openApiJson: 'OpenAPI JSON',
    copyright: '© 2026 My Ezber App contributors. MIT Lisansı altında özgürce kullanılabilir.',
    checks: ['Açık kaynak', 'Gönüllü yönetim', 'Swagger belgeli REST API'],
    features: [
      {
        title: 'Katkıya açık',
        text: 'Kod, API ve proje yapısı şeffaftır ve topluluk katkılarına hazırdır.',
      },
      {
        title: 'Gönüllüler sürdürür',
        text: 'Proje birlikte korunur ve eğitimi pratik biçimde desteklemeyi amaçlar.',
      },
      {
        title: 'Güvenli yönetim',
        text: 'JWT girişi, roller ve yetkiler hassas alanlar için net sınırlar oluşturur.',
      },
    ],
    previewCards: [
      ['Açık kaynak', 'Şeffaf geliştirme'],
      ['Gönüllülük', 'Birlikte sürdürülür'],
      ['Yönetim', 'Kurslar, odalar ve roller'],
    ],
  },
} as const;

type Translations = typeof translations;
export type TranslationKey = keyof Translations['de'];
type TranslationValue<Key extends TranslationKey> = Translations[Language][Key];

type LanguageContextValue = {
  language: Language;
  setLanguage: (language: Language) => void;
  t: <Key extends TranslationKey>(key: Key) => TranslationValue<Key>;
};

const LanguageContext = createContext<LanguageContextValue | undefined>(undefined);

function getInitialLanguage(): Language {
  if (typeof window === 'undefined') {
    return 'de';
  }

  const savedLanguage = window.localStorage.getItem(storageKey);

  if (savedLanguage === 'de' || savedLanguage === 'en' || savedLanguage === 'tr') {
    return savedLanguage;
  }

  return 'de';
}

export function LanguageProvider({ children }: PropsWithChildren) {
  const [language, setCurrentLanguage] = useState<Language>(getInitialLanguage);

  const value = useMemo<LanguageContextValue>(() => {
    function setLanguage(nextLanguage: Language) {
      window.localStorage.setItem(storageKey, nextLanguage);
      setCurrentLanguage(nextLanguage);
    }

    return {
      language,
      setLanguage,
      t: (key) => translations[language][key],
    };
  }, [language]);

  return <LanguageContext.Provider value={value}>{children}</LanguageContext.Provider>;
}

export function useLanguage() {
  const context = useContext(LanguageContext);

  if (!context) {
    throw new Error('useLanguage must be used inside LanguageProvider');
  }

  return context;
}
