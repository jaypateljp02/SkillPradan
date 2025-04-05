import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Info } from "lucide-react";
import { isFirebaseConfigured } from "@/lib/firebase";

export function FirebaseStatusBanner() {
  // If Firebase is configured, don't show anything
  if (isFirebaseConfigured) {
    return null;
  }
  
  return (
    <Alert className="mb-6 bg-amber-50 border-amber-200">
      <Info className="h-4 w-4 text-amber-600" />
      <AlertTitle className="text-amber-800">Firebase not configured</AlertTitle>
      <AlertDescription className="text-amber-700">
        Firebase authentication is not configured yet. Use the development login option.
      </AlertDescription>
    </Alert>
  );
}