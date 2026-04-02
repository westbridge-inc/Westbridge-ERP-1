"use client";

import { useEffect } from "react";

/**
 * Initializes the Paddle.js SDK after the script loads.
 * Rendered once in the root layout.
 */
export function PaddleInit() {
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_PADDLE_CLIENT_TOKEN ?? "";
    if (!token) return;

    const init = () => {
      if (!window.Paddle) return;
      if (process.env.NEXT_PUBLIC_PADDLE_SANDBOX === "true") {
        window.Paddle.Environment.set("sandbox");
      }
      window.Paddle.Initialize({ token });
    };

    // Paddle.js may already be loaded (lazyOnload), or it may load later.
    if (window.Paddle) {
      init();
    } else {
      // Poll briefly until the script is ready (lazyOnload fires after window.onload).
      const interval = setInterval(() => {
        if (window.Paddle) {
          init();
          clearInterval(interval);
        }
      }, 500);
      // Stop trying after 30 seconds.
      const timeout = setTimeout(() => clearInterval(interval), 30_000);
      return () => {
        clearInterval(interval);
        clearTimeout(timeout);
      };
    }
  }, []);

  return null;
}
