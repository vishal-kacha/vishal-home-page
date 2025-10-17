import { useInfiniteQuery } from "@tanstack/react-query";
import { useIntersectionObserver } from "@uidotdev/usehooks";
import {
  collection,
  query,
  orderBy,
  limit,
  startAfter,
  getDocs,
  QueryDocumentSnapshot,
  type DocumentData,
  QuerySnapshot,
  QueryConstraint,
  where,
} from "firebase/firestore";
import { db } from "../lib/firebase";
import { Calendar, Circle, CheckCircle2 } from "lucide-react";
import type { DailyData, Todo, Note } from "../types";
import type { JSX } from "react";

const ITEMS_PER_PAGE = 10;

type FetchDaysParams = {
  pageParam: QueryDocumentSnapshot<DocumentData> | null;
};

type FetchDaysResponse = {
  days: DailyData[];
  nextCursor: QueryDocumentSnapshot<DocumentData> | undefined;
  hasMore: boolean;
};

async function fetchDays({ pageParam = null }: FetchDaysParams): Promise<FetchDaysResponse> {
  // Get end of today to filter out future dates
  const today = new Date();
  today.setHours(23, 59, 59, 999);
  const todayDateString = today.toISOString().split("T")[0];

  const constraints: QueryConstraint[] = [
    where("date", "<=", todayDateString),
    orderBy("date", "desc"),
    limit(ITEMS_PER_PAGE),
  ];

  if (pageParam) {
    constraints.push(startAfter(pageParam));
  }

  const q = query(collection(db, "dailyDocs"), ...constraints);
  const snapshot: QuerySnapshot<DocumentData> = await getDocs(q);

  const daysData: DailyData[] = snapshot.docs.map((doc) => ({
    id: doc.id,
    date: doc.data().date as string,
    notes: (doc.data().notes as Note[]) || [],
    todos: (doc.data().todos as Todo[]) || [],
  }));

  return {
    days: daysData,
    nextCursor: snapshot.docs[snapshot.docs.length - 1],
    hasMore: snapshot.docs.length === ITEMS_PER_PAGE,
  };
}

export default function Timeline(): JSX.Element {
  const { data, fetchNextPage, hasNextPage, isFetchingNextPage, isLoading, isError } =
    useInfiniteQuery<
      FetchDaysResponse,
      Error,
      { pages: FetchDaysResponse[] },
      [string],
      QueryDocumentSnapshot<DocumentData> | null
    >({
      queryKey: ["timeline"],
      queryFn: fetchDays,
      getNextPageParam: (lastPage: FetchDaysResponse) =>
        lastPage.hasMore ? lastPage.nextCursor : undefined,
      initialPageParam: null,
    });

  const [ref, entry] = useIntersectionObserver<HTMLDivElement>({
    threshold: 0,
    rootMargin: "100px",
  });

  // Trigger fetch when sentinel is visible
  if (entry?.isIntersecting && hasNextPage && !isFetchingNextPage) {
    fetchNextPage();
  }

  const allDays: DailyData[] = data?.pages?.flatMap((page: FetchDaysResponse) => page.days) ?? [];

  if (isLoading) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <div className="inline-block w-8 h-8 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200 rounded-full animate-spin"></div>
        </div>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="max-w-4xl mx-auto py-8 px-4">
        <div className="text-center py-12">
          <p className="text-sm text-red-500">Error loading timeline</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-8">
        <h1 className="text-2xl font-bold text-zinc-800 dark:text-zinc-100">Timeline</h1>
        <p className="text-sm text-zinc-500 dark:text-zinc-400 mt-1">Your daily activity</p>
      </div>

      <div className="relative">
        {/* Vertical Line */}
        <div className="absolute left-5 top-0 bottom-0 w-0.5 bg-gradient-to-b from-blue-500 via-zinc-200 to-zinc-200 dark:from-blue-600 dark:via-zinc-800 dark:to-zinc-800"></div>

        <div className="space-y-8">
          {allDays.map((day: DailyData) => {
            const hasNotes: boolean = day.notes && Array.isArray(day.notes) && day.notes.length > 0;
            const hasTodos: boolean = day.todos && Array.isArray(day.todos) && day.todos.length > 0;
            const hasContent: boolean = hasNotes || hasTodos;

            return (
              <div key={day.id} className="relative flex gap-6">
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
                  <div className="mb-3">
                    <div className="flex items-baseline gap-3">
                      <h2 className="text-base font-semibold text-zinc-800 dark:text-zinc-100">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                        })}
                      </h2>
                      <span className="text-sm text-zinc-400 dark:text-zinc-600">
                        {new Date(day.date).toLocaleDateString("en-US", {
                          weekday: "long",
                        })}
                      </span>
                    </div>
                  </div>

                  {/* Card */}
                  {hasContent ? (
                    <div className="bg-white dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-lg overflow-hidden shadow-sm hover:shadow-md transition-shadow">
                      {/* Notes Section */}
                      {hasNotes && (
                        <div className="p-4 border-b border-zinc-100 dark:border-zinc-800">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 bg-blue-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                              Journal
                            </span>
                          </div>
                          <div className="space-y-2">
                            {day.notes.map((note: Note | string, i: number) => {
                              const noteContent: string =
                                typeof note === "string" ? note : note.content || "";

                              return noteContent ? (
                                <div
                                  key={i}
                                  className="text-sm text-zinc-700 dark:text-zinc-300 leading-relaxed"
                                >
                                  <p className="whitespace-pre-wrap line-clamp-3">{noteContent}</p>
                                </div>
                              ) : null;
                            })}
                          </div>
                        </div>
                      )}

                      {/* Todos Section */}
                      {hasTodos && (
                        <div className="p-4">
                          <div className="flex items-center gap-2 mb-3">
                            <div className="w-1 h-4 bg-green-500 rounded-full"></div>
                            <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400 uppercase tracking-wide">
                              Tasks
                            </span>
                            <span className="ml-auto text-xs text-zinc-400 dark:text-zinc-600">
                              {day.todos.filter((t: Todo) => t.status).length}/{day.todos.length}
                            </span>
                          </div>
                          <div className="space-y-1">
                            {day.todos.slice(0, 3).map((todo: Todo) => (
                              <div key={todo.id} className="flex items-center gap-2.5 py-1.5">
                                {todo.status ? (
                                  <CheckCircle2 className="w-4 h-4 text-green-500 flex-shrink-0" />
                                ) : (
                                  <Circle className="w-4 h-4 text-zinc-300 dark:text-zinc-700 flex-shrink-0" />
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
                            {day.todos.length > 3 && (
                              <div className="text-xs text-zinc-400 dark:text-zinc-600 pt-1">
                                +{day.todos.length - 3} more tasks
                              </div>
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="bg-zinc-50 dark:bg-zinc-900/50 border border-dashed border-zinc-300 dark:border-zinc-700 rounded-lg p-4">
                      <p className="text-xs text-zinc-400 dark:text-zinc-600 italic">No activity</p>
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        {/* Intersection Observer Sentinel */}
        {hasNextPage && <div ref={ref} className="h-4" />}

        {isFetchingNextPage && (
          <div className="text-center py-8">
            <div className="inline-block w-6 h-6 border-2 border-zinc-300 dark:border-zinc-700 border-t-zinc-800 dark:border-t-zinc-200 rounded-full animate-spin"></div>
          </div>
        )}

        {!hasNextPage && allDays.length > 0 && (
          <div className="relative flex gap-6 opacity-50">
            <div className="relative z-10 flex-shrink-0">
              <div className="w-10 h-10 rounded-full bg-zinc-100 dark:bg-zinc-800 border-2 border-zinc-300 dark:border-zinc-700 flex items-center justify-center">
                <div className="w-2 h-2 rounded-full bg-zinc-400 dark:bg-zinc-600"></div>
              </div>
            </div>
            <div className="flex-1 flex items-center">
              <p className="text-xs text-zinc-400 dark:text-zinc-600">The beginning</p>
            </div>
          </div>
        )}

        {!isLoading && allDays.length === 0 && (
          <div className="text-center py-12">
            <Calendar className="w-12 h-12 text-zinc-300 dark:text-zinc-700 mx-auto mb-3" />
            <p className="text-sm text-zinc-400 dark:text-zinc-600">No entries yet</p>
          </div>
        )}
      </div>
    </div>
  );
}
