import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Outlet } from 'react-router-dom';

import {
  Book,
  Users,
  Layers,
  UploadCloud,
  Megaphone,
  LogOut,
} from "lucide-react";
import CourseManagement from "./teacher/CourseManagement";
import StudentEnrollment from "./teacher/StudentEnrollment";
import ModuleManagement from "./teacher/ModuleManagement";
import ResourceUpload from "./teacher/ResourceUpload";
import Announcements from "./teacher/Announcements";

const tabConfig = [
  {
    label: "Courses",
    icon: Book,
    component: <CourseManagement />,
    color: "blue",
  },
  {
    label: "Student Enrollment",
    icon: Users,
    component: <StudentEnrollment />,
    color: "green",
  },
  {
    label: "Modules",
    icon: Layers,
    component: <ModuleManagement />,
    color: "purple",
  },
  {
    label: "Resources",
    icon: UploadCloud,
    component: <ResourceUpload />,
    color: "orange",
  },
  {
    label: "Announcements",
    icon: Megaphone,
    component: <Announcements />,
    color: "pink",
  },
];

const TeacherDashboard = () => {
  const [activeTab, setActiveTab] = useState(0);
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return navigate("/auth");
  
    const fetchUser = async () => {
      try {
        const res = await fetch("http://localhost:5000/api/me", {
          headers: { Authorization: `Bearer ${token}` },
        });
  
        const data = await res.json();
        if (!res.ok || data.userType !== "teacher") {
          localStorage.removeItem("token");
          return navigate("/auth");
        }
  
        setUser(data);
      } catch (err) {
        console.error("Fetch error:", err);
        localStorage.removeItem("token");
        navigate("/auth");
      } finally {
        setIsLoading(false);
      }
    };
  
    fetchUser();
  }, []);
  

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/auth");
  };

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <p className="text-gray-500 text-lg">Loading...</p>
      </div>
    );
  }

  if (!user) return null;

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <Outlet />
      <header className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-4xl font-bold text-gray-800">
            Hello, <span className="text-blue-600">{user.fullName}</span>
          </h1>
          <p className="text-gray-500 mt-1">
            Welcome back! Manage your teaching workflow here.
          </p>
        </div>
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 px-4 py-2 bg-red-100 text-red-600 hover:bg-red-200 rounded-xl transition"
        >
          <LogOut size={18} />
          Logout
        </button>
      </header>

      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-4 mb-6">
        {tabConfig.map((tab, index) => {
          const Icon = tab.icon;
          const isActive = activeTab === index;
          const colorClass = `bg-${tab.color}-100 border-${tab.color}-400 text-${tab.color}-600`;

          return (
            <button
              key={index}
              onClick={() => setActiveTab(index)}
              className={`flex flex-col items-center p-4 rounded-2xl border transition-all duration-300 shadow-sm hover:shadow-md ${
                isActive ? colorClass : "bg-white border-gray-200 hover:bg-gray-50"
              }`}
            >
              <Icon
                size={28}
                className={`mb-2 ${isActive ? `text-${tab.color}-600` : "text-gray-500"}`}
              />
              <span
                className={`text-sm font-medium ${isActive ? `text-${tab.color}-700` : "text-gray-700"}`}
              >
                {tab.label}
              </span>
            </button>
          );
        })}
      </div>

      <div className="bg-white rounded-2xl p-6 shadow-md">
        {tabConfig[activeTab].component}
      </div>
    </div>
  );
};

export default TeacherDashboard;
