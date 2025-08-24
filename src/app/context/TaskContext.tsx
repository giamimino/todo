import { createContext } from "react";
type Task = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  groupId: string | null;
};
export const TaskContext = createContext<Task[] | null>(null);
