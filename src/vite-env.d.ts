/// <reference types="vite/client" />

interface ImportMetaEnv {
	readonly VITE_PDF_PROXY?: string;
}

interface ImportMeta {
	readonly env: ImportMetaEnv;
}
