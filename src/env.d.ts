declare global {
  namespace NodeJS {
    interface ProcessEnv {
      GITHUB_API_KEY?: string;
      GITHUB_API_VERSION?: string;
      GITHUB_API_BASE_URL?: string;
      LOG_LEVEL?: string;
      DATABASE_URL: string;
    }
  }
}

export {};
