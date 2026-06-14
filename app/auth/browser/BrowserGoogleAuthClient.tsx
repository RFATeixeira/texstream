"use client";

import {
  getRedirectResult,
  GoogleAuthProvider,
  onAuthStateChanged,
  signInWithRedirect,
  type Auth,
  type User,
} from "firebase/auth";
import { LoaderCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { getFirebaseAuth, isFirebaseConfigured } from "../../../lib/firebase";

const CALLBACK_STORAGE_KEY = "textream-browser-auth-callback";
const REDIRECT_PENDING_STORAGE_KEY = "textream-browser-auth-redirect-pending";

function TextreamLogoIcon({ size = 36 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      height={size}
      viewBox="0 0 853.33331 933.33331"
      width={size}
    >
      <path
        fill="#0177a9"
        d="M 0.5,0.1114279 0.21875,0.59 H 0.4140621 L 0.6093743,0.2799997 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#0177a9"
        d="m 0.0718736,0.8385724 0.1062518,-0.18 h 0.1921864 l -0.1156257,0.18 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#0083bb"
        d="m 0.3687489,0.6585724 -0.1156225,0.18 h 0.0921861 l 0.1140629,-0.18 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#018dc8"
        d="m 0.3437496,0.8385724 0.1140629,-0.18 0.1953121,-0.3100003 0.1078115,0.1671428 -0.2078118,0.3228575 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#019add"
        d="m 0.6671871,0.6585724 h 0.084375 l -0.1249996,0.18 H 0.5515614 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#00aaf0"
        d="m 0.7499993,0.6585724 h 0.1046889 l -0.1265625,0.18 H 0.6249996 Z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
      <path
        fill="#00b4ff"
        d="m 0.8531254,0.6585724 0.1171885,0.18 h -0.243751 z"
        transform="matrix(853.33331,0,0,-933.33331,0,933.33331)"
      />
    </svg>
  );
}

function waitForAuthUser(auth: Auth, timeoutMs: number) {
  if (auth.currentUser) {
    return Promise.resolve(auth.currentUser);
  }

  return new Promise<User | null>((resolve) => {
    const timeout = window.setTimeout(() => {
      unsubscribe();
      resolve(auth.currentUser);
    }, timeoutMs);

    const unsubscribe = onAuthStateChanged(auth, (user) => {
      window.clearTimeout(timeout);
      unsubscribe();
      resolve(user);
    });
  });
}

async function postLoginCredential(
  callbackUrl: string,
  credential: { accessToken?: string | null; idToken?: string | null },
  user: User
) {
  const firebaseIdToken = await user.getIdToken();
  const idToken = credential.idToken || firebaseIdToken;

  const response = await fetch(callbackUrl, {
    body: JSON.stringify({
      accessToken: credential.accessToken ?? "",
      firebaseIdToken,
      idToken,
    }),
    headers: {
      "Content-Type": "application/json",
    },
    method: "POST",
  });

  if (!response.ok) {
    throw new Error(`Callback local retornou HTTP ${response.status}.`);
  }
}

export function BrowserGoogleAuthClient() {
  const [message, setMessage] = useState("");
  const hasStartedLogin = useRef(false);

  useEffect(() => {
    async function signInAndReturnCredential() {
      if (hasStartedLogin.current) {
        return;
      }

      hasStartedLogin.current = true;
      setMessage("Abrindo login com Google...");

      const callbackUrl =
        new URLSearchParams(window.location.search).get("callback") ||
        window.sessionStorage.getItem(CALLBACK_STORAGE_KEY);

      if (callbackUrl) {
        window.sessionStorage.setItem(CALLBACK_STORAGE_KEY, callbackUrl);
      }

      if (!callbackUrl) {
        setMessage("Callback local nao encontrado.");
        return;
      }

      const auth = getFirebaseAuth();

      if (!auth || !isFirebaseConfigured) {
        setMessage("Firebase nao configurado.");
        return;
      }

      const provider = new GoogleAuthProvider();
      provider.setCustomParameters({
        prompt: "select_account",
      });

      try {
        const hadPendingRedirect =
          window.sessionStorage.getItem(REDIRECT_PENDING_STORAGE_KEY) === "1";
        const result = await getRedirectResult(auth);

        if (result?.user) {
          const credential = GoogleAuthProvider.credentialFromResult(result);

          await postLoginCredential(callbackUrl, credential ?? {}, result.user);

          window.sessionStorage.removeItem(CALLBACK_STORAGE_KEY);
          window.sessionStorage.removeItem(REDIRECT_PENDING_STORAGE_KEY);
          setMessage("Login concluido. Pode voltar ao Textream.");
          return;
        }

        const currentUser = await waitForAuthUser(
          auth,
          hadPendingRedirect ? 5000 : 1000
        );

        if (currentUser) {
          await postLoginCredential(callbackUrl, {}, currentUser);

          window.sessionStorage.removeItem(CALLBACK_STORAGE_KEY);
          window.sessionStorage.removeItem(REDIRECT_PENDING_STORAGE_KEY);
          setMessage("Login concluido. Pode voltar ao Textream.");
          return;
        }

        if (!hadPendingRedirect) {
          window.sessionStorage.setItem(REDIRECT_PENDING_STORAGE_KEY, "1");
          await signInWithRedirect(auth, provider);
          return;
        }

        window.sessionStorage.removeItem(REDIRECT_PENDING_STORAGE_KEY);
        setMessage("Nao foi possivel concluir o retorno do Google. Tente novamente.");
      } catch (error) {
        window.sessionStorage.removeItem(REDIRECT_PENDING_STORAGE_KEY);
        setMessage(
          error instanceof Error ? error.message : "Erro ao autenticar."
        );
      }
    }

    void signInAndReturnCredential();
  }, []);

  return (
    <main className="flex min-h-dvh items-center justify-center bg-[#12161C] p-5 text-white">
      <div className="w-full max-w-md rounded-2xl bg-[#181E24] p-6 text-center">
        <div className="mx-auto mb-5 flex size-14 items-center justify-center rounded-2xl bg-[#1B242E] text-[#55A8FF]">
          <TextreamLogoIcon />
        </div>
        <h1 className="text-xl font-bold">Login no navegador</h1>
        <p className="mt-3 text-sm leading-6 text-slate-400">
          Voce sera redirecionado para entrar com Google.
        </p>

        <div className="mt-6 flex items-center justify-center gap-3 rounded-xl bg-white/5 px-4 py-3 text-sm font-bold text-slate-200">
          <LoaderCircle className="size-4 animate-spin" aria-hidden="true" />
          Abrindo Google
        </div>

        {message && (
          <div className="mt-5 rounded-xl bg-white/5 px-3 py-2 text-xs text-slate-300">
            {message}
          </div>
        )}
      </div>
    </main>
  );
}
