import { useState } from "react";
import { Trash2, Circle, CheckCircle2 } from "lucide-react";
import type { Todo, TodosProps } from "../types";

export default function Todos({ todos, onUpdateTodos }: TodosProps) {
  const [newTodo, setNewTodo] = useState("");

  const handleAddTodo = () => {
    if (!newTodo.trim()) return;
    const todo: Todo = {
      id: Date.now().toString(),
      title: newTodo.trim(),
      status: false,
    };
    onUpdateTodos([...todos, todo]);
    setNewTodo("");
  };

  const handleToggleTodo = (id: string) => {
    const updated = todos.map((t) => (t.id === id ? { ...t, status: !t.status } : t));
    onUpdateTodos(updated);
  };

  const handleDeleteTodo = (id: string) => {
    const updated = todos.filter((t) => t.id !== id);
    onUpdateTodos(updated);
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 h-full flex flex-col">
      {/* Input */}
      <div className="p-4 border-b border-zinc-200 dark:border-zinc-800">
        <input
          type="text"
          value={newTodo}
          onChange={(e) => setNewTodo(e.target.value)}
          onKeyPress={(e) => e.key === "Enter" && handleAddTodo()}
          placeholder="Add a task..."
          className="w-full px-4 py-2.5 border border-zinc-300 dark:border-zinc-700 rounded-lg bg-white dark:bg-zinc-800 text-zinc-800 dark:text-zinc-200 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-600 transition-shadow"
        />
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto p-4 space-y-2">
        {todos.map((todo) => (
          <div
            key={todo.id}
            className="group flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
          >
            <button onClick={() => handleToggleTodo(todo.id)} className="mt-0.5 flex-shrink-0">
              {todo.status ? (
                <CheckCircle2 className="w-5 h-5 text-blue-500" />
              ) : (
                <Circle className="w-5 h-5 text-zinc-400 dark:text-zinc-600 hover:text-zinc-600 dark:hover:text-zinc-400 transition-colors" />
              )}
            </button>
            <span
              className={`flex-1 text-sm leading-relaxed transition-all ${
                todo.status
                  ? "line-through text-zinc-400 dark:text-zinc-600"
                  : "text-zinc-700 dark:text-zinc-300"
              }`}
            >
              {todo.title}
            </span>
            <button
              onClick={() => handleDeleteTodo(todo.id)}
              className="opacity-0 group-hover:opacity-100 flex-shrink-0 p-1 hover:bg-red-100 dark:hover:bg-red-900/30 rounded transition-all"
            >
              <Trash2 className="w-4 h-4 text-red-600 dark:text-red-400" />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
