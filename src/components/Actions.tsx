import classes from './Actions.module.css';
import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../assets/hooks/useAuth"; // 🔹 importa l’hook

export function Actions() {
  const location = useLocation();
  const isWorkloadPage = location.pathname.startsWith('/workload');
  
  const { logout } = useAuth(); // 🔹 prendi la funzione logout

  const handleLogout = () => {
    logout(); // 🔹 chiama direttamente il logout di Azure AD
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
