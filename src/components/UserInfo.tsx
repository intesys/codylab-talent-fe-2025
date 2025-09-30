import { useContext } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { WorkloadContext } from "../pages/WorkloadContext";
import classes from "./UserInfo.module.css";
import keycloak from "./keycloak";

export function UserInfo() {
  const { userId } = useParams();
  const { workloadData } = useContext(WorkloadContext);
  const navigate = useNavigate();
  const onClose = () => {
    navigate("/workload");
  };

  const user = workloadData.find((user) => user.id === Number(userId));

  if (!user) {
    return <div>User not found</div>;
  }
  const canEdit = keycloak.hasRealmRole("admin");

  return (
    <div className={classes.sidebar}>
      <button className={classes.closeButton} onClick={onClose}>
        ×
      </button>
      <div className={classes.user_fistName}>
        <h3>{user.firstName} {user.lastName}</h3>
        {canEdit && <Link to={`/workload/${user.id}/edit`}>
          {" "}
          <span className="material-symbols-outlined">edit</span>{" "}
        </Link>}
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
        <strong>Orario giornaliero:</strong> {user.dailyHours || "Nessun orario."} ore
      </p>
    </div>
  );
}
