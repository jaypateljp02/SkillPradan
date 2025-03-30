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
    <div className="flex min-h-screen">
      <div className="flex flex-col md:flex-row w-full">
        {/* Form Column - Now in first position for mobile */}
        <div className="w-full md:w-1/2 p-4 md:p-8 flex items-center justify-center order-2 md:order-1 bg-white">
          <div className="w-full max-w-md">
            <div className="text-center mb-8 mt-8 md:mt-0">
              <div className="flex flex-col items-center justify-center">
                <img src={logoImage} alt="Skill प्रदान Logo" className="h-20 w-20 mb-4" />
                <h1 className="text-2xl md:text-3xl font-bold text-gray-800">
                  <span className="text-primary">Skill</span> प्रदान
                </h1>
              </div>
              <p className="mt-2 text-neutral-600">Exchange skills, earn points, learn together</p>
            </div>
            
            <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
              <AuthForm />
            </div>
          </div>
        </div>

        {/* Illustration Column - Hidden on mobile */}
        <div className="hidden md:flex md:w-1/2 bg-gradient-to-br from-primary-800 to-primary-600 text-white p-8 flex-col justify-center order-1 md:order-2">
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
