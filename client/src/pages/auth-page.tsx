import { useAuth } from "@/hooks/use-auth";
import { AuthForm } from "@/components/auth-form";
import { Redirect } from "wouter";
import logoImage from "../assets/logo.png";
import { useEffect, useState } from "react";

export default function AuthPage() {
  const { user } = useAuth();
  const [redirecting, setRedirecting] = useState(false);
  
  // Detect successful login and redirect after a short delay
  useEffect(() => {
    if (user) {
      // Show the user is logged in, but give them time to see the success message
      console.log("User is authenticated, preparing for redirect");
      
      const timer = setTimeout(() => {
        console.log("Redirecting to home page");
        setRedirecting(true);
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [user]);
  
  // If user is logged in and we're ready to redirect, go to home page
  if (redirecting) {
    return <Redirect to="/" />;
  }
  
  // If user is already logged in (from a previous session), redirect immediately
  if (user && !redirecting) {
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
          <AuthForm />
        </div>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          <p>Demo Account: testuser / password123</p>
        </div>
      </div>
    </div>
  );
}
