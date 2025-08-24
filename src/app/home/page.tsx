"use client";
import Header from "@/components/header/header";
import WelcomeWrapper from "@/components/ui/welcome/WelcomeWrapper";
import React, { useEffect, useState, useMemo, useCallback } from "react";
import Search from "@/components/ui/common/search";
import Error from "@/components/ui/common/error";
import GroupSide from "@/components/group/Group";
import { AnimatePresence, motion } from "framer-motion";
import Settings from "@/components/settings/Settings";
import { usePathname, useRouter } from "next/navigation";
import { useDebounce } from "@/hooks/useDebounce";
import dynamic from "next/dynamic";
import { TaskContext } from "../context/TaskContext";
import TimerSide from "@/components/timerSide/timerSide";
import { TimerContext } from "../context/timerContext";
const AddTask = dynamic(() => import("@/components/addTask/AddTaks"), {
  ssr: false,
});
const Task = dynamic(() => import("@/components/ui/common/Task"), {
  ssr: false,
});
const Groups = dynamic(() => import("@/components/ui/groups"), { ssr: false });

type Group = { id: string; title: string };
type Todo = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  groupId: string | null;
};
type User = {
  id: string;
  name: string;
  profileImage: string;
  todo: Todo[];
  group?: Group[] | null;
  favorite?: { id: string; todoId: string }[] | null;
};
type Task = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
  groupId: string | null;
};

type TimerTask = {
  id: string;
  title: string;
  description: string;
  deadline: Date;
};

export default function Home() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [selectedGroup, setSelectedGroup] = useState("AII");
  const [searchValue, setSearchValue] = useState("");
  const [isGroupSide, setIsGroupSide] = useState("");
  const [isSettings, setIsSettings] = useState(false);
  const [gTheme, setGTheme] = useState(false);
  const [timer, setTimer] = useState<TimerTask | null>(null);
  const debouncedSearch = useDebounce(searchValue);
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const g = params.get("g");
    if (g) setIsGroupSide(g);
  }, [pathname]);

  useEffect(() => {
    const controller = new AbortController();
    const theme = localStorage.getItem("theme") === "dark";

    if (theme) {
      document.body.classList.add("dark-mode");
      setGTheme(true);
    }

    fetch("/api/user/get", { signal: controller.signal })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setUser(data.user);
        } else {
          setError("Something went wrong");
        }
        setLoading(false);
      })
      .catch((err) => {
        if (err.name !== "AbortError") console.error(err);
        setLoading(false);
      });

    return () => controller.abort();
  }, []);

  const run = useMemo(() => {
    if (!user?.todo?.length) return null;
    return user.todo.reduce(
      (acc, task) =>
        new Date(acc.deadline) > new Date(task.deadline) ? task : acc,
      user.todo[0]
    );
  }, [user?.todo]);

  const filteredTasks = useMemo(() => {
    if (!user) return [];

    let tasks = user.todo ?? [];

    if (debouncedSearch.trim() !== "") {
      const s = debouncedSearch.toLowerCase();
      tasks = tasks.filter((t) => t.title.toLowerCase().includes(s));
    }

    if (selectedGroup !== "AII") {
      if (selectedGroup === "Favorites") {
        const favIds = new Set((user.favorite ?? []).map((fav) => fav.todoId));
        tasks = tasks.filter((t) => favIds.has(t.id));
      } else {
        tasks = tasks.filter((t) => t.groupId === selectedGroup);
      }
    }

    return tasks;
  }, [user, selectedGroup, debouncedSearch]);

  const handleAddTask = useCallback((task: Task) => {
    const newTodo: Todo = { ...task, groupId: task.groupId || null };
    setUser((prev) =>
      prev ? { ...prev, todo: [...prev.todo, newTodo] } : prev
    );
  }, []);

  const handleDelTask = useCallback((taskId: string) => {
    setUser((prev) =>
      prev ? { ...prev, todo: prev.todo.filter((t) => t.id !== taskId) } : prev
    );
  }, []);

  const handleAddGroup = useCallback((group: string, id: string) => {
    setUser((prev) =>
      prev
        ? { ...prev, group: [...(prev.group || []), { title: group, id: id }] }
        : prev
    );
  }, []);

  const handleFilterGroups = useCallback((groupId: string) => {
    setSelectedGroup(groupId);
  }, []);

  function handleErrorMessage(error: string) {
    setError(error);
    setTimeout(() => {
      setError("");
    }, 3000);
  }

  function handleFilterSearch(value: string) {
    setSearchValue(value);
  }

  const handleGroupSide = useCallback(
    (id: string) => {
      if (id !== "AII") {
        const group = user?.group?.find((g) => g.id === id);
        if (group) setIsGroupSide(group.id);
      }
    },
    [user?.group]
  );

  const handleGetBack = useCallback(() => {
    setIsGroupSide("");
    setIsSettings(false);
    setTimer(null)
    const url = new URL(window.location.href);
    url.searchParams.delete("g");
    router.replace(url.toString(), undefined);
  }, [router]);

  const handleGroupChange = useCallback((groupId: string, taskId: string) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            todo: prev.todo.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    groupId: groupId,
                  }
                : t
            ),
          }
        : prev
    );
  }, []);

  const handleTaskCreateInGroup = useCallback((task: Task) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            todo: [
              ...(prev.todo || []),
              {
                id: task.id,
                title: task.title,
                description: task.description,
                deadline: new Date(task.deadline),
                groupId: task.groupId,
              },
            ],
          }
        : prev
    );
  }, []);

  const handleGroupTaskRemove = useCallback((taskId: string) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            todo: prev.todo.map((t) =>
              t.id === taskId
                ? {
                    ...t,
                    groupId: null,
                  }
                : t
            ),
          }
        : prev
    );
  }, []);

  const handleSettings = useCallback(() => {
    setIsSettings(true);
  }, []);

  function handleThemeChange(theme: string) {
    document.body.classList.toggle("dark-mode");
    setGTheme(theme === "dark" ? true : false);
    localStorage.setItem("theme", theme);
  }

  const handleGroupRemove = useCallback((groupId: string) => {
    setSelectedGroup("AII");
    setUser((prev) =>
      prev
        ? {
            ...prev,
            group: prev.group?.filter((g) => g.id !== groupId),
          }
        : prev
    );
  }, []);

  const handleAddFavorite = useCallback(
    (taskId: string, favoriteId: string) => {
      setUser((prev) =>
        prev
          ? {
              ...prev,
              favorite: [
                ...(prev.favorite || []),
                {
                  id: favoriteId,
                  todoId: taskId,
                },
              ],
            }
          : prev
      );
    },
    []
  );

  const handleRemoveFavorite = useCallback((taskId: string) => {
    setUser((prev) =>
      prev
        ? {
            ...prev,
            favorite: prev.favorite?.filter((f) => f.todoId !== taskId),
          }
        : prev
    );
  }, []);

  const handleTimerOpen = useCallback((taskId: string) => {
    const curTask = user?.todo.find((t) => t.id === taskId);
    setTimer({
      id: curTask?.id as string,
      title: curTask?.title as string,
      description: curTask?.description as string,
      deadline: curTask?.deadline as Date
    });
  }, []);

  if (loading) return <p>loading...</p>;
  if (!user) return <p>{error}</p>;
  return (
    <div className="flex flex-col gap-2.5">
      {error !== "" && <Error error={error} />}
      <AnimatePresence>
        {timer !== null && (
          <motion.main
            initial={{ x: "200%" }}
            animate={{ x: 0 }}
            exit={{ x: "200%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              height: "100%",
              width: "100%",
              zIndex: 9999,
            }}
          >
            <TimerContext.Provider value={timer}>
              <TimerSide getBack={handleGetBack} />
            </TimerContext.Provider>
          </motion.main>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isSettings && (
          <motion.main
            initial={{ x: "200%" }}
            animate={{ x: 0 }}
            exit={{ x: "200%" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              height: "100%",
              width: "100%",
              zIndex: 9999,
            }}
          >
            <Settings
              getBack={handleGetBack}
              onThemeChange={handleThemeChange}
              theme={gTheme}
            />
          </motion.main>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {isGroupSide !== "" && (
          <motion.main
            initial={{ x: "200vw" }}
            animate={{ x: 0 }}
            exit={{ x: "200vw" }}
            transition={{ duration: 0.8, ease: "easeInOut" }}
            style={{
              position: "fixed",
              top: 0,
              height: "100%",
              width: "100%",
              zIndex: 9999,
            }}
          >
            <TaskContext.Provider value={user.todo}>
              <GroupSide
                userId={user.id}
                onDel={handleDelTask}
                onError={handleErrorMessage}
                onClick={handleGetBack}
                groupId={isGroupSide}
                onGroup={handleGroupChange}
                onTaskCreate={handleTaskCreateInGroup}
                onGroupTaskDel={handleGroupTaskRemove}
                onGroulDel={handleGroupRemove}
                removeFavorite={handleRemoveFavorite}
                addFavorite={handleAddFavorite}
                favorites={user.favorite || []}
              />
            </TaskContext.Provider>
          </motion.main>
        )}
      </AnimatePresence>

      <Header getSettings={handleSettings} />
      <WelcomeWrapper
        name={user.name || ""}
        iamge={user.profileImage === "user" ? "/user.webp" : user.profileImage}
      />
      {run && (
        <div className="p-2.5 flex flex-col gap-2.5">
          <h1>Run</h1>
          <Task
            userId={user.id}
            id={run.id}
            title={run.title}
            description={run.description}
            isRun={true}
            onDel={handleDelTask}
            delay={0}
            onError={handleErrorMessage}
            favoriteId={
              user.favorite?.find((fav) => fav.todoId === run.id)?.id || ""
            }
            getTimerSide={handleTimerOpen}
            addFavorite={handleAddFavorite}
            removeFavorite={handleRemoveFavorite}
          />
        </div>
      )}
      <Search onChange={handleFilterSearch} />
      <Groups
        userId={user.id}
        groupTitle={user.group || []}
        onAdd={handleAddGroup}
        onFilter={handleFilterGroups}
        onError={handleErrorMessage}
        onClick={handleGroupSide}
        isFavorite={user.favorite?.length ? true : false}
      />
      <main className="flex flex-col gap-1.25">
        {filteredTasks.map((task, index) => (
          <Task
            key={task.id}
            title={task.title}
            description={task.description}
            isRun={false}
            delay={index * 100}
            userId={user.id}
            id={task.id}
            onDel={handleDelTask}
            onError={handleErrorMessage}
            getTimerSide={handleTimerOpen}
            favoriteId={
              user.favorite?.find((fav) => fav.todoId === task.id)?.id || ""
            }
            addFavorite={handleAddFavorite}
            removeFavorite={handleRemoveFavorite}
          />
        ))}
      </main>
      <AddTask onAdd={handleAddTask} onError={handleErrorMessage} />
    </div>
  );
}
