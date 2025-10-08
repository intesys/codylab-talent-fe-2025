import { useContext, useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WorkloadContext } from "../pages/WorkloadContext";
import { getAccessToken } from "../lib/api/msalInstance";
import classes from "./UserInfo.module.css";

export function UserInfo() {
  const { userId } = useParams();
  const { workloadData } = useContext(WorkloadContext);
  const navigate = useNavigate();

  const [canEdit, setCanEdit] = useState(false);

  // 🔐 Controlla i ruoli dal token MSAL
  useEffect(() => {
    const checkRoles = async () => {
      try {
        const token = await getAccessToken();
        if (!token) return;

        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles: string[] =
          payload.roles || payload["scp"]?.split(" ") || [];

        if (roles.includes("admin")) {
          setCanEdit(true);
        }
      } catch (error) {
        console.error("Errore durante la verifica dei ruoli:", error);
      }
    };

    checkRoles();
  }, []);

  const onClose = () => {
    navigate("/workload");
  };

  const user = workloadData.find((user) => user.id === Number(userId));

  if (!user) {
    return <div>Utente non trovato</div>;
  }

  return (
    <div className={classes.sidebar}>
      <button className={classes.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={classes.user_firstName}>
        <h3>
          {user.firstName} {user.lastName}
        </h3>
        {canEdit && (
          <Link to={`/workload/${user.id}/edit`}>
            <span className="material-symbols-outlined">edit</span>
          </Link>
        )}
      </div>

      <p>
        <strong>ID:</strong> {user.id}
      </p>
      <p>
        <strong>Username:</strong> {user.username}
      </p>
      <p>
        <strong>Email:</strong> {user.email}
      </p>
      <p>
        <strong>Profilo:</strong> {user.profile || "Nessun profilo."}
      </p>
      <p>
        <strong>Orario giornaliero:</strong>{" "}
        {user.dailyHours || "Nessun orario."} ore
      </p>
    </div>
  );
}
