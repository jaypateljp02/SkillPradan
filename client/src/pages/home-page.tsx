import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SocketProvider } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { ProfileHeader } from "@/components/profile-header";
import { SkillsSection } from "@/components/skills-section";
import { ActivityFeed } from "@/components/activity-feed";
import { BarterSection } from "@/components/barter-section";
import { PointsOverview } from "@/components/points-overview";
import { PointsCard } from "@/components/points-card";
import { PointsHistory } from "@/components/points-history";
import { LearningSession } from "@/components/learning-session";
import { LearningTools } from "@/components/learning-tools";
import { SessionHistory } from "@/components/session-history";
import { AchievementStats } from "@/components/achievement-stats";
import { BadgesSection } from "@/components/badges-section";
import { ChallengeCard } from "@/components/challenge-card";
import { ChallengesSection } from "@/components/challenges-section";
import { Leaderboard } from "@/components/leaderboard";
import { StudyGroupSection } from "@/components/study-group-section";
import { Challenge } from "@/types/challenge";
import { 
  GraduationCap, 
  ExternalLink,
  CreditCard,
  Award,
  LogOut,
  Star,
  User,
  Repeat,
  Trophy,
  Users
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";

export default function HomePage() {
  const { user } = useAuth();
  const [activeTab, setActiveTab] = useState("profile-tab");
  
  // Use Challenge type from import at the top
  
  // Get challenges for the user
  const { data: challenges = [] as Challenge[] } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });
  
  const navItems = [
    {
      label: 'Profile',
      icon: <User className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'profile-tab'
    },
    {
      label: 'Barter',
      icon: <Repeat className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'barter-tab'
    },
    {
      label: 'Points',
      icon: <CreditCard className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'points-tab'
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'learn-tab'
    },
    {
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'achievements-tab'
    },
    {
      label: 'Community',
      icon: <Users className="w-5 h-5 mr-3 text-neutral-400" />,
      target: 'study-group-tab'
    }
  ];

  return (
    <SocketProvider>
      <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
        {/* Main Content */}
        <main className="flex-grow pt-6">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row">

              {/* Sidebar Navigation */}
              <div className="hidden md:block md:w-64 md:flex-shrink-0">
                <div className="sticky top-6 py-6 flex flex-col h-[calc(100vh-80px)]">
                  <nav className="flex-1 space-y-2">
                    {navItems.map((item) => (
                      <button
                        key={item.label}
                        onClick={() => setActiveTab(item.target)}
                        className={`w-full flex items-center px-4 py-2 text-sm font-medium rounded-md transition-colors ${
                          activeTab === item.target 
                            ? 'bg-white text-primary shadow-sm' 
                            : 'text-neutral-500 hover:bg-white hover:text-primary'
                        }`}
                      >
                        {item.icon}
                        {item.label}
                      </button>
                    ))}
                  </nav>
                  
                  <div className="mt-auto pt-6">
                    <div className="px-4">
                      <ChallengeCard 
                        challenge={{
                          id: 999, // Temporary ID
                          title: "Weekly Challenge",
                          description: "Complete 3 skill exchanges this week",
                          targetCount: 3,
                          type: "exchange",
                          pointsRewarded: 200,
                          durationDays: 7,
                          userProgress: {
                            currentCount: 2,
                            startedAt: new Date().toISOString(),
                            completedAt: null
                          }
                        }}
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Tab Content */}
              <div className="md:ml-8 md:flex-1 pt-0 pb-20 md:pb-6">
                {/* Profile Tab */}
                <div 
                  id="profile-tab" 
                  className={`bg-white shadow rounded-lg ${activeTab !== 'profile-tab' ? 'hidden' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Your Profile</h3>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">Manage your skills and preferences</p>
                  </div>

                  <div className="p-6">
                    {/* Profile Header */}
                    <ProfileHeader />

                    {/* Skills Section */}
                    <SkillsSection />

                    {/* Recent Activity */}
                    <ActivityFeed />
                  </div>
                </div>

                {/* Barter Tab */}
                <div 
                  id="barter-tab"
                  className={`bg-white shadow rounded-lg ${activeTab !== 'barter-tab' ? 'hidden' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Skill Exchange</h3>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">Find others to swap skills with</p>
                  </div>

                  <div className="p-6">
                    <BarterSection />
                  </div>
                </div>

                {/* Points Tab */}
                <div 
                  id="points-tab"
                  className={`bg-white shadow rounded-lg ${activeTab !== 'points-tab' ? 'hidden' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Points & Rewards</h3>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">Earn and spend points on the platform</p>
                  </div>

                  <div className="p-6">
                    {/* Points Overview */}
                    <PointsOverview />

                    {/* Earning Options */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-neutral-900">Ways to Earn Points</h4>
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-4">
                        <PointsCard
                          icon={GraduationCap}
                          title="Complete Daily Quiz"
                          description="Test your knowledge and earn points"
                          points={20}
                          color="accent"
                          actionHandler={async () => {
                            // Simulated quiz completion
                            return Promise.resolve();
                          }}
                        />
                        
                        <PointsCard
                          icon={ExternalLink}
                          title="Complete Exchange"
                          description="Earn points for each completed skill exchange"
                          points={100}
                          color="primary"
                        />
                        
                        <PointsCard
                          icon={Award}
                          title="Verify a Skill"
                          description="Take a test to verify your expertise level"
                          points={50}
                          color="secondary"
                        />
                      </div>
                    </div>

                    {/* Spending Options */}
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-neutral-900">Spend Your Points</h4>
                      
                      <div className="mt-4 grid grid-cols-1 gap-4 overflow-hidden">
                        <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap md:flex-nowrap">
                            <div className="flex-shrink-0 mb-3 md:mb-0">
                              <div className="h-14 w-14 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
                                <GraduationCap className="text-2xl text-blue-500" />
                              </div>
                            </div>
                            <div className="ml-0 md:ml-4 flex-1 min-w-0">
                              <h5 className="text-md font-medium text-neutral-900 truncate">Book Expert Session</h5>
                              <p className="mt-1 text-sm text-neutral-500 line-clamp-2">30-minute 1:1 session with a verified expert</p>
                              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className="text-xs text-neutral-500 truncate">Various subjects available</span>
                                <Button size="sm" className="bg-blue-500 hover:bg-blue-600 whitespace-nowrap">500 points</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex flex-wrap md:flex-nowrap">
                            <div className="flex-shrink-0 mb-3 md:mb-0">
                              <div className="h-14 w-14 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center">
                                <Star className="text-2xl text-emerald-500" />
                              </div>
                            </div>
                            <div className="ml-0 md:ml-4 flex-1 min-w-0">
                              <h5 className="text-md font-medium text-neutral-900 truncate">Access Premium Courses</h5>
                              <p className="mt-1 text-sm text-neutral-500 line-clamp-2">Unlock curated advanced learning materials</p>
                              <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                                <span className="text-xs text-neutral-500 truncate">20+ courses available</span>
                                <Button 
                                  size="sm"
                                  className="bg-emerald-500 hover:bg-emerald-600 whitespace-nowrap"
                                >
                                  300 points
                                </Button>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Points History */}
                    <PointsHistory />
                  </div>
                </div>

                {/* Learn Tab */}
                <div 
                  id="learn-tab"
                  className={`bg-white shadow rounded-lg ${activeTab !== 'learn-tab' ? 'hidden' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Learning Center</h3>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">Connect, learn, and collaborate with others</p>
                  </div>

                  <div className="p-6">
                    {/* Upcoming Sessions */}
                    <LearningSession />

                    {/* Learning Tools */}
                    <LearningTools />

                    {/* Session History */}
                    <SessionHistory />
                  </div>
                </div>

                {/* Achievements Tab */}
                <div 
                  id="achievements-tab"
                  className={`bg-white shadow rounded-lg ${activeTab !== 'achievements-tab' ? 'hidden' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Achievements & Leaderboard</h3>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">Track your progress and compete with others</p>
                  </div>

                  <div className="p-6">
                    {/* Achievement Stats */}
                    <AchievementStats />

                    {/* Badges */}
                    <BadgesSection />

                    {/* Current Challenges */}
                    <ChallengesSection />

                    {/* Leaderboard */}
                    <Leaderboard />
                  </div>
                </div>

                {/* Community Tab */}
                <div 
                  id="study-group-tab"
                  className={`bg-white shadow rounded-lg ${activeTab !== 'study-group-tab' ? 'hidden' : ''}`}
                >
                  <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                    <h3 className="text-lg font-medium leading-6 text-neutral-900">Study Groups</h3>
                    <p className="mt-1 max-w-2xl text-sm text-neutral-500">Create and join study groups with peers</p>
                  </div>

                  <div className="p-6">
                    <StudyGroupSection />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Navigation - Fixed at Bottom */}
        <div className="md:hidden fixed bottom-0 inset-x-0 bg-white shadow-lg">
          <div className="flex justify-around">
            {navItems.map((item) => (
              <button
                key={item.label}
                onClick={() => setActiveTab(item.target)}
                className={`flex flex-col items-center p-3 ${
                  activeTab === item.target 
                    ? 'text-primary' 
                    : 'text-neutral-500 hover:text-primary'
                }`}
              >
                {React.cloneElement(item.icon as React.ReactElement, { className: 'text-lg' })}
                <span className="text-xs mt-1">{item.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>
    </SocketProvider>
  );
}
