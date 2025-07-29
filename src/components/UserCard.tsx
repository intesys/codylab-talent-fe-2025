import { useNavigate, useParams } from "react-router-dom";
import type { Users } from "../generated/api/models/Users";
import classes from "./UserCard.module.css";
import type { Tasks } from "../generated/api";

export function UserCard({ user, onUserClick, onTaskClick }: { user: Users; onUserClick: (user: Users) => void; onTaskClick: (task: Tasks) => void }) {
  const {userId} = useParams();
  const navigate = useNavigate();

  const handleNewTaskClick = () => {
    navigate(`/workload/users/${user.id}/add/task`);
  };
  return (
    <section className={`${classes.user} ${user.id?.toString() === userId ? classes.active : ""}`}>
      <h2 onClick={() => onUserClick(user)}>{user.firstName} {user.lastName}</h2>
      <div className={classes.tasks}>
        {user.tasks?.map((task) => (
          <div key={task.id}>
            <h4>{task.projectId}</h4>
            <ul>
              <li onClick={()=>onTaskClick(task)}>{task.name}</li>
            </ul>
          </div>
        ))}
        <p className={classes.newTask} onClick={()=>handleNewTaskClick()}>Nuova Task</p>
      </div>
    </section>
  );
}

