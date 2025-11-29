import React, { useState } from "react";
import { useAuth } from "@/hooks/use-auth";
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
import logoImage from "../assets/logo.png";
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
  Users,
  Settings,
  Newspaper,
  MessageCircle,
  UserPlus
} from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { Link, useLocation } from "wouter";
import { MobileNav } from "@/components/ui/mobile-nav";

export default function HomePage() {
  const { user, logout } = useAuth();
  const [location] = useLocation();

  // Initialize activeTab from query parameter or default to "profile-tab"
  const [activeTab, setActiveTab] = useState(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    return tab || "profile-tab";
  });

  // Update activeTab if query param changes (e.g. back button)
  React.useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const tab = params.get("tab");
    if (tab && tab !== activeTab) {
      setActiveTab(tab);
    }
  }, [location]);

  // Use Challenge type from import at the top

  // Get challenges for the user
  const { data: challenges = [] as Challenge[] } = useQuery<Challenge[]>({
    queryKey: ["/api/challenges"],
  });

  const navItems = [
    {
      label: 'Profile',
      icon: <User className="w-5 h-5 text-neutral-700" />,
      target: 'profile-tab',
      isRoute: false
    },
    {
      label: 'Feed',
      icon: <Newspaper className="w-5 h-5 text-neutral-700" />,
      target: '/feed',
      isRoute: true
    },
    {
      label: 'Messages',
      icon: <MessageCircle className="w-5 h-5 text-neutral-700" />,
      target: '/messages',
      isRoute: true
    },
    {
      label: 'Skill Exchange',
      icon: <Repeat className="w-5 h-5 text-neutral-700" />,
      target: 'barter-tab',
      isRoute: false
    },
    {
      label: 'Points',
      icon: <CreditCard className="w-5 h-5 text-neutral-700" />,
      target: 'points-tab',
      isRoute: false
    },
    {
      label: 'Learn',
      icon: <GraduationCap className="w-5 h-5 text-neutral-700" />,
      target: 'learn-tab',
      isRoute: false
    },
    {
      label: 'Achievements',
      icon: <Trophy className="w-5 h-5 text-neutral-700" />,
      target: 'achievements-tab',
      isRoute: false
    },
    {
      label: 'Community',
      icon: <Users className="w-5 h-5 text-neutral-700" />,
      target: 'study-group-tab',
      isRoute: false
    }
  ];

  return (
    <div className="min-h-screen flex flex-col bg-premium-gradient font-sans">

      {/* Main Content */}
      <main className="flex-grow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-6">
          {/* Icon-only navigation buttons */}
          <div className="flex flex-wrap gap-3 mb-8 justify-center sm:justify-start">
            {navItems.map((item) => {
              const isActive = item.isRoute ? false : activeTab === item.target;
              return item.isRoute ? (
                <Link key={item.label} to={item.target}>
                  <button
                    className="group flex items-center justify-center w-14 h-14 rounded-2xl bg-white/40 backdrop-blur-sm border border-white/40 text-neutral-700 hover:bg-white/60 hover:scale-110 hover:shadow-lg transition-all duration-300"
                    aria-label={item.label}
                    title={item.label}
                  >
                    {React.cloneElement(item.icon as React.ReactElement, {
                      className: "h-6 w-6 group-hover:text-primary transition-colors"
                    })}
                  </button>
                </Link>
              ) : (
                <button
                  key={item.label}
                  onClick={() => setActiveTab(item.target)}
                  className={`group flex items-center justify-center w-14 h-14 rounded-2xl transition-all duration-300 ${isActive
                    ? 'bg-primary text-white shadow-lg scale-110 ring-4 ring-primary/20'
                    : 'bg-white/40 backdrop-blur-sm border border-white/40 text-neutral-700 hover:bg-white/60 hover:scale-110 hover:shadow-lg'
                    }`}
                  aria-label={item.label}
                  title={item.label}
                >
                  {React.cloneElement(item.icon as React.ReactElement, {
                    className: `h-6 w-6 ${isActive ? 'text-white' : 'group-hover:text-primary'} transition-colors`
                  })}
                </button>
              );
            })}
          </div>

          {/* Content area with no sidebar */}
          <div className="pt-0 pb-24">
            {/* Profile Tab */}
            <div
              id="profile-tab"
              className={`glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'profile-tab' ? 'hidden' : ''}`}
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
              className={`glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'barter-tab' ? 'hidden' : ''}`}
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
              className={`glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'points-tab' ? 'hidden' : ''}`}
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
                    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-lg bg-blue-500 bg-opacity-10 flex items-center justify-center">
                            <GraduationCap className="text-2xl text-blue-500" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-md font-medium text-neutral-900">Book Expert Session</h5>
                          <p className="mt-1 text-sm text-neutral-500">30-minute 1:1 session with a verified expert</p>
                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
                            <span className="text-xs text-neutral-500">Various subjects available</span>
                            <Button size="sm" className="bg-blue-500 hover:bg-blue-600">500 points</Button>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="bg-white/60 backdrop-blur-sm border border-white/40 rounded-xl p-4 hover:shadow-lg hover:scale-[1.02] transition-all duration-300">
                      <div className="flex">
                        <div className="flex-shrink-0">
                          <div className="h-14 w-14 rounded-lg bg-emerald-500 bg-opacity-10 flex items-center justify-center">
                            <Star className="text-2xl text-emerald-500" />
                          </div>
                        </div>
                        <div className="ml-4 flex-1">
                          <h5 className="text-md font-medium text-neutral-900">Access Premium Courses</h5>
                          <p className="mt-1 text-sm text-neutral-500">Unlock curated advanced learning materials</p>
                          <div className="mt-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2">
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
              className={`glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'learn-tab' ? 'hidden' : ''}`}
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
              className={`glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'achievements-tab' ? 'hidden' : ''}`}
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
              className={`glass-card rounded-3xl overflow-hidden animate-in fade-in slide-in-from-bottom-4 duration-500 ${activeTab !== 'study-group-tab' ? 'hidden' : ''}`}
            >
              <div className="px-4 py-5 sm:px-6 border-b border-neutral-200">
                <h3 className="text-lg font-medium leading-6 text-neutral-900">Community</h3>
                <p className="mt-1 max-w-2xl text-sm text-neutral-500">Connect with peers, join study groups, and form teams</p>
              </div>

              <div className="p-6">
                <StudyGroupSection />
              </div>
            </div>
          </div>
        </div>
      </main>
      {/* Mobile bottom navigation */}
      <MobileNav setActiveTab={setActiveTab} activeTab={activeTab} />
    </div>
  );
}
