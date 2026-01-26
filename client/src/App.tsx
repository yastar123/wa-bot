import { Switch, Route, useLocation } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import NotFound from "@/pages/not-found";
import Login from "@/pages/Login";
import Dashboard from "@/pages/Dashboard";
import { useStatus } from "@/hooks/use-wa";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";

function Router() {
  const { data: statusData, isLoading } = useStatus();
  const [location, setLocation] = useLocation();
  
  useEffect(() => {
    if (!isLoading && statusData) {
      if (statusData.status === 'connected' && location === '/login') {
        setLocation('/');
      } else if (statusData.status !== 'connected' && location !== '/login') {
        setLocation('/login');
      }
    }
  }, [statusData, isLoading, location, setLocation]);
  
  if (isLoading) {
    return (
      <div className="h-screen w-full flex items-center justify-center bg-background">
        <div className="flex flex-col items-center gap-4">
          <Loader2 className="w-12 h-12 text-primary animate-spin" />
          <p className="text-muted-foreground font-medium animate-pulse">Initializing WhatsApp...</p>
        </div>
      </div>
    );
  }
  
  return (
    <Switch>
      <Route path="/login" component={Login} />
      <Route path="/" component={Dashboard} />
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
