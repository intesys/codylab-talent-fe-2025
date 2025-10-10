/**
 * Use this file only for defining default configuration
 */
import type { GlobalConfig } from "./components/Types";

/// config/default.ts
export const defaultConfig: GlobalConfig = {
  basePath: "/api",
  timeSlots: 15,
  morningSlot: {
    start: "9:00",
    end: "13:00",
  },
  afternoonSlot: {
    start: "14:00",
    end: "18:00",
  },
  msal: {
    /**
     * 👇 ABILITA SEMPRE l'autenticazione per testare Azure AD
     */
    enabled: true, // SEMPRE true per testare Azure AD

    clientId: "279c3475-04a5-4a02-b595-5c576648588a",
    authority: "https://login.microsoftonline.com/5b1eef84-b293-48b4-8c78-519fb6c2206e",
    redirectUri: "http://localhost:5173", // 👈 CORREGGI LA PORTA
    postLogoutRedirectUri: "http://localhost:5173",

    /**
     * 👇 AGGIUNGI gli scope
     */
    scopes: [
      "openid",
      "profile",
      "email",
      "api://279c3475-04a5-4a02-b595-5c576648588a/.default" // Scope per la tua API
    ]
  },
};
