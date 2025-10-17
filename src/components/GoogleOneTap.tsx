"use client";

import { useEffect } from "react";
import { signIn } from "next-auth/react";

declare global {
  interface Window {
    google?: any;
  }
}

export default function GoogleOneTap() {
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!window?.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        initOneTap();
      };

      return () => {
        // leave script for reuse
      };
    } else {
      initOneTap();
    }

    function initOneTap() {
      if (!window.google?.accounts?.id) return;

      window.google.accounts.id.initialize({
        client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
        auto_select: false,
        cancel_on_tap_outside: true,
        callback: handleCredentialResponse,
      });

      window.google.accounts.id.prompt((notification: any) => {
        // optional debug
      });
    }

    async function handleCredentialResponse(response: any) {
      const idToken = response?.credential;
      if (!idToken) return;

      const res = await signIn("google-onetap", {
        id_token: idToken,
        redirect: false,
      });

      if (res && (res as any).ok) {
        window.location.href = "/dashboard";
      } else {
        console.error("One Tap sign-in failed", res);
      }
    }
  }, []);

  return null;
}
