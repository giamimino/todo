import { createContext } from "react";

type Task = {
  id: string,
  title: string,
  description: string
  deadline: Date,
}

export const TimerContext = createContext<Task | null>(null)