import React, { useState, useEffect } from "react";
import { ProductivityHub } from "./ServiceworkerRegistery";
import {
  collection,
  addDoc,
  onSnapshot,
  query,
  orderBy,
  deleteDoc,
  doc,
  updateDoc,
  setDoc,
} from "firebase/firestore";
import { db } from "./lib/firebase";
import {
  Plus,
  Trash2,
  Check,
  Calendar,
  StickyNote,
  CheckSquare,
} from "lucide-react";

export default function App() {
  const [todos, setTodos] = useState([]);
  const [events, setEvents] = useState([]);
  const [notes, setNotes] = useState("");
  const [activeTab, setActiveTab] = useState("todos");
  const [newTodo, setNewTodo] = useState("");
  const [newEvent, setNewEvent] = useState({
    title: "",
    date: "",
    time: "",
    notify: false,
  });

  // Real-time Firestore sync for todos
  useEffect(() => {
    const q = query(collection(db, "todos"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const todosData: any = [];
      snapshot.forEach((doc) => {
        todosData.push({ id: doc.id, ...doc.data() });
      });
      setTodos(todosData);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for events
  useEffect(() => {
    const q = query(collection(db, "events"), orderBy("createdAt", "desc"));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const eventsData: any = [];
      snapshot.forEach((doc) => {
        eventsData.push({ id: doc.id, ...doc.data() });
      });
      setEvents(eventsData);
    });

    return () => unsubscribe();
  }, []);

  // Real-time Firestore sync for notes
  useEffect(() => {
    const docRef = doc(db, "settings", "notes");
    const unsubscribe = onSnapshot(docRef, (docSnap) => {
      if (docSnap.exists()) {
        setNotes(docSnap.data().content || "");
      }
    });

    return () => unsubscribe();
  }, []);

  // Add todo to Firestore
  const addTodo = async () => {
    if (!newTodo.trim()) return;
    await addDoc(collection(db, "todos"), {
      text: newTodo,
      completed: false,
      createdAt: new Date(),
    });
    setNewTodo("");
  };

  // Toggle todo completion
  const toggleTodo = async (id: any, completed: any) => {
    await updateDoc(doc(db, "todos", id), {
      completed: !completed,
    });
  };

  // Delete todo from Firestore
  const deleteTodo = async (id: any) => {
    await deleteDoc(doc(db, "todos", id));
  };

  // Add event to Firestore
  const addEvent = async () => {
    if (!newEvent.title || !newEvent.date || !newEvent.time) return;
    await addDoc(collection(db, "events"), {
      ...newEvent,
      createdAt: new Date(),
      notified: false,
    });
    setNewEvent({ title: "", date: "", time: "", notify: false });
  };

  // Delete event from Firestore
  const deleteEvent = async (id: any) => {
    await deleteDoc(doc(db, "events", id));
  };

  // Update notes in Firestore
  const updateNotes = async (content: any) => {
    setNotes(content);
    await setDoc(
      doc(db, "settings", "notes"),
      {
        content,
        updatedAt: new Date(),
      },
      { merge: true }
    );
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      {/* PWA & Notification Component */}
      <ProductivityHub />

      {/* Header */}
      <div className="bg-white shadow-sm border-b sticky top-0 z-10">
        <div className="max-w-7xl mx-auto px-4 py-4">
          <h1 className="text-3xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent text-center">
            Testing PWA - Productivity Hub
          </h1>

          {/* Tabs */}
          <div className="flex gap-2 mt-4 justify-center">
            {[
              { id: "todos", icon: CheckSquare, label: "Todos" },
              { id: "events", icon: Calendar, label: "Events" },
              { id: "notes", icon: StickyNote, label: "Notes" },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-lg font-medium transition-all ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-purple-600 to-pink-600 text-white shadow-md"
                    : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                }`}
              >
                <tab.icon className="w-4 h-4" />
                {tab.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        {/* Todos Tab */}
        {activeTab === "todos" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Todos</h2>

            {/* Add Todo */}
            <div className="flex gap-2 mb-6">
              <input
                type="text"
                value={newTodo}
                onChange={(e) => setNewTodo(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && addTodo()}
                placeholder="Add a new todo..."
                className="flex-1 px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <button
                onClick={addTodo}
                className="px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                <Plus className="w-5 h-5" />
              </button>
            </div>

            {/* Todo List */}
            <div className="space-y-2">
              {todos.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No todos yet. Add one above!
                </p>
              ) : (
                todos.map((todo: any) => (
                  <div
                    key={todo.id}
                    className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                  >
                    <button
                      onClick={() => toggleTodo(todo.id, todo.completed)}
                      className={`w-6 h-6 rounded-md border-2 flex items-center justify-center transition-colors ${
                        todo.completed
                          ? "bg-gradient-to-r from-purple-600 to-pink-600 border-transparent"
                          : "border-gray-300"
                      }`}
                    >
                      {todo.completed && (
                        <Check className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <span
                      className={`flex-1 ${
                        todo.completed
                          ? "line-through text-gray-400"
                          : "text-gray-800"
                      }`}
                    >
                      {todo.text}
                    </span>
                    <button
                      onClick={() => deleteTodo(todo.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Events Tab */}
        {activeTab === "events" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Calendar Events</h2>

            {/* Add Event */}
            <div className="space-y-3 mb-6">
              <input
                type="text"
                value={newEvent.title}
                onChange={(e) =>
                  setNewEvent({ ...newEvent, title: e.target.value })
                }
                placeholder="Event title..."
                className="w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
              />
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="date"
                  value={newEvent.date}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, date: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
                <input
                  type="time"
                  value={newEvent.time}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, time: e.target.value })
                  }
                  className="px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="notify"
                  checked={newEvent.notify}
                  onChange={(e) =>
                    setNewEvent({ ...newEvent, notify: e.target.checked })
                  }
                  className="w-4 h-4"
                />
                <label htmlFor="notify" className="text-sm text-gray-600">
                  Send notification reminder
                </label>
              </div>
              <button
                onClick={addEvent}
                className="w-full px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 text-white rounded-lg hover:opacity-90 transition-opacity"
              >
                Add Event
              </button>
            </div>

            {/* Event List */}
            <div className="space-y-3">
              {events.length === 0 ? (
                <p className="text-gray-400 text-center py-8">
                  No events scheduled yet!
                </p>
              ) : (
                events.map((event: any) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg"
                  >
                    <div className="flex-1">
                      <h4 className="font-medium text-gray-800">
                        {event.title}
                      </h4>
                      <p className="text-sm text-gray-600">
                        {new Date(event.date).toLocaleDateString()} at{" "}
                        {event.time}
                      </p>
                      {event.notify && (
                        <span className="text-xs text-purple-600">
                          🔔 Reminder enabled
                        </span>
                      )}
                    </div>
                    <button
                      onClick={() => deleteEvent(event.id)}
                      className="text-red-500 hover:text-red-700"
                    >
                      <Trash2 className="w-5 h-5" />
                    </button>
                  </div>
                ))
              )}
            </div>
          </div>
        )}

        {/* Notes Tab */}
        {activeTab === "notes" && (
          <div className="bg-white rounded-xl shadow-lg p-6">
            <h2 className="text-2xl font-bold mb-4">Notes</h2>
            <textarea
              value={notes}
              onChange={(e) => updateNotes(e.target.value)}
              placeholder="Write your notes here..."
              className="w-full h-96 px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 resize-none font-mono text-sm"
            />
            <p className="text-xs text-gray-500 mt-2">
              Auto-saved • {notes.length} characters
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
