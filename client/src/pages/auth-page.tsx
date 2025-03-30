import { useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { AuthForm } from "@/components/auth-form";
import { Redirect } from "wouter";
import { GraduationCap, Repeat, Award } from "lucide-react";
import logoImage from "../assets/logo.png";

export default function AuthPage() {
  const { user, isLoading } = useAuth();
  
  // If user is logged in, redirect to home page
  if (user) {
    return <Redirect to="/" />;
  }
  
  return (
    <div className="flex min-h-screen bg-neutral-50">
      <div className="grid grid-cols-1 md:grid-cols-2 w-full">
        {/* Left column (Form) */}
        <div className="flex items-center justify-center p-4 md:p-8 h-screen bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-8">
              <div className="flex flex-col items-center justify-center">
                <img src={logoImage} alt="Skill Pradan Logo" className="h-16 w-16 mb-2" />
                <h1 className="text-2xl md:text-3xl font-bold">
                  Skill Pradan
                </h1>
              </div>
              <p className="mt-2 text-neutral-600">Exchange skills, earn points, learn together</p>
            </div>
            
            <div className="bg-white border border-gray-100 p-6 rounded-lg shadow-sm">
              <AuthForm />
            </div>
          </div>
        </div>

        {/* Right column (Illustration) - Hidden on mobile */}
        <div className="hidden md:flex md:flex-col bg-gradient-to-br from-primary-800 to-primary-600 text-white p-8 justify-center h-screen">
          <div className="max-w-md mx-auto">
            <h2 className="text-3xl font-bold mb-6">Welcome to the Peer-to-Peer Learning Platform</h2>
            <p className="mb-8 text-white/80">
              Connect with other students, exchange skills, and enhance your learning journey through collaboration.
            </p>
            
            <div className="space-y-6">
              <div className="flex items-start">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Repeat className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl">Skill Bartering</h3>
                  <p className="text-white/70">Teach what you know, learn what you want. No monetary cost.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-3 rounded-lg">
                  <GraduationCap className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl">Interactive Learning</h3>
                  <p className="text-white/70">Video calls, shared whiteboards and collaborative sessions.</p>
                </div>
              </div>
              
              <div className="flex items-start">
                <div className="bg-white/10 p-3 rounded-lg">
                  <Award className="h-6 w-6" />
                </div>
                <div className="ml-4">
                  <h3 className="font-semibold text-xl">Gamified Experience</h3>
                  <p className="text-white/70">Earn points, collect badges, climb the leaderboard.</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
