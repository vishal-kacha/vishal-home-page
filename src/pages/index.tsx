import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router";
import { useSwipeable } from "react-swipeable";
import { motion, AnimatePresence } from "motion/react";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";

import Greeting from "../components/Greeting";
import Quote from "../components/Quote";
import DatePicker from "../components/DatePicker";
import Notes from "../components/Notes";
import Todos from "../components/Todos";
import type { DailyData, Note, Todo } from "../types";

// Firebase helpers
async function updateNotes(dateStr: string, notes: Note[]): Promise<void> {
  const docRef = doc(db, "dailyDocs", dateStr);
  await updateDoc(docRef, { notes });
}

async function updateTodos(dateStr: string, todos: Todo[]): Promise<void> {
  const docRef = doc(db, "dailyDocs", dateStr);
  await updateDoc(docRef, { todos });
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState(0); // 0=Calendar, 1=Notes, 2=Todos
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  const tabs = ["Calendar", "Notes", "Todos"];

  // Swipe handlers
  const handlers = useSwipeable({
    onSwipedLeft: () => activeTab < 2 && setActiveTab(activeTab + 1),
    onSwipedRight: () => activeTab > 0 && setActiveTab(activeTab - 1),
    trackMouse: false,
    preventScrollOnSwipe: true,
  });

  // Realtime listener
  useEffect(() => {
    setIsLoading(true);
    const docRef = doc(db, "dailyDocs", dateStr);

    const unsub = onSnapshot(
      docRef,
      async (snap) => {
        if (snap.exists()) {
          const data = snap.data();
          setDailyData({
            id: snap.id,
            date: dateStr,
            notes: data.notes?.length ? data.notes : [{ id: Date.now(), content: "" }],
            todos: data.todos || [],
          });
        } else {
          const initial: DailyData = {
            id: snap.id,
            date: dateStr,
            notes: [{ id: Date.now(), content: "" }],
            todos: [],
          };
          await setDoc(docRef, initial);
          setDailyData(initial);
        }
        setIsLoading(false);
      },
      (err) => {
        console.error("Error listening:", err);
        setIsLoading(false);
      },
    );

    return () => unsub();
  }, [dateStr]);

  // Mutations
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: Note[]) => {
      await updateNotes(dateStr, notes);
      return notes;
    },
    onMutate: (notes) => dailyData && setDailyData({ ...dailyData, notes }),
  });

  const updateTodosMutation = useMutation({
    mutationFn: async (todos: Todo[]) => {
      await updateTodos(dateStr, todos);
      return todos;
    },
    onMutate: (todos) => dailyData && setDailyData({ ...dailyData, todos }),
  });

  // Loading placeholder
  if (isLoading || !dailyData) {
    return (
      <div className="relative mt-12">
        <Greeting />
        <Quote />
        <div className="mt-10 grid md:grid-cols-3 gap-6">
          <DatePicker selectedDate={selectedDate} setSelectedDate={() => {}} />
          <Notes notes={[{ id: Date.now(), content: "" }]} onUpdateNotes={() => {}} />
          <Todos todos={[]} onUpdateTodos={() => {}} />
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-12 px-2 md:px-6">
      <Greeting />
      <Quote />

      {/* View Timeline Link */}
      <div className="flex justify-end mb-4 md:mb-6">
        <Link
          to={`/timeline/${dateStr}`}
          className="flex items-center gap-2 text-sm font-medium text-blue-600 dark:text-blue-400 hover:underline"
        >
          View Timeline
          <ArrowRight className="w-4 h-4" />
        </Link>
      </div>

      {/* Mobile Tabs */}
      <div className="md:hidden flex gap-2 mb-4">
        {tabs.map((tab, i) => (
          <button
            key={tab}
            onClick={() => setActiveTab(i)}
            className={`flex-1 py-2 text-sm font-medium transition-colors ${
              activeTab === i
                ? "text-blue-600 dark:text-blue-400 border-b-2 border-blue-500 dark:border-blue-400"
                : "text-zinc-500 dark:text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200"
            }`}
          >
            {tab}
          </button>
        ))}
      </div>

      {/* Mobile Swipeable Cards */}
      <div {...handlers} className="md:hidden relative overflow-hidden">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, x: activeTab === 0 ? -40 : 40 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
          >
            {activeTab === 0 && (
              <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
            )}
            {activeTab === 1 && (
              <Notes notes={dailyData.notes} onUpdateNotes={updateNotesMutation.mutate} />
            )}
            {activeTab === 2 && (
              <Todos todos={dailyData.todos} onUpdateTodos={updateTodosMutation.mutate} />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop Grid Layout */}
      <div className="hidden md:grid md:grid-cols-3 gap-6 mt-8">
        <div>
          <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
        </div>
        <div>
          <Notes notes={dailyData.notes} onUpdateNotes={updateNotesMutation.mutate} />
        </div>
        <div>
          <Todos todos={dailyData.todos} onUpdateTodos={updateTodosMutation.mutate} />
        </div>
      </div>
    </div>
  );
}
