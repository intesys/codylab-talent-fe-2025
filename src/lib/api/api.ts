// import {
//   Configuration,
//   ProjectsApi,
//   SlotsApi,
//   TasksApi,
//   UsersApi,
// } from "../../generated/api";



import type {
  AuthenticationResult,
  EventMessage,
  EventType,
  PublicClientApplication,
} from "@azure/msal-browser";
import { authEnabled } from "../../../src//components/AzureProvider/authEnabled";
import { config } from "../../config";

export const loginRequest = {
  scopes: [`${config.msal.clientId}/.default`],
};

export const graphRequest = {
  scopes: ["Calendars.Read"],
};

export const msalInstance = new PublicClientApplication({
  auth: {
    clientId: `${config.msal.clientId}`,
    authority: `${config.msal.authority}`, // This is a URL (e.g. https://login.microsoftonline.com/{your tenant ID})
    redirectUri: `${config.msal.redirectUri}`,
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false, // Set this to "true" if you are having issues on IE11 or Edge
  },
});

// Check if there are already accounts in the browser session
// If so, set the first account as the active account
const accounts = msalInstance.getAllAccounts();

if (accounts && accounts.length > 0) {
  msalInstance.setActiveAccount(accounts[0]);
}

msalInstance.addEventCallback((event: EventMessage) => {
  if (event.eventType === EventType.LOGIN_SUCCESS && event.payload) {
    // Set the active account - this simplifies token acquisition
    const authResult = event.payload as AuthenticationResult;
    msalInstance.setActiveAccount(authResult.account);
  }
});

export const getAccessToken = async () => {
  if (!authEnabled()) {
    return "";
  }
  const authenticationResult = await msalInstance
    .acquireTokenSilent({ ...loginRequest, account: accounts[0] })
    .catch((/* error */) => {
      // Cleaning all data in storage should take you back to Login and (hopefully) fix #139
      sessionStorage.clear();
      return msalInstance.acquireTokenRedirect({ ...loginRequest });
    });

  return authenticationResult?.accessToken ?? "";
};


// import keycloak from "../../components/keycloak";

// const BASE_PATH = "http://localhost:8090/api/v1";

// async function createConfig(): Promise<Configuration> {
//   try {
//     await keycloak.updateToken(70);
//   } catch (error) {
//     console.warn("Errore aggiornamento token", error);
//     keycloak.login();
//   }

//   return new Configuration({
//     basePath: BASE_PATH,
//     credentials: "include",
//     headers: {
//       Authorization: keycloak.token ? `Bearer ${keycloak.token}` : "",
//     },
//   });
// }

// function createProxy<T extends new (...args: any[]) => any>(ApiClass: T): InstanceType<T> {
//   return new Proxy({} as InstanceType<T>, {
//     get(_target, prop, _receiver) {
//       return async (...args: any[]) => {
//         const config = await createConfig();
//         const instance = new ApiClass(config);
//         const method = instance[prop as keyof InstanceType<T>];
//         if (typeof method === "function") {
//           return (method as Function).apply(instance, args);
//         }
//         return method;
//       };
//     },
//   });
// }

// export const projects = createProxy(ProjectsApi);
// export const slots = createProxy(SlotsApi);
// export const tasks = createProxy(TasksApi);
// export const users = createProxy(UsersApi);
