import { Toaster } from "@/components/ui/toaster";
import { Toaster as Sonner } from "@/components/ui/sonner";
import { TooltipProvider } from "@/components/ui/tooltip";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { Layout } from "./components/Layout";
import Dashboard from "./pages/Dashboard";
import Leads from "./pages/Leads";
import Projects from "./pages/Projects";
import Payments from "./pages/Payments";
import Employees from "./pages/Employees";
import WhatsApp from "./pages/WhatsApp";
import Login from "./pages/Login";
import NotFound from "./pages/NotFound";

// Import your user context/provider and hook:
import { UserProvider, useUser } from "./lib/UserContext";

const queryClient = new QueryClient();

// Private route wrapper
function PrivateRoute({ children }: { children: JSX.Element }) {
  const { user } = useUser();
  return user ? children : <Navigate to="/login" replace />;
}

const App = () => (
  <QueryClientProvider client={queryClient}>
    <UserProvider>
      <TooltipProvider>
        <Toaster />
        <Sonner />
        <BrowserRouter>
          <Routes>
            {/* Login route */}
            <Route path="/login" element={<Login />} />
            {/* Main dashboard */}
            <Route path="/" element={<Layout><Dashboard /></Layout>} />
            {/* Protected routes */}
            <Route path="/leads" element={
              <PrivateRoute>
                <Layout><Leads /></Layout>
              </PrivateRoute>
            } />
            <Route path="/projects" element={
              <PrivateRoute>
                <Layout><Projects /></Layout>
              </PrivateRoute>
            } />
            <Route path="/payments" element={
              <PrivateRoute>
                <Layout><Payments /></Layout>
              </PrivateRoute>
            } />
            <Route path="/employees" element={
              <PrivateRoute>
                <Layout><Employees /></Layout>
              </PrivateRoute>
            } />
            <Route path="/whatsapp" element={
              <PrivateRoute>
                <Layout><WhatsApp /></Layout>
              </PrivateRoute>
            } />
            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </BrowserRouter>
      </TooltipProvider>
    </UserProvider>
  </QueryClientProvider>
);

export default App;
