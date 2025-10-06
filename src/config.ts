import { defaultConfig } from "./config.default";
import type { GlobalConfig } from "./components/Types";

/**
 * Global configuration file, containing all environment variables and not included in building artifacts.
 * Defaults are defined in /config.default.ts
 */
const configPath = "/config/config.json";

/**
 * Global configuration
 */
export const config: GlobalConfig = defaultConfig as GlobalConfig;

/**
 * Load configuration dynamically, called once at startup, before bootstrapping app
 */
export const loadConfig = () =>
  fetch(configPath)
    .then((res) => res.json())
    .catch(() => {
      if (process.env.NODE_ENV === "production") {
        console.error(
          "Loading default config. If this is a production environment, please serve the configuration via '/config/config.js'"
        );
      }

      return defaultConfig;
    })
    .then((loadedConfig: GlobalConfig) => {
      (Object.keys(config) as (keyof GlobalConfig)[]).forEach((key) => {
        if (!loadedConfig[key]) {
          throw new Error(
            `Configuration error: "${configPath}" does not have the required property "${key}".`
          );
        }
        // eslint-disable-next-line @typescript-eslint/ban-ts-comment
        // @ts-ignore
        config[key] = loadedConfig[key as keyof GlobalConfig];
      });

      if (process.env.NODE_ENV === "development") {
        console.log(
          "Configuration loaded: \n",
          JSON.stringify(config, null, "\t")
        );
      }
    })
    .catch(console.error);
