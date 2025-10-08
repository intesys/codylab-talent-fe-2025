import {
  Configuration,
  ProjectsApi,
  SlotsApi,
  TasksApi,
  UsersApi,
} from "../../generated/api";

import {
  PublicClientApplication,
  type AuthenticationResult,
  type EventMessage,
  EventType,
  InteractionRequiredAuthError,
} from "@azure/msal-browser";

import { config } from "../../config";

/** Controlla se l'autenticazione MSAL è abilitata */
export const authEnabled = (): boolean => config.msal.enabled;

/** Scopes per il token */
export const loginRequest = {
  scopes: [`${config.msal.clientId}/.default`],
};

/** Istanza MSAL */
export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: config.msal.clientId,
    authority: config.msal.authority,
    redirectUri: config.msal.redirectUri,
  },
  cache: {
    cacheLocation: "localStorage",
    storeAuthStateInCookie: false,
  },
});

/** 🔹 IMPORTANTE: Promise per tracciare l'inizializzazione */
let msalInitPromise: Promise<void> | null = null;

/** 🔹 Inizializza MSAL una sola volta */
export const initializeMsal = async (): Promise<void> => {
  if (!authEnabled()) return;

  // Se già in corso, aspetta la stessa promise
  if (msalInitPromise) {
    return msalInitPromise;
  }

  msalInitPromise = (async () => {
    try {
      console.log("🔄 Inizializzazione MSAL...");
      await msalInstance.initialize();
      console.log("✅ MSAL inizializzato");

      // Imposta account attivo se già loggato
      const existingAccounts = msalInstance.getAllAccounts();
      if (existingAccounts.length > 0) {
        msalInstance.setActiveAccount(existingAccounts[0]);
        console.log(
          "✅ Account attivo impostato:",
          existingAccounts[0].username
        );
      }
    } catch (err) {
      console.error("❌ Errore inizializzazione MSAL:", err);
      throw err;
    }
  })();

  return msalInitPromise;
};

/** Callback per aggiornare account attivo dopo login */
msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const authResult = event.payload as AuthenticationResult;
    msalInstance.setActiveAccount(authResult.account);
    console.log("✅ Login success event:", authResult.account?.username);
  }
});

/** Ottiene token accesso senza loop */
export const getAccessToken = async (): Promise<string> => {
  if (!authEnabled()) return "";

  // 🔹 Assicurati che MSAL sia inizializzato
  await initializeMsal();

  const account = msalInstance.getActiveAccount();
  if (!account) {
    throw new Error("Account non loggato.");
  }

  try {
    const result = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });
    return result.accessToken;
  } catch (error: any) {
    if (error instanceof InteractionRequiredAuthError) {
      console.warn("⚠️ Token scaduto, richiesto nuovo login");
      await msalInstance.loginRedirect(loginRequest);
      return "";
    }
    console.error("❌ Errore token MSAL:", error);
    throw error;
  }
};

/** URL backend */
const BASE_PATH = config.basePath || "http://localhost:8090/api/v1";

/** Config autenticata per le API */
async function createConfig(): Promise<Configuration> {
  return new Configuration({
    basePath: BASE_PATH,
    credentials: "include",
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  });
}

/** Proxy dinamico per API con token aggiornato ad ogni chiamata */
function createProxy<T extends new (...args: any[]) => any>(
  ApiClass: T
): InstanceType<T> {
  return new Proxy({} as InstanceType<T>, {
    get(_target, prop, _receiver) {
      return async (...args: unknown[]) => {
        const config = await createConfig();
        const instance = new ApiClass(config);
        const method = instance[prop as keyof InstanceType<T>];
        if (typeof method === "function") {
          return (method as Function).apply(instance, args);
        }
        return method;
      };
    },
  });
}

/** API esportate */
export const projects = createProxy(ProjectsApi);
export const slots = createProxy(SlotsApi);
export const tasks = createProxy(TasksApi);
export const users = createProxy(UsersApi);
