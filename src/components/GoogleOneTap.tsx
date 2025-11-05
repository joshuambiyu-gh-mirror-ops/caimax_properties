"use client";

import { useEffect, useState } from "react";
import { signIn, useSession } from "next-auth/react";

// Minimal types for the Google Identity Services objects we use here.
interface GooglePromptNotification {
  isNotDisplayed?: () => boolean;
  getNotDisplayedReason?: () => string;
  isSkippedMoment?: () => boolean;
  getSkippedReason?: () => string;
  isDismissedMoment?: () => boolean;
  getDismissedReason?: () => string;
}

declare global {
  interface Window {
    google?: {
      accounts?: {
        id?: {
          initialize: (opts: {
            client_id?: string | undefined;
            auto_select?: boolean | undefined;
            cancel_on_tap_outside?: boolean | undefined;
            callback: (resp: { credential?: string }) => void;
          }) => void;
          prompt: (cb?: (notification: GooglePromptNotification) => void) => Promise<unknown> | undefined;
          cancel: () => void;
        };
      };
    };
  }
}

export default function GoogleOneTap() {
  const { status } = useSession();
  const [hasAttempted, setHasAttempted] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [, setError] = useState<string | null>(null);

  // Debug session state
  // Only reset hasAttempted if status transitions from authenticated to unauthenticated
  const [prevStatus, setPrevStatus] = useState(status);
  useEffect(() => {
    if (prevStatus === 'authenticated' && status === 'unauthenticated') {
      setHasAttempted(false);
    }
    setPrevStatus(status);
  }, [status, prevStatus]);

  // Handle Google Script Loading
  useEffect(() => {
    if (typeof window === "undefined") {
      console.debug('[GoogleOneTap] Window undefined, skipping');
      return;
    }
    if (status === "loading") {
      console.debug('[GoogleOneTap] Session loading, waiting...');
      return;
    }
    if (status === "authenticated") {
      console.debug('[GoogleOneTap] Already authenticated, skipping One Tap');
      return;
    }
    if (hasAttempted) {
      console.debug('[GoogleOneTap] Already attempted, skipping');
      return;
    }
    if (isInitialized) {
      console.debug('[GoogleOneTap] Already initialized, skipping');
      return;
    }

    let scriptLoaded = false;
    
    if (!window?.google) {
      const script = document.createElement("script");
      script.src = "https://accounts.google.com/gsi/client";
      script.async = true;
      script.defer = true;
      document.head.appendChild(script);

      script.onload = () => {
        scriptLoaded = true;
        initOneTap();
      };
    } else {
      scriptLoaded = true;
      initOneTap();
    }

    return () => {
      if (scriptLoaded && window.google?.accounts?.id) {
        window.google.accounts.id.cancel();
        setIsInitialized(false);
      }
    };

    function initOneTap() {
      if (!window.google?.accounts?.id || isInitialized) return;

      try {
        window.google.accounts.id.initialize({
          client_id: process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID,
          auto_select: false,
          cancel_on_tap_outside: true,
          callback: handleCredentialResponse,
        });

  const promptResult = window.google.accounts.id.prompt((notification: GooglePromptNotification) => {
          try {
            if (typeof notification.isNotDisplayed === 'function' && notification.isNotDisplayed()) {
              console.debug("[GoogleOneTap] Not displayed:", typeof notification.getNotDisplayedReason === 'function' ? notification.getNotDisplayedReason() : undefined);
              if (typeof notification.getNotDisplayedReason === 'function' && notification.getNotDisplayedReason() === 'browser_not_supported') {
                setHasAttempted(true); // Prevent further attempts if browser not supported
              }
            } else if (typeof notification.isSkippedMoment === 'function' && notification.isSkippedMoment()) {
              console.debug("[GoogleOneTap] Skipped:", typeof notification.getSkippedReason === 'function' ? notification.getSkippedReason() : undefined);
              setHasAttempted(true);
            } else if (typeof notification.isDismissedMoment === 'function' && notification.isDismissedMoment()) {
              console.debug("[GoogleOneTap] Dismissed:", typeof notification.getDismissedReason === 'function' ? notification.getDismissedReason() : undefined);
              setHasAttempted(true);
            } else {
              console.debug("[GoogleOneTap] Prompt state:", notification);
            }
          } catch (error) {
            if (error instanceof Error && error.name === 'AbortError') {
              console.debug("[GoogleOneTap] Prompt aborted - this is normal during cleanup");
            } else {
              console.error("[GoogleOneTap] Prompt error:", error);
            }
            setHasAttempted(true);
          }
        });

        // Some browsers/environments may have prompt return undefined instead of a Promise.
        // Only call .catch if the return value is promise-like.
        // Helper to detect promise-like promptResult without using `any`.
        const isPromiseLike = (v: unknown): v is Promise<unknown> => {
          return !!v && typeof (v as Promise<unknown>)['catch'] === 'function';
        };

        try {
          if (promptResult && isPromiseLike(promptResult)) {
            promptResult.catch((error: unknown) => {
              if (error instanceof Error && error.name === 'AbortError') {
                console.debug("[GoogleOneTap] Prompt aborted - this is normal during cleanup");
              } else {
                console.error("[GoogleOneTap] Failed to prompt:", error);
              }
              setHasAttempted(true);
            });
          }
        } catch (err) {
          // Defensive: log and mark attempt so we don't loop
          console.error('[GoogleOneTap] Error handling prompt result:', err);
          setHasAttempted(true);
        }

        setIsInitialized(true);
      } catch (error) {
        console.error("Failed to initialize One Tap:", error);
      }
    }

    async function handleCredentialResponse(response: unknown) {
      console.log('[GoogleOneTap] Received credential response:', response);
      const idToken = (response as { credential?: string } | null)?.credential;
      if (!idToken) {
        console.error('[GoogleOneTap] No credential in response');
        setError('No credential received');
        return;
      }

      setHasAttempted(true);
      
        try {
        console.log('[GoogleOneTap] Attempting sign in with token...');
        const callbackUrl = typeof window !== 'undefined' ? `${window.location.origin}/dashboard` : undefined;
        console.debug('[GoogleOneTap] Using callbackUrl:', callbackUrl);
        const res = await signIn("google-onetap", {
          id_token: idToken,
          redirect: false,
          callbackUrl,
        });

        console.log('[GoogleOneTap] Sign in response:', res);

        if (res?.ok) {
          // Cancel One Tap before redirecting
          if (window.google?.accounts?.id) {
            window.google.accounts.id.cancel();
          }
          console.log('[GoogleOneTap] Sign in successful, redirecting...');
          window.location.href = res.url || "/dashboard";
        } else {
          console.error("[GoogleOneTap] Sign in failed:", res?.error);
          setError(res?.error || 'Sign in failed');
          setHasAttempted(false); // Allow retry
        }
      } catch (error) {
        console.error("[GoogleOneTap] Sign in error:", error);
        setError(error instanceof Error ? error.message : 'Unknown error');
        setHasAttempted(false); // Allow retry
      }
    }
  }, [status, hasAttempted, isInitialized]);

  // Render nothing
  return null;
}
