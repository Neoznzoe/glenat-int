/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CATALOGUE_COVER_ENDPOINT?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
