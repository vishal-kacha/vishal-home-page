import { useState, useRef, useEffect } from "react";
import { Plus, X } from "lucide-react";
import type { Note, NotesProps } from "../types";

export default function Notes({ notes, onUpdateNotes }: NotesProps) {
  const [activeTab, setActiveTab] = useState(0);
  const [localNotes, setLocalNotes] = useState(notes);
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with parent when notes change externally (from Firebase listener)
  useEffect(() => {
    setLocalNotes(notes);
  }, [notes]);

  const debouncedSave = (updatedNotes: Note[]) => {
    if (debounceTimerRef.current) {
      clearTimeout(debounceTimerRef.current);
    }
    debounceTimerRef.current = setTimeout(() => {
      onUpdateNotes(updatedNotes);
    }, 500);
  };

  const updateNoteContent = (content: string) => {
    const updatedNotes = [...localNotes];
    updatedNotes[activeTab] = { ...updatedNotes[activeTab], content };
    setLocalNotes(updatedNotes); // Update local state immediately
    debouncedSave(updatedNotes); // Debounce Firebase save
  };

  const addNewNote = () => {
    const newNote = { id: Date.now(), content: "" };
    const updatedNotes = [...localNotes, newNote];
    setLocalNotes(updatedNotes);
    onUpdateNotes(updatedNotes);
    setActiveTab(updatedNotes.length - 1);
  };

  const deleteNote = (index: number, e: React.MouseEvent) => {
    e.stopPropagation();

    if (localNotes.length === 1) {
      // If it's the last note, just clear its content
      const updatedNotes = [{ id: Date.now(), content: "" }];
      setLocalNotes(updatedNotes);
      onUpdateNotes(updatedNotes);
      setActiveTab(0);
      return;
    }

    const updatedNotes = localNotes.filter((_, i) => i !== index);
    setLocalNotes(updatedNotes);
    onUpdateNotes(updatedNotes);

    if (activeTab >= updatedNotes.length) {
      setActiveTab(updatedNotes.length - 1);
    } else if (activeTab > index) {
      setActiveTab(activeTab - 1);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-900 rounded-lg border border-zinc-200 dark:border-zinc-800 h-full flex flex-col overflow-hidden">
      {/* Tab Bar */}
      <div className="flex items-center border-b border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
        <div className="flex items-center overflow-x-auto flex-1 scrollbar-thin">
          {localNotes.map((note, index) => (
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
          value={localNotes[activeTab]?.content || ""}
          onChange={(e) => updateNoteContent(e.target.value)}
          placeholder="Start typing..."
          className="w-full h-full p-6 bg-white dark:bg-zinc-900 text-zinc-800 dark:text-zinc-200 resize-none focus:outline-none font-mono text-sm leading-relaxed"
          spellCheck="false"
        />
      </div>
    </div>
  );
}
