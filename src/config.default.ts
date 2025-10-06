/**
 * Use this file only for defining default configuration
 */
import { GlobalConfig } from "./types/config";

/**
 * DON'T USE THIS FOR ACCESSING GLOBAL CONFIGURATION!
 * USe "config" from "/config.ts" instead
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
     */
    enabled: process.env.NODE_ENV !== "development",
    clientId: "",
    authority: "",
    redirectUri: "",
  },
};
