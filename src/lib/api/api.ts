import { Configuration, ProjectsApi, SlotsApi, TasksApi, UsersApi, type Middleware } from "../../generated/api";
import { msalInstance } from "../../main";
import { loginRequest } from "../../authConfig";

const BASE_PATH = "http://localhost:8090/api/v1";
const authMiddleware: Middleware = {
  pre: async ({ url, init }) => {
    try {
      const accounts = msalInstance.getAllAccounts();

      if (accounts.length === 0) {
        sessionStorage.clear();
        msalInstance.loginRedirect(loginRequest);
      }

      const account = accounts[0];

      try {
        const response = await msalInstance.acquireTokenSilent({
          ...loginRequest,
          account,
        });

        if (response?.accessToken) {
          const headers = new Headers(init.headers);
          headers.set("Authorization", `Bearer ${response.accessToken}`);
          return { url, init: { ...init, headers } };
        } else {
          msalInstance.acquireTokenRedirect({ ...loginRequest, account });
        }
      } catch (silentError) {
        msalInstance.acquireTokenRedirect({ ...loginRequest, account });
      }
    } catch (err) {
      console.warn("authMiddleware: errore generale:", err);
      return Promise.reject(err);
    }
  },
};

// Configurazioni standard con middleware
const config = new Configuration({
  basePath: BASE_PATH,
  middleware: [authMiddleware],
});

export const projects = new ProjectsApi(config);
export const slots = new SlotsApi(config);
export const tasks = new TasksApi(config);
export const users = new UsersApi(config);

