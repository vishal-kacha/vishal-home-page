import { useState, useEffect, useRef } from "react";
import { Plus, X } from "lucide-react";
import { doc, getDoc, setDoc, updateDoc } from "firebase/firestore";
import { db } from "../lib/firebase";

export default function Notes({ selectedDate }) {
  const [notes, setNotes] = useState([]);
  const [activeTab, setActiveTab] = useState(0);
  const [loading, setLoading] = useState(true);
  const debounceTimerRef = useRef(null);

  const dateStr = selectedDate.toISOString().split("T")[0];

  useEffect(() => {
    fetchNotes();
  }, [dateStr]);

  const fetchNotes = async () => {
    try {
      setLoading(true);
      const docRef = doc(db, "dailyDocs", dateStr);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const fetchedNotes = docSnap.data().notes || [];
        setNotes(
          fetchedNotes.length > 0
            ? fetchedNotes
            : [{ id: Date.now(), content: "" }]
        );
        setActiveTab(0);
      } else {
        await setDoc(docRef, {
          date: dateStr,
          notes: [{ id: Date.now(), content: "" }],
          todos: [],
        });
        setNotes([{ id: Date.now(), content: "" }]);
        setActiveTab(0);
      }
    } catch (error) {
      console.error("Error fetching notes:", error);
    } finally {
      setLoading(false);
    }
  };

  const saveNotesToDB = async (updatedNotes) => {
    try {
      const docRef = doc(db, "dailyDocs", dateStr);
      await updateDoc(docRef, { notes: updatedNotes });
    } catch (error) {
      console.error("Error saving notes:", error);
    }
  };

  const debouncedSave = (updatedNotes) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      saveNotesToDB(updatedNotes);
    }, 500);
  };

  const updateNoteContent = (content) => {
    const updatedNotes = [...notes];
    updatedNotes[activeTab] = { ...updatedNotes[activeTab], content };
    setNotes(updatedNotes);
    debouncedSave(updatedNotes);
  };

  const addNewNote = () => {
    const newNote = { id: Date.now(), content: "" };
    const updatedNotes = [...notes, newNote];
    setNotes(updatedNotes);
    setActiveTab(updatedNotes.length - 1);
    saveNotesToDB(updatedNotes);
  };

  const deleteNote = async (index, e) => {
    e.stopPropagation();

    if (notes.length === 1) {
      // If it's the last note, just clear its content
      const updatedNotes = [{ id: Date.now(), content: "" }];
      setNotes(updatedNotes);
      setActiveTab(0);
      await saveNotesToDB(updatedNotes);
      return;
    }

    const updatedNotes = notes.filter((_, i) => i !== index);
    setNotes(updatedNotes);

    if (activeTab >= updatedNotes.length) {
      setActiveTab(updatedNotes.length - 1);
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }

    await saveNotesToDB(updatedNotes);
  };

  if (loading) {
    return (
      <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 h-full">
        <div className="p-6 animate-pulse text-zinc-500">Loading notes...</div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 h-full flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center overflow-x-auto flex-1 scrollbar-thin">
          {notes.map((note, index) => (
            <div
              key={note.id}
              onClick={() => setActiveTab(index)}
              className={`
                group flex items-center gap-2 px-2 py-2.5 border-r border-zinc-200 dark:border-zinc-800 cursor-pointer
                transition-colors relative 
                ${
                  activeTab === index
                    ? "bg-white dark:bg-zinc-900 text-zinc-900 dark:text-zinc-100"
                    : "bg-zinc-50 dark:bg-zinc-800 text-zinc-600 dark:text-zinc-400 hover:bg-zinc-100 dark:hover:bg-zinc-700"
                }
              `}
            >
              {activeTab === index && (
                <div className="absolute top-0 left-0 right-0 h-0.5 bg-blue-500"></div>
              )}
              <span className="text-sm truncate flex-1">{index + 1}</span>
              <button
                onClick={(e) => deleteNote(index, e)}
                className="opacity-0 group-hover:opacity-100 hover:bg-zinc-200 dark:hover:bg-zinc-600 rounded p-0.5 transition-all"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          ))}
        </div>
        <button
          onClick={addNewNote}
          className="px-3 py-2.5 hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors border-l border-zinc-200 dark:border-zinc-800"
          title="New note"
        >
          <Plus className="w-4 h-4 text-zinc-600 dark:text-zinc-400" />
        </button>
      </div>

      {/* Content Area */}
      <div className="flex-1 overflow-hidden">
        <textarea
          value={notes[activeTab]?.content || ""}
          onChange={(e) => updateNoteContent(e.target.value)}
          placeholder="Start typing..."
          className="w-full h-full p-6 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
