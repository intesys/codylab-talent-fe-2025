export const msalConfig = {
  auth: {
    clientId: "279c3475-04a5-4a02-b595-5c576648588a",
    authority: `https://login.microsoftonline.com/5b1eef84-b293-48b4-8c78-519fb6c2206e`,
    redirectUri: "http://localhost:5173", // o il tuo dominio
  },
  cache: {
    cacheLocation: "sessionStorage",
    storeAuthStateInCookie: false,
  },
};

export const loginRequest = {
  scopes: ["279c3475-04a5-4a02-b595-5c576648588a/.default"],
};
