import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { CheckCircle, AlertTriangle } from "lucide-react";
import { auth } from "@/lib/firebase";
import { useEffect, useState } from "react";

export function FirebaseStatusBanner() {
  const [connectionStatus, setConnectionStatus] = useState<"connected" | "error" | "checking">("checking");
  
  useEffect(() => {
    // Check if Firebase auth is initialized
    if (auth) {
      setConnectionStatus("connected");
    } else {
      setConnectionStatus("error");
    }
  }, []);

  if (connectionStatus === "checking") {
    return null;
  }
  
  if (connectionStatus === "connected") {
    return null; // Don't show anything when successfully connected
  }
  
  // Show error banner when Firebase is not properly configured
  return (
    <Alert variant="destructive" className="mb-4">
      <AlertTriangle className="h-4 w-4" />
      <AlertTitle>Authentication Error</AlertTitle>
      <AlertDescription>
        Firebase connection error. Please check that Firebase is properly configured with the necessary environment variables.
      </AlertDescription>
    </Alert>
  );
}