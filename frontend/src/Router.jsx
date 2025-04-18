import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import Auth from "./obj/Auth";
import StudentDashboard from "./dashboard/studentdash";
import OneToOneChat from "./obj/ChatPage";
import VideoCall from "./obj/NexCall";
import StudentProfile from "./components/Profile";
function App() {
  return (
    <Router>
      <Routes>

        <Route path="/auth" element={<Auth />} />
        <Route path="/student" element={<StudentDashboard />} />
        <Route path="/student/chat" element={<OneToOneChat />} />
        <Route path="/student/nexcall" element={<VideoCall />} />
        <Route path="/student/profile" element={<StudentProfile />} />
      </Routes>
    </Router>
  );
}

export default App;