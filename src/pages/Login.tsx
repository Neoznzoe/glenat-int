import glenatWhiteLogo from '@/assets/logos/glenat/glenat_white.svg';
import { useAuth } from '@/context/AuthContext';

export function LoginPage() {
  const { login, error } = useAuth();

  return (
    <div className="min-h-screen bg-[#f9251f] text-white flex flex-col">
      <header
        className="finisher-header relative flex items-center justify-center px-6 py-16"
        style={{ width: '100%', minHeight: 280 }}
      >
        <img
          src={glenatWhiteLogo}
          alt="Glénat"
          className="w-40 sm:w-48 md:w-56 drop-shadow-lg"
        />
      </header>
      <main className="flex-1 flex flex-col items-center justify-center px-6 pb-20 text-center gap-6">
        <div className="max-w-xl space-y-4">
          <h1 className="text-3xl font-semibold sm:text-4xl">
            Pour accéder à l'intranet, vous devez vous connecter.
          </h1>
          <p className="text-lg text-white/80">
            Utilisez votre compte Microsoft 365 pour rejoindre l'espace collaboratif Glénat.
          </p>
          {error ? (
            <div className="rounded-md border border-white/30 bg-white/10 px-4 py-3 text-sm">
              {error}
            </div>
          ) : null}
        </div>
        <button
          type="button"
          onClick={() => void login()}
          className="inline-flex items-center justify-center rounded-full bg-white px-6 py-3 text-base font-semibold text-[#f9251f] shadow-lg transition-transform duration-200 hover:scale-105 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
        >
          Se connecter avec Microsoft 365
        </button>
      </main>
    </div>
  );
}

export default LoginPage;
