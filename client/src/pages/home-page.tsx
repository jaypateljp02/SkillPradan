import { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
import { SocketProvider } from "@/hooks/use-socket";
import { Button } from "@/components/ui/button";
import { UserAvatar } from "@/components/ui/user-avatar";
import { Sidebar } from "@/components/ui/sidebar";
import { MobileNav } from "@/components/ui/mobile-nav";
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
import { Leaderboard } from "@/components/leaderboard";
import { 
  GraduationCap, 
  ExternalLink,
  CreditCard,
  Award,
  LogOut,
  Star 
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import logoImage from "../assets/logo.png";

export default function HomePage() {
  const { user, logoutMutation } = useAuth();
  const [activeTab, setActiveTab] = useState("profile-tab");
  
  // Get challenges for the user
  const { data: challenges = [] } = useQuery({
    queryKey: ["/api/challenges"],
  });
  
  // Handle logout
  const handleLogout = () => {
    logoutMutation.mutate();
  };

  return (
    <SocketProvider>
      <div className="min-h-screen flex flex-col bg-neutral-100 font-sans">
        {/* Header */}
        <header className="bg-white shadow-sm">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between h-16">
              <div className="flex">
                <div className="flex-shrink-0 flex items-center">
                  <div className="flex items-center">
                    <img src={logoImage} alt="Skill प्रदान Logo" className="h-8 w-8" />
                    <span className="ml-2 text-xl font-bold text-gray-800">
                      Skill Pradan
                    </span>
                  </div>
                </div>
              </div>
              <div className="hidden md:ml-6 md:flex md:items-center md:space-x-4">
                <div className="flex space-x-2 items-center bg-neutral-100 rounded-full px-3 py-1">
                  <CreditCard className="h-5 w-5 text-amber-500" />
                  <span className="text-sm font-semibold text-neutral-700">
                    {user?.points.toLocaleString()} Points
                  </span>
                </div>

                <div className="relative">
                  <Button 
                    variant="ghost" 
                    className="flex items-center max-w-xs rounded-full text-sm focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary"
                    onClick={handleLogout}
                  >
                    <UserAvatar 
                      src={user?.avatar} 
                      name={user?.name || ''} 
                      size="sm"
                    />
                    <span className="ml-2 text-sm font-medium text-neutral-700">
                      {user?.name}
                    </span>
                    <LogOut className="ml-1 h-5 w-5 text-neutral-400" />
                  </Button>
                </div>
              </div>
              
              <div className="flex items-center md:hidden">
                <Button variant="ghost">
                  <span className="sr-only">Open main menu</span>
                  <svg className="h-6 w-6" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
                  </svg>
                </Button>
              </div>
            </div>
          </div>
        </header>

        {/* Main Content */}
        <main className="flex-grow">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col md:flex-row">
              {/* Sidebar Navigation */}
              <Sidebar setActiveTab={setActiveTab} />

              {/* Tab Content */}
              <div className="md:ml-8 md:flex-1 pt-6 pb-20 md:pb-6">
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
                      
                      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <div className="h-14 w-14 rounded-lg bg-primary bg-opacity-10 flex items-center justify-center">
                                <GraduationCap className="text-2xl text-primary" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h5 className="text-md font-medium text-neutral-900">Book Expert Session</h5>
                              <p className="mt-1 text-sm text-neutral-500">30-minute 1:1 session with a verified expert</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">Various subjects available</span>
                                <Button size="sm">500 points</Button>
                              </div>
                            </div>
                          </div>
                        </div>
                        
                        <div className="bg-white border border-neutral-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                          <div className="flex">
                            <div className="flex-shrink-0">
                              <div className="h-14 w-14 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center">
                                <Star className="text-2xl text-emerald-500" />
                              </div>
                            </div>
                            <div className="ml-4 flex-1">
                              <h5 className="text-md font-medium text-neutral-900">Access Premium Courses</h5>
                              <p className="mt-1 text-sm text-neutral-500">Unlock curated advanced learning materials</p>
                              <div className="mt-3 flex items-center justify-between">
                                <span className="text-xs text-neutral-500">20+ courses available</span>
                                <Button 
                                  size="sm"
                                  className="bg-emerald-500 hover:bg-emerald-600"
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
                    <div className="mt-8">
                      <h4 className="text-md font-medium text-neutral-900">Current Challenges</h4>
                      
                      <div className="mt-4 space-y-4">
                        {challenges.length === 0 ? (
                          <div className="bg-neutral-50 p-4 rounded-md text-center">
                            <p className="text-neutral-500">No active challenges</p>
                          </div>
                        ) : (
                          challenges.map((challenge) => (
                            <ChallengeCard 
                              key={challenge.id}
                              challenge={challenge}
                            />
                          ))
                        )}
                      </div>
                    </div>

                    {/* Leaderboard */}
                    <Leaderboard />
                  </div>
                </div>
              </div>
            </div>
          </div>
        </main>

        {/* Mobile Navigation */}
        <MobileNav setActiveTab={setActiveTab} activeTab={activeTab} />
      </div>
    </SocketProvider>
  );
}
