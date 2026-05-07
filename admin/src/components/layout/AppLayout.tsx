import { Outlet, Navigate } from "react-router-dom";
import Sidebar from "./Sidebar";
import { isAuthenticated } from "@/lib/auth";

export default function AppLayout() {
  if (!isAuthenticated()) return <Navigate to="/login" replace />;

  return (
    <div className="flex min-h-screen bg-gray-100">
      <Sidebar />
      <main className="flex-1 overflow-auto">
        <Outlet />
      </main>
    </div>
  );
}
