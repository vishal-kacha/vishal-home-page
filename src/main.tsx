import { createRoot } from "react-dom/client";
import "./index.css";
import { BrowserRouter, Route, Routes } from "react-router";
import Home from "./pages/index.tsx";
import Theme from "./components/theme-toggle.tsx";
import Timeline from "./pages/timeline.tsx";
import TimelineDetail from "./pages/timeline.$id.tsx";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

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
          <Route path="/" element={<Home />} />
          <Route path="/timeline" element={<Timeline />} />
          <Route path="/timeline/:id" element={<TimelineDetail />} />
        </Routes>
      </BrowserRouter>
    </QueryClientProvider>
  </div>,
);
