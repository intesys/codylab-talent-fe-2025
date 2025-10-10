import {
  Configuration,
  ProjectsApi,
  SlotsApi,
  TasksApi,
  UsersApi,
} from "../../generated/api";

import { PublicClientApplication, LogLevel } from "@azure/msal-browser";

import { config } from "../../config";

/** Controlla se l'autenticazione MSAL è abilitata */
export const authEnabled = (): boolean => config.msal.enabled;

/** 🔹 SCOPES SEMPLIFICATI - Risolvono l'errore */
export const loginRequest = {
  scopes: [
    "openid",
    "profile",
    "email",
    // 🔹 Commenta fino a quando non configuri correttamente Azure AD
    // "api://279c3475-04a5-4a02-b595-5c576648588a/.default",
  ],
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
  system: {
    loggerOptions: {
      loggerCallback: (
        level: LogLevel,
        message: string,
        containsPii: boolean
      ) => {
        if (containsPii) return;
        console.log(`MSAL [${LogLevel[level]}]: ${message}`);
      },
      logLevel: LogLevel.Verbose,
    },
  },
});

let msalInitialized = false;

/** 🔹 INIZIALIZZAZIONE CON GESTIONE ERRORI MIGLIORATA */
export const initializeMsal = async (): Promise<void> => {
  if (msalInitialized) {
    console.log("🔸 MSAL già inizializzato");
    return;
  }

  try {
    console.log("🔄 Inizializzazione MSAL...");
    await msalInstance.initialize();

    // 🔹 GESTIONE REDIRECT - con try/catch separato
    try {
      console.log("🔹 Controllo redirect promise...");
      const redirectResponse = await msalInstance.handleRedirectPromise();

      if (redirectResponse) {
        console.log("✅ Redirect completato da Azure AD");
        msalInstance.setActiveAccount(redirectResponse.account);
      } else {
        console.log("🔸 Nessun redirect in corso");
      }
    } catch (redirectError) {
      console.warn("⚠️ Errore durante redirect promise:", redirectError);
      // Continua comunque
    }

    // 🔹 IMPOSTA ACCOUNT ATTIVO dalla cache
    const accounts = msalInstance.getAllAccounts();
    console.log(`🔸 Account in cache: ${accounts.length}`);

    if (accounts.length > 0) {
      const activeAccount = accounts[0];
      msalInstance.setActiveAccount(activeAccount);
      console.log("✅ Account attivo impostato:", activeAccount.username);
    } else {
      console.log("🔐 Nessun account in cache - login manuale richiesto");
    }

    msalInitialized = true;
    console.log("✅ MSAL inizializzato con successo");
  } catch (error) {
    console.error("❌ Errore critico inizializzazione MSAL:", error);

    // 🔹 GESTIONE ERRORI SPECIFICA
    if (error instanceof Error) {
      if (
        error.message.includes("AADSTS500011") ||
        error.message.includes("invalid_resource")
      ) {
        console.error("🚨 PROBLEMA CONFIGURAZIONE AZURE AD:");
        console.error("1. La risorsa API non è configurata correttamente");
        console.error("2. Verifica 'Expose an API' nella tua App Registration");
        console.error(
          "3. Oppure usa scope più semplici (openid, profile, email)"
        );
      }
    }

    msalInitialized = true; // 🔹 Marca come inizializzato per evitare loop
  }
};

/** 🔹 GET ACCESS TOKEN - Versione semplificata */
export const getAccessToken = async (): Promise<string | null> => {
  if (!authEnabled()) {
    return "dev-token";
  }

  if (!msalInitialized) {
    console.warn("⚠️ MSAL non inizializzato");
    return null;
  }

  const account = msalInstance.getActiveAccount();
  if (!account) {
    console.log("🔐 Nessun account attivo");
    return null;
  }

  try {
    // 🔹 PROVA prima con scope semplici
    const simpleScopes = {
      scopes: ["openid", "profile", "email"],
    };

    const result = await msalInstance.acquireTokenSilent({
      ...simpleScopes,
      account,
    });

    console.log("✅ Token ottenuto con successo");
    return result.accessToken;
  } catch (error: any) {
    console.warn("⚠️ Errore ottenimento token:", error);
    return null;
  }
};

/** 🔹 FUNZIONE PER LOGIN MANUALE */
export const manualLogin = async (): Promise<void> => {
  if (!authEnabled()) {
    console.log("🔓 MSAL disabilitato - login simulato");
    return;
  }

  try {
    console.log("🔐 Avvio login manuale...");

    // 🔹 USA SCOPES SEMPLIFICATI per il login
    await msalInstance.loginRedirect({
      scopes: ["openid", "profile", "email"],
    });
  } catch (error) {
    console.error("❌ Errore durante il login:", error);
    throw error;
  }
};

/** 🔹 FUNZIONE PER LOGOUT */
export const manualLogout = async (): Promise<void> => {
  if (!authEnabled()) return;

  try {
    console.log("🚪 Logout...");
    await msalInstance.logoutRedirect({
      postLogoutRedirectUri: config.msal.redirectUri,
    });
  } catch (error) {
    console.error("❌ Errore durante il logout:", error);
  }
};

/** 🔹 FUNZIONE PER VERIFICARE STATO AUTENTICAZIONE */
export const ManualgetAuthState = () => {
  if (!authEnabled()) {
    return {
      isAuthenticated: true,
      account: null,
      accounts: [],
    };
  }

  const accounts = msalInstance.getAllAccounts();
  const activeAccount = msalInstance.getActiveAccount();

  return {
    isAuthenticated: accounts.length > 0,
    account: activeAccount,
    accounts: accounts,
  };
};

// ... il resto del codice per le API rimane uguale

/** 🔹 API CONFIGURATION - Gestione errori migliorata */
function createApiConfig(token?: string | null): Configuration {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };

  if (token) {
    headers["Authorization"] = `Bearer ${token}`;
  } else if (authEnabled()) {
    console.warn("⚠️ API chiamate senza token di autenticazione");
  }

  return new Configuration({
    basePath: config.basePath || "http://localhost:8090/api/v1",
    headers: headers,
  });
}

/** 🔹 API WRAPPER SICURO */
class ApiWrapper {
  private static async getConfig() {
    try {
      const token = await getAccessToken();
      return createApiConfig(token);
    } catch (error) {
      console.error("❌ Errore creazione config API:", error);
      return createApiConfig(null); // Config senza token
    }
  }

  static projects = {
    getProjects: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new ProjectsApi(config);
      return api.getProjects();
    },
    createProject: async (project: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new ProjectsApi(config);
      return api.createProject(project);
    },
    getProject: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new ProjectsApi(config);
      return api.getProjects;
    },
    updateProject: async (project: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new ProjectsApi(config);
      return api.updateProject(project);
    },
    deleteProject: async (project: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new ProjectsApi(config);
      return api.deleteProject(project);
    },
  };

  static slots = {
    getSlots: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new SlotsApi(config);
      return api.getSlots();
    },
    createSlot: async (slot: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new SlotsApi(config);
      return api.createSlot(slot);
    },
  };

  static tasks = {
    getTasks: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new TasksApi(config);
      return api.getTasks();
    },
    createTask: async (task: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new TasksApi(config);
      return api.createTask(task);
    },
    getTask: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new TasksApi(config);
      return api.getTasks();
    },
    updateTask: async (task: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new TasksApi(config);
      return api.updateTask(task);
    },
  };

  static users = {
    getUsers: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new UsersApi(config);
      return api.getUsers();
    },
    createUser: async (user: any) => {
      const config = await ApiWrapper.getConfig();
      const api = new UsersApi(config);
      return api.createUser(user);
    },
    getUser: async () => {
      const config = await ApiWrapper.getConfig();
      const api = new UsersApi(config);
      return api.getUsers();
    },
  };
}

/** 🔹 ESPORTA API */
export const projects = ApiWrapper.projects;
export const slots = ApiWrapper.slots;
export const tasks = ApiWrapper.tasks;
export const users = ApiWrapper.users;
