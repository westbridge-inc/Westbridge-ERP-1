interface PaddleCheckoutOpenOptions {
  items: Array<{ priceId: string; quantity: number }>;
  customer?: { email?: string };
  customData?: Record<string, string>;
  settings?: {
    successUrl?: string;
    displayMode?: "overlay" | "inline";
    theme?: "light" | "dark";
  };
}

interface PaddleInstance {
  Checkout: {
    open: (options: PaddleCheckoutOpenOptions) => void;
    close: () => void;
  };
  Environment: {
    set: (env: "sandbox" | "production") => void;
  };
  Initialize: (options: { token: string; eventCallback?: (event: Record<string, unknown>) => void }) => void;
}

declare global {
  interface Window {
    Paddle?: PaddleInstance;
  }
}

export {};
