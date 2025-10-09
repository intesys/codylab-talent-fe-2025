import classes from './Actions.module.css';
import { Link } from "react-router-dom";
import { useLocation } from 'react-router-dom';

export function Actions() {
  const location = useLocation();
  const isWorkloadPage = location.pathname.startsWith('/workload');


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
          <button className={classes.logoutBtn}>Logout</button>
        </li>
      </ul>
    </div>
  );
}
