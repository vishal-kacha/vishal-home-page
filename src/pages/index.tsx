import { useState, useEffect } from "react";
import { useMutation } from "@tanstack/react-query";
import { doc, onSnapshot, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";
import { Link } from "react-router";
import Greeting from "../components/Greeting";
import Quote from "../components/Quote";
import DatePicker from "../components/DatePicker";
import Notes from "../components/Notes";
import Todos from "../components/Todos";
import { ArrowRight } from "lucide-react";
import { format } from "date-fns";
import type { DailyData, Note, Todo } from "../types";

// Update notes in Firebase
async function updateNotes(dateStr: string, notes: Note[]): Promise<void> {
  const docRef = doc(db, "dailyDocs", dateStr);
  await updateDoc(docRef, { notes });
}

// Update todos in Firebase
async function updateTodos(dateStr: string, todos: Todo[]): Promise<void> {
  const docRef = doc(db, "dailyDocs", dateStr);
  await updateDoc(docRef, { todos });
}

export default function Home() {
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [dailyData, setDailyData] = useState<DailyData | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const dateStr = format(selectedDate, "yyyy-MM-dd");

  // Real-time listener for daily data
  useEffect(() => {
    setIsLoading(true);
    const docRef = doc(db, "dailyDocs", dateStr);

    const unsubscribe = onSnapshot(
      docRef,
      async (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setDailyData({
            date: dateStr,
            notes: data.notes?.length > 0 ? data.notes : [{ id: Date.now(), content: "" }],
            todos: data.todos || [],
          });
        } else {
          // Create new document if it doesn't exist
          const initialData: DailyData = {
            date: dateStr,
            notes: [{ id: Date.now(), content: "" }],
            todos: [],
          };
          await setDoc(docRef, initialData);
          setDailyData(initialData);
        }
        setIsLoading(false);
      },
      (error) => {
        console.error("Error listening to document:", error);
        setIsLoading(false);
      },
    );

    // Cleanup listener on unmount or date change
    return () => unsubscribe();
  }, [dateStr]);

  // Notes mutations
  const updateNotesMutation = useMutation({
    mutationFn: async (notes: Note[]) => {
      await updateNotes(dateStr, notes);
      return notes;
    },
    onMutate: async (notes: Note[]) => {
      // Optimistically update local state
      if (dailyData) {
        setDailyData({ ...dailyData, notes });
      }
    },
    onError: (error) => {
      console.error("Error updating notes:", error);
      // onSnapshot will revert to server state automatically
    },
  });

  // Todos mutations
  const updateTodosMutation = useMutation({
    mutationFn: async (todos: Todo[]) => {
      await updateTodos(dateStr, todos);
      return todos;
    },
    onMutate: async (todos: Todo[]) => {
      // Optimistically update local state
      if (dailyData) {
        setDailyData({ ...dailyData, todos });
      }
    },
    onError: (error) => {
      console.error("Error updating todos:", error);
      // onSnapshot will revert to server state automatically
    },
  });

  if (isLoading || !dailyData) {
    return (
      <div className="relative mt-12">
        <Greeting />
        <Quote />
        <div className="relative">
          <div className="flex justify-end mb-6 absolute -top-12 right-0">
            <Link to={`/timeline/${dateStr}`} className="flex items-center gap-2 cursor-pointer">
              View Timeline
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
          <div className="grid md:grid-cols-3 gap-6 mt-18">
            <DatePicker selectedDate={selectedDate} setSelectedDate={() => {}} />
            <Notes notes={[{ id: Date.now(), content: "" }]} onUpdateNotes={() => {}} />
            <Todos todos={[]} onUpdateTodos={() => {}} />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="relative mt-12">
      <Greeting />
      <Quote />
      <div className="relative">
        <div className="flex justify-end mb-6 absolute -top-12 right-0">
          <Link to={`/timeline/${dateStr}`} className="flex items-center gap-2 cursor-pointer">
            View Timeline
            <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
        <div className="grid md:grid-cols-3 gap-6 mt-18">
          <DatePicker selectedDate={selectedDate} setSelectedDate={setSelectedDate} />
          <Notes notes={dailyData.notes} onUpdateNotes={updateNotesMutation.mutate} />
          <Todos todos={dailyData.todos} onUpdateTodos={updateTodosMutation.mutate} />
        </div>
      </div>
    </div>
  );
}
