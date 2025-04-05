import { useAuth } from "@/hooks/use-auth";
import { FirebaseAuthForm } from "@/components/firebase-auth-form";
import { Redirect } from "wouter";
import logoImage from "../assets/logo.png";

export default function AuthPage() {
  const { user } = useAuth();
  
  // If user is logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex items-center justify-center min-h-screen bg-neutral-50">
      <div className="w-full max-w-md p-6 bg-white rounded-lg shadow-md">
        <div className="text-center mb-6">
          <div className="flex flex-col items-center justify-center">
            <img src={logoImage} alt="Skill Pradan Logo" className="h-16 w-16 mb-2" />
            <h1 className="text-2xl font-bold">
              Skill Pradan
            </h1>
          </div>
          <p className="mt-2 text-neutral-600">Connect.Collaborate.Create</p>
        </div>
        
        <div className="mt-4">
          <FirebaseAuthForm />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Secure authentication powered by Firebase</p>
        </div>
      </div>
    </div>
  );
}
