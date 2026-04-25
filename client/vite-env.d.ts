/// <reference types="vite/client" />

interface ImportMetaEnv {
    readonly VITE_API_URL: string;
    // Add more VITE_ variables if you have them later
}

interface ImportMeta {
    readonly env: ImportMetaEnv;
}
