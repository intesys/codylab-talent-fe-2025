import {
  Configuration,
  ProjectsApi,
  SlotsApi,
  TasksApi,
  UsersApi,
} from "../../generated/api";

import {
  EventType,
  PublicClientApplication,
  type AuthenticationResult,
  type EventMessage,
} from "@azure/msal-browser";

import { config } from "../../config";

/**
 * Controlla se l'autenticazione MSAL è abilitata
 */
export const authEnabled = (): boolean => config.msal.enabled;

/**
 * Scopes richiesti per ottenere il token.
 */
export const loginRequest = {
  scopes: [`${config.msal.clientId}/.default`],
};

export const graphRequest = {
  scopes: ["Calendars.Read"],
};

/**
 * Istanza MSAL
 */
export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: config.msal.clientId,
    authority: config.msal.authority,
    redirectUri: config.msal.redirectUri,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
});

/**
 * Se ci sono account salvati nella sessione, impostane il primo come attivo
 */
const existingAccounts = msalInstance.getAllAccounts();
if (existingAccounts.length > 0) {
  msalInstance.setActiveAccount(existingAccounts[0]);
}

/**
 * Callback sugli eventi MSAL
 */
msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    const authResult = event.payload as AuthenticationResult;
    msalInstance.setActiveAccount(authResult.account);
  }
});

/**
 * Ottiene un access token da MSAL. Se non disponibile o scaduto, forza login.
 */
export const getAccessToken = async (): Promise<string> => {
  if (!authEnabled()) return "";

  const account =
    msalInstance.getActiveAccount() || msalInstance.getAllAccounts()[0];

  if (!account) {
    await msalInstance.loginRedirect(loginRequest);
    return "";
  }

  try {
    const authenticationResult = await msalInstance.acquireTokenSilent({
      ...loginRequest,
      account,
    });

    return authenticationResult.accessToken;
  } catch (error) {
    console.warn("Token non disponibile, nuovo login richiesto:", error);
    sessionStorage.clear();
    await msalInstance.loginRedirect(loginRequest);
    return "";
  }
};

/**
 * URL base delle API backend
 */
const BASE_PATH = config.basePath || "http://localhost:8090/api/v1";

/**
 * Crea la configurazione autenticata per le API
 */
async function createConfig(): Promise<Configuration> {
  return new Configuration({
    basePath: BASE_PATH,
    credentials: "include",
    headers: {
      Authorization: `Bearer ${await getAccessToken()}`,
    },
  });
}

/**
 * Crea un proxy dinamico per le API, aggiornando il token ad ogni chiamata
 */
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

/**
 * Esporta le API autenticate
 */
export const projects = createProxy(ProjectsApi);
export const slots = createProxy(SlotsApi);
export const tasks = createProxy(TasksApi);
export const users = createProxy(UsersApi);
