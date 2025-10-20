import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/index.tsx";
import Theme from "./components/theme-toggle.tsx";
import Timeline from "./pages/timeline.tsx";
import TimelineDetail from "./pages/timeline.$id.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import Login from "./pages/login.tsx";
import ProtectedRoute from "./components/AuthCheck.tsx";

/**
 * To dos:
 *  - Timeline
 *  - Kanban
 */
const queryClient = new QueryClient();

createRoot(document.getElementById("root")!).render(
  <div className="container mx-auto">
    <QueryClientProvider client={queryClient}>
      <Theme />
      <BrowserRouter>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route
            path="/"
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline"
            element={
              <ProtectedRoute>
                <Timeline />
              </ProtectedRoute>
            }
          />
          <Route
            path="/timeline/:id"
            element={
              <ProtectedRoute>
                <TimelineDetail />
              </ProtectedRoute>
            }
          />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </div>,
);
