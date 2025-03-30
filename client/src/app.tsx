import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { LearningSession } from "./components/learning-session";
import { LeaderboardSection } from "./components/leaderboard";
import { StudyGroups } from "./components/study-groups";
import { Profile } from "./components/profile"; // Added import for Profile component


function App() {
  return (
    <Router>
      <div>
        <nav>
          <ul>
            <li><a href="/">Home</a></li>
            <li><a href="/leaderboard">Leaderboard</a></li>
            <li><a href="/study-groups">Study Groups</a></li>
            <li><a href="/profile">Profile</a></li>
          </ul>
        </nav>

        <Routes>
          <Route path="/" element={<LearningSession />} /> {/* Assumed default route */}
          <Route path="/leaderboard" element={<LeaderboardSection />} />
          <Route path="/study-groups" element={<StudyGroups />} />
          <Route path="/profile" element={<Profile />} />
        </Routes>
      </div>
    </Router>
  );
}

export default App;

// Dummy components (replace with your actual components)
export const LearningSession = () => <div>Learning Session</div>;
export const LeaderboardSection = () => <div>Leaderboard</div>;
export const StudyGroups = () => <div>Study Groups</div>;
export const Profile = () => <div>Profile</div>;