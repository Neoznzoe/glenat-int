import { useEffect, useRef } from 'react';
import glenatWhiteLogo from '@/assets/logos/glenat/glenat_white.svg';
import { useAuth } from '@/context/AuthContext';

type FinisherHeaderInstance = {
  destroy?: () => void;
};

declare global {
  interface Window {
    FinisherHeader?: new (config: Record<string, unknown>) => FinisherHeaderInstance;
  }
}

const FINISHER_SCRIPT_SRC = '/finisher-header.es5.min.js';

function loadFinisherHeader(onLoad: () => void) {
  if (typeof window === 'undefined') {
    return;
  }

  const existingScript = document.querySelector<HTMLScriptElement>(
    'script[data-finisher-header]'
  );

  if (existingScript) {
    if (typeof window.FinisherHeader === 'function') {
      onLoad();
    } else {
      existingScript.addEventListener('load', onLoad, { once: true });
    }
    return;
  }

  const script = document.createElement('script');
  script.src = FINISHER_SCRIPT_SRC;
  script.async = true;
  script.dataset.finisherHeader = 'true';
  script.addEventListener('load', onLoad, { once: true });
  document.body.appendChild(script);
}

export function LoginPage() {
  const { login, error } = useAuth();
  const headerRef = useRef<HTMLDivElement | null>(null);
  const headerInstanceRef = useRef<unknown>(null);

  useEffect(() => {
    const initialise = () => {
      if (typeof window === 'undefined') {
        return;
      }

      const FinisherHeaderConstructor = window.FinisherHeader;

      if (typeof FinisherHeaderConstructor !== 'function') {
        return;
      }

      headerInstanceRef.current = new FinisherHeaderConstructor({
        count: 5,
        size: {
          min: 489,
          max: 1300,
          pulse: 0,
        },
        speed: {
          x: {
            min: 0.1,
            max: 0.3,
          },
          y: {
            min: 0.1,
            max: 0.3,
          },
        },
        colors: {
          background: '#f9251f',
          particles: ['#630603', '#fdc5c3', '#fb7874'],
        },
        blending: 'overlay',
        opacity: {
          center: 1,
          edge: 0.1,
        },
        skew: -2,
        shapes: ['c'],
      });
    };

    loadFinisherHeader(initialise);

    return () => {
      if (headerInstanceRef.current && typeof headerInstanceRef.current === 'object') {
        const instance = headerInstanceRef.current as { destroy?: () => void };
        instance.destroy?.();
      }
      const headerElement = headerRef.current;
      if (headerElement) {
        const canvases = headerElement.querySelectorAll('canvas.finisher-canvas');
        canvases.forEach((canvas) => canvas.remove());
      }
    };
  }, []);

  return (
    <div className="min-h-screen bg-[#f9251f] text-white flex flex-col">
      <div
        ref={headerRef}
        className="finisher-header relative flex items-center justify-center px-6 py-16"
        style={{ width: '100%', minHeight: 280 }}
      >
        <img
          src={glenatWhiteLogo}
          alt="Glénat"
          className="w-40 sm:w-48 md:w-56 drop-shadow-lg"
        />
      </div>
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
