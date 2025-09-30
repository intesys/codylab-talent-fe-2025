import { useRef, useState } from "react";

export function useAuth() {
  const [authenticated, setAuthenticated] = useState<boolean>(false);
  const [token, setToken] = useState<string | undefined>(undefined);
  const [loading, setLoading] = useState(true);

  const refreshInterval = useRef<ReturnType<typeof setInterval> | null>(null);
  const keycloakInstance = useRef<any>(null);

    const initialize = async () => {
      try {
        const { default: keycloak } = await import("../../components/keycloak");
        keycloakInstance.current = keycloak;

        if(!keycloak.didInitialize) {  
        const auth = await keycloak.init({
          onLoad: "login-required",
          checkLoginIframe: false,
          pkceMethod: "S256",
          redirectUri: window.location.origin,       
        });
        setAuthenticated(auth);
      }

        setToken(keycloak.token);
        setLoading(false);

      } catch (err) {
        console.error("Errore inizializzazione Keycloak", err);
        setAuthenticated(false);
        setLoading(false);
      }
    };

    initialize();
    #prova
  
  return { loading, authenticated, token };
}
