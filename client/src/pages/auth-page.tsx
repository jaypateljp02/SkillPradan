import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthForm } from "@/components/auth-form";
import { FirebaseAuthForm } from "@/components/firebase-auth-form";
import { Redirect } from "wouter";
import { GraduationCap, Repeat, Award } from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import logoImage from "../assets/logo.png";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  const [authProvider, setAuthProvider] = useState<"firebase" | "token">("firebase");
  
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
        
        <Tabs 
          defaultValue="firebase" 
          onValueChange={(value) => setAuthProvider(value as "firebase" | "token")}
          className="mb-4"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="firebase">Firebase Auth</TabsTrigger>
            <TabsTrigger value="token">Token Auth</TabsTrigger>
          </TabsList>
          
          <TabsContent value="firebase">
            <div className="mt-4">
              <FirebaseAuthForm />
            </div>
          </TabsContent>
          
          <TabsContent value="token">
            <div className="mt-4">
              <AuthForm />
            </div>
          </TabsContent>
        </Tabs>
        
        <div className="mt-4 text-center text-sm text-gray-500">
          {authProvider === "firebase" ? (
            <p>Using Firebase Authentication (recommended)</p>
          ) : (
            <p>Using legacy token-based authentication</p>
          )}
        </div>
      </div>
    </div>
  );
}
