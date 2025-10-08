import classes from "./Actions.module.css";
import { Link, useLocation } from "react-router-dom";
 // 👈 importa il tuo msalInstance (adatta il percorso se serve)
import { config } from "../config";
import { msalInstance } from "../lib/api/msalInstance";


export function Actions() {
  const location = useLocation();
  const isWorkloadPage = location.pathname.startsWith("/workload");

  const handleLogout = () => {
    // 👇 logout con redirect a home (come faceva keycloak)
    msalInstance.logoutRedirect({
      postLogoutRedirectUri: config.msal.redirectUri || window.location.origin,
    });
  };

  return (
    <div className={classes.actions}>
      <ul>
        <li>
          {isWorkloadPage ? (
            <Link to="/workload/add" className={classes.link}>
              Nuovo Utente
            </Link>
          ) : (
            <Link to="/projects/add" className={classes.link}>
              Nuovo Progetto
            </Link>
          )}
        </li>
        <li>
          <button onClick={handleLogout} className={classes.logoutBtn}>
            Logout
          </button>
        </li>
      </ul>
    </div>
  );
}
