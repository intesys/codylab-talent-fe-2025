import { Config } from "./config";

export const msalConfig = {
  auth: {
    clientId: Config.clientId,
    authority: Config.authority,
    redirectUri: Config.redirectUri,
    
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: [`${Config.clientId}/.default`],
};
