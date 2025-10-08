import { useForm } from "@tanstack/react-form";
import { useContext, useEffect, useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import type { Users } from "../generated/api";
import { users, getAccessToken } from "../lib/api/msalInstance";
import { WorkloadContext } from "../pages/WorkloadContext";
import classes from "./UserForm.module.css";

export function UserForm() {
  const { workloadData: usersData, refreshWorkload } =
    useContext(WorkloadContext);

  const navigate = useNavigate();
  const { id: userId } = useParams();
  const currentUser = usersData.find((u) => u.id?.toString() === userId);

  const [canEdit, setCanEdit] = useState(false);
  const [loading, setLoading] = useState(true);

  // 🔐 Controlla i ruoli nel token MSAL
  useEffect(() => {
    const checkRoles = async () => {
      try {
        const token = await getAccessToken();
        if (!token) {
          navigate("/workload");
          return;
        }

        const payload = JSON.parse(atob(token.split(".")[1]));
        const roles: string[] =
          payload.roles || payload["scp"]?.split(" ") || [];

        if (roles.includes("admin")) {
          setCanEdit(true);
        } else {
          alert("Non hai i permessi per modificare o creare utenti.");
          navigate("/workload");
        }
      } catch (error) {
        console.error("Errore nel controllo dei ruoli:", error);
        navigate("/workload");
      } finally {
        setLoading(false);
      }
    };

    checkRoles();
  }, [navigate]);

  if (loading) {
    return <div>Verifica dei permessi in corso...</div>;
  }

  const defaultValues = currentUser
    ? {
        firstName: currentUser.firstName ?? "",
        lastName: currentUser.lastName ?? "",
        username: currentUser.username ?? "",
        email: currentUser.email ?? "",
        profile: currentUser.profile ?? "",
        dailyHours: currentUser.dailyHours ?? 0,
      }
    : {
        firstName: "",
        lastName: "",
        username: "",
        email: "",
        profile: "",
        dailyHours: 0,
      };

  // eslint-disable-next-line react-hooks/rules-of-hooks
  const form = useForm({
    defaultValues,
    onSubmit: async ({ value }) => {
      if (!canEdit) {
        alert("Non hai i permessi per modificare o creare utenti.");
        return;
      }

      const save = currentUser
        ? (user: { users: Users }) =>
            users.updateUser({ id: currentUser.id!, users: user.users })
        : (user: { users: Users }) => users.createUser(user);

      const userData = {
        users: {
          ...value,
          dailyHours: value.dailyHours,
        },
      };

      try {
        await save(userData);
        await refreshWorkload();
        alert("Utente salvato correttamente!");
        navigate("/workload");
      } catch (error) {
        console.error("Errore durante il salvataggio utente:", error);
        alert("Errore durante il salvataggio dell'utente.");
      }
    },
  });

  return (
    <div className={classes.user_form}>
      <form
        onSubmit={(e) => {
          e.preventDefault();
          form.handleSubmit();
        }}
      >
        <form.Field name="firstName">
          {(field) => (
            <>
              <label>Nome Utente</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="lastName">
          {(field) => (
            <>
              <label>Cognome Utente</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="username">
          {(field) => (
            <>
              <label>Username</label>
              <input
                type="text"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="email">
          {(field) => (
            <>
              <label>Email</label>
              <input
                type="email"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              />
            </>
          )}
        </form.Field>

        <form.Field name="profile">
          {(field) => (
            <>
              <label>Profilo</label>
              <select
                name="profile"
                value={field.state.value}
                onChange={(e) => field.handleChange(e.target.value)}
                required
              >
                <option value="">-- Seleziona un profilo --</option>
                <option value="manager">Manager</option>
                <option value="developer">Developer</option>
                <option value="designer">Designer</option>
                <option value="admin">Admin</option>
              </select>
            </>
          )}
        </form.Field>

        <form.Field name="dailyHours">
          {(field) => (
            <>
              <label>Ore di lavoro</label>
              <input
                type="number"
                value={field.state.value}
                onChange={(e) => field.handleChange(Number(e.target.value))}
                required
              />
            </>
          )}
        </form.Field>

        <button className={classes.addBtn} type="submit">
          {currentUser ? "Aggiorna Utente" : "Crea Utente"}
        </button>
      </form>
    </div>
  );
}
