import {
  Configuration,
  ProjectsApi,
  SlotsApi,
  TasksApi,
  UsersApi,
} from "../../generated/api";

const BASE_PATH = "http://localhost:8090/api/v1";

export const projects = new ProjectsApi(
  new Configuration({ basePath: BASE_PATH })
);

export const slots = new SlotsApi(
  new Configuration({ basePath: BASE_PATH })
);
export const tasks = new TasksApi(
  new Configuration({ basePath: BASE_PATH })
); 
export const users = new UsersApi(
  new Configuration({ basePath: BASE_PATH })
);
