import { useParams, useNavigate } from "react-router";
import { useQuery } from "@tanstack/react-query";
import { doc, getDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { ArrowLeft, Circle, CheckCircle2 } from "lucide-react";
import type { DailyData } from "../types";

const fetchDay = async (id: string): Promise<DailyData | null> => {
  const docRef = doc(db, "dailyDocs", id);
  const docSnap = await getDoc(docRef);

  if (docSnap.exists()) {
    return { id: docSnap.id, ...docSnap.data() } as DailyData;
  }
  return null;
};

export default function TimelineDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();

  const {
    data: day,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ["day", id],
    queryFn: () => fetchDay(id!),
    enabled: !!id,
  });

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <div className="flex items-center justify-center py-12">
          <div className="w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError || !day) {
    return (
      <div className="max-w-4xl mx-auto py-12 px-4">
        <button
          onClick={() => navigate(-1)}
          className="flex items-center gap-2 mb-6 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          <span className="text-sm">Back to Timeline</span>
        </button>
        <div className="text-center py-12">
          <p className="text-zinc-500 dark:text-zinc-400">Day not found</p>
        </div>
      </div>
    );
  }

  const hasNotes = day.notes && Array.isArray(day.notes) && day.notes.length > 0;
  const hasTodos = day.todos && Array.isArray(day.todos) && day.todos.length > 0;

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <button
        onClick={() => navigate(-1)}
        className="flex items-center gap-2 mb-8 text-zinc-600 dark:text-zinc-400 hover:text-zinc-800 dark:hover:text-zinc-200 transition-colors"
      >
        <ArrowLeft className="w-4 h-4" />
        <span className="text-sm">Back to Timeline</span>
      </button>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 to-zinc-200 dark:from-blue-600 dark:to-zinc-800"></div>

        {/* Content */}
        <div className="relative flex gap-6">
          {/* Date Icon */}
          <div className="relative z-10 flex-shrink-0">
            <div className="w-10 h-10 rounded-full bg-white dark:bg-zinc-900 border-2 border-blue-500 dark:border-blue-600 flex items-center justify-center shadow-sm">
              <div className="text-xs font-bold text-blue-600 dark:text-blue-400">
                {new Date(day.date).getDate()}
              </div>
            </div>
          </div>

          {/* Content */}
          <div className="flex-1 pb-8">
            {/* Date Header */}
            <div className="mb-4">
              <h1 className="text-xl font-bold text-zinc-800 dark:text-zinc-100">
                {new Date(day.date).toLocaleDateString("en-US", {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </h1>
            </div>

            {/* Card */}
            <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm">
              {/* Notes */}
              {hasNotes && (
                <div className="p-5 border-b border-zinc-100 dark:border-zinc-800">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-blue-500 rounded-full"></div>
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Journal Entries
                    </h2>
                  </div>
                  <div className="space-y-4">
                    {day.notes!.map((note, i) => {
                      const noteContent = typeof note === "string" ? note : note.content || "";

                      return noteContent ? (
                        <div key={i} className="p-4 bg-zinc-50 dark:bg-zinc-800 rounded-lg">
                          <p className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed whitespace-pre-wrap">
                            {noteContent}
                          </p>
                        </div>
                      ) : null;
                    })}
                  </div>
                </div>
              )}

              {/* Todos */}
              {hasTodos && (
                <div className="p-5">
                  <div className="flex items-center gap-2 mb-4">
                    <div className="w-1 h-5 bg-green-500 rounded-full"></div>
                    <h2 className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
                      Tasks
                    </h2>
                    <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600 bg-zinc-100 dark:bg-zinc-800 px-2 py-1 rounded">
                      {day.todos!.filter((t) => t.status).length}/{day.todos!.length} completed
                    </span>
                  </div>
                  <div className="space-y-2">
                    {day.todos!.map((todo) => (
                      <div
                        key={todo.id}
                        className="flex items-start gap-3 p-3 rounded-lg hover:bg-zinc-50 dark:hover:bg-zinc-800 transition-colors"
                      >
                        {todo.status ? (
                          <CheckCircle2 className="w-4.5 h-4.5 text-green-500 mt-0.5 flex-shrink-0" />
                        ) : (
                          <Circle className="w-4.5 h-4.5 text-zinc-300 dark:text-zinc-700 mt-0.5 flex-shrink-0" />
                        )}
                        <span
                          className={`text-sm flex-1 ${
                            todo.status
                              ? "line-through text-zinc-400 dark:text-zinc-600"
                              : "text-zinc-700 dark:text-zinc-300"
                          }`}
                        >
                          {todo.title}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {!hasNotes && !hasTodos && (
                <div className="p-8 text-center">
                  <p className="text-sm text-zinc-400 dark:text-zinc-600 italic">
                    No activity on this day
                  </p>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
