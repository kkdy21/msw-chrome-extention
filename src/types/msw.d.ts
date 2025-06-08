interface MSWControl {
  getHandlers: () => any[];
  enableHandler: (id: string) => Promise<void>;
  disableHandler: (id: string) => Promise<void>;
}

declare global {
  interface Window {
    mswControl: MSWControl;
  }
}

export {};
