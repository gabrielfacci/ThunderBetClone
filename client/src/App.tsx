import { Route, Switch } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { AppProvider, useAppContext } from "@/contexts/AppContext";
import { Layout } from "@/components/Layout";
import { Home } from "@/pages/Home";
import { Auth } from "@/pages/Auth";
import NotFound from "@/pages/not-found";

function Router() {
  const { user } = useAppContext();
  
  // If no user is authenticated, show auth page
  if (!user) {
    return <Auth />;
  }

  // If user is authenticated, show main app
  return (
    <Layout>
      <Switch>
        <Route path="/" component={Home} />
        <Route component={NotFound} />
      </Switch>
    </Layout>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <AppProvider>
        <TooltipProvider>
          <Toaster />
          <Router />
        </TooltipProvider>
      </AppProvider>
    </QueryClientProvider>
  );
}

export default App;
