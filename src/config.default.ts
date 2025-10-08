/**
 * Use this file only for defining default configuration
 */
import type { GlobalConfig } from "./components/Types";

/**
 * DON'T USE THIS FOR ACCESSING GLOBAL CONFIGURATION!
 * Use "config" from "/config.ts" instead
 */
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
     * In production, ensure to enable authentication
     * 👉 Se vuoi disattivare il login in locale, metti a false.
     */
    enabled: process.env.NODE_ENV !== "development",

    /**
     * Questi valori verranno sovrascritti da /config/config.json
     * ma li lasciamo qui come fallback (dev/test).
     */
    clientId: "279c3475-04a5-4a02-b595-5c576648588a",
    authority:
      "https://login.microsoftonline.com/5b1eef84-b293-48b4-8c78-519fb6c2206e",
    redirectUri: "http://localhost:5173",
  },
};
