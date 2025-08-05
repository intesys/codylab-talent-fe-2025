import classes from './Actions.module.css';
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';
import  keycloak  from './keycloak'; //

export function Actions() {
  const location = useLocation();
  const isWorkloadPage = location.pathname.startsWith('/workload');

  const handleLogout = () => {
    keycloak.logout({
      redirectUri: window.location.origin 
    });
  };

  return (
    <div className={classes.actions}>
      <ul>
        <li>
          {isWorkloadPage ? (
            <Link to="/workload/add" className={classes.link}>Nuovo Utente</Link>
          ) : (
            <Link to="/projects/add" className={classes.link}>Nuovo Progetto</Link>
          )}
        </li>
        <li>
          <button onClick={handleLogout} className={classes.link}>Logout</button>
        </li>
      </ul>
    </div>
  );
}
