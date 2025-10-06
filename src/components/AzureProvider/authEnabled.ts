import { config } from "../../config";

export const authEnabled = () => config.msal.enabled;
