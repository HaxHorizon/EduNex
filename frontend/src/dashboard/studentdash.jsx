import React, { useEffect, useState, useRef } from "react";
import { User, LogOut, Users, MessageCircle, Video, Book, Bell, Search, Calendar, Settings } from "lucide-react";
import { io } from "socket.io-client";
const FeatureCard = ({ title, description, buttonText, icon: Icon, onClick, color = "blue" }) => {
  const colorClasses = {
    blue: "bg-blue-100 border-blue-300 hover:bg-blue-200",
    green: "bg-green-100 border-green-300 hover:bg-green-200",
    purple: "bg-purple-100 border-purple-300 hover:bg-purple-200",
    orange: "bg-orange-100 border-orange-300 hover:bg-orange-200",
    pink: "bg-pink-100 border-pink-300 hover:bg-pink-200",
    teal: "bg-teal-100 border-teal-300 hover:bg-teal-200",
  };

  const buttonColorClasses = {
    blue: "bg-blue-600 hover:bg-blue-700",
    green: "bg-green-600 hover:bg-green-700",
    purple: "bg-purple-600 hover:bg-purple-700",
    orange: "bg-orange-600 hover:bg-orange-700",
    pink: "bg-pink-600 hover:bg-pink-700",
    teal: "bg-teal-600 hover:bg-teal-700",
  };

  return (
    <div className={`rounded-xl border p-6 shadow-sm transition-all duration-300 ${colorClasses[color]}`}>
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-bold">{title}</h3>
        {Icon && <Icon size={24} className="text-gray-700" />}
      </div>
      <p className="text-gray-600 mb-6">{description}</p>
      <button
        onClick={onClick}
        className={`${buttonColorClasses[color]} text-white py-2 px-4 rounded-lg w-full transition-colors duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-${color}-500`}
      >
        {buttonText}
      </button>
    </div>
  );
};

const WelcomeHeader = ({ studentName, upcomingEvents = [] }) => {
  const currentHour = new Date().getHours();
  let greeting;

  if (currentHour < 12) greeting = "Good morning";
  else if (currentHour < 18) greeting = "Good afternoon";
  else greeting = "Good evening";

  return (
    <div className="bg-white rounded-xl shadow-md p-6 mb-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold text-gray-800">
            {greeting}, <span className="text-blue-600">{studentName}</span>!
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome to your EduNex StudentDashboard.
          </p>
        </div>
      </div>
    </div>
  );
};

const StudentDashboard = () => {
  const [studentName, setStudentName] = useState("");
  const [email, setEmail] = useState("");
  const [eid, setEid] = useState("");
  const [showUserDetails, setShowUserDetails] = useState(false);
  const [peerId, setPeerId] = useState("");
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [upcomingEvents, setUpcomingEvents] = useState([
    "Math Study Group - 3:00 PM",
    "Physics Assignment Due - 11:59 PM",
    "History Discussion - Tomorrow, 10:00 AM"
  ]);
  
  const socket = io("http://localhost:5000");


  useEffect(() => {
    socket.on("notification", (notification) => {
      setNotifications(prev => [...prev, notification]);
    });

    return () => {
      socket.off("notification");
    };
  }, [socket]);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    const fetchUser = async () => {
      try {
        setIsLoading(true);
        const res = await fetch("http://localhost:5000/api/me", {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });

        if (res.ok) {
          const data = await res.json();
          setStudentName(data.fullName);
          setEmail(data.email);
          setEid(data.eid);

          setNotifications([
            { id: 1, message: "New message from Study Group", time: "10 minutes ago" },
            { id: 2, message: "Physics homework reminder", time: "1 hour ago" }
          ]);
        } else {
          localStorage.removeItem("token");
          window.location.href = "/auth";
        }
      } catch (error) {
        console.error("Error fetching user data:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchUser();
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  const startNexCall = () => {
    if (!peerId.trim()) {
      alert("Please enter a valid Peer ID");
      return;
    }
    socket.emit("video_call_request", peerId);
    console.log(`Video call request sent to ${peerId}`);
    setPeerId("");
  };

  const clearNotification = (id) => {
    setNotifications(notifications.filter(notif => notif.id !== id));
  };

  const handleSearch = (e) => {
    e.preventDefault();
    console.log("Searching for:", searchQuery);

  };

  const userBoxRef = useRef(null);
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (userBoxRef.current && !userBoxRef.current.contains(event.target)) {
        setShowUserDetails(false);
      }
    };

    if (showUserDetails) {
      document.addEventListener("click", handleClickOutside);
    } else {
      document.removeEventListener("click", handleClickOutside);
    }

    return () => {
      document.removeEventListener("click", handleClickOutside);
    };
  }, [showUserDetails]);


  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="text-4xl font-extrabold flex items-center">
          <span className="text-white">Edu</span>
          <span className="text-green-500">Nex</span>
        </div>


        <form onSubmit={handleSearch} className="hidden md:flex flex-1 mx-6 max-w-lg">
  <div className="relative w-full">
    <input
      type="text"
      placeholder="Search courses, peers, resources..."
      className="w-full px-4 py-2 pr-10 rounded-lg text-gray-800 focus:outline-none focus:ring-4 focus:ring-black focus:ring-offset-1"
      value={searchQuery}
      onChange={(e) => setSearchQuery(e.target.value)}
    />
    <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-black">
      <Search size={20} />
    </button>
  </div>
</form>


        <div className="space-x-4 flex items-center relative">
          <div className="relative">
            <button 
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2 hover:bg-blue-700 rounded-full relative focus:outline-none focus:ring-2 focus:ring-white"
            >
              <Bell size={20} />
              {notifications.length > 0 && (
                <span className="absolute top-0 right-0 bg-red-500 text-white text-xs rounded-full h-5 w-5 flex items-center justify-center">
                  {notifications.length}
                </span>
              )}
            </button>
            
            {showNotifications && (
              <div className="absolute right-0 top-12 bg-white rounded-lg shadow-lg text-black w-72 z-10 max-h-96 overflow-y-auto">
                <div className="p-3 border-b font-semibold flex justify-between items-center">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button 
                      className="text-xs text-blue-600 hover:text-blue-800"
                      onClick={() => setNotifications([])}
                    >
                      Clear all
                    </button>
                  )}
                </div>
                
                {notifications.length > 0 ? (
                  <div>
                    {notifications.map((notif) => (
                      <div key={notif.id} className="p-3 border-b hover:bg-gray-50 flex justify-between items-start">
                        <div>
                          <p className="text-sm">{notif.message}</p>
                          <p className="text-xs text-gray-500 mt-1">{notif.time}</p>
                        </div>
                        <button 
                          onClick={() => clearNotification(notif.id)}
                          className="text-gray-400 hover:text-gray-600"
                        >
                          &times;
                        </button>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="p-4 text-center text-gray-500">
                    No new notifications
                  </div>
                )}
              </div>
            )}
          </div>
          
          <div
      className="relative"
      onClick={() => setShowUserDetails(true)}
      ref={userBoxRef}
    >
            <div className="h-10 w-10 rounded-full bg-blue-700 flex items-center justify-center cursor-pointer hover:bg-blue-800">
              <User size={20} />
            </div>
            
            {showUserDetails && studentName && (
              <div className="absolute right-0 top-12 bg-white p-4 rounded-lg shadow-lg text-black w-64 z-10">
                <div className="flex items-center mb-3">
                  <div className="h-12 w-12 rounded-full bg-blue-100 flex items-center justify-center mr-3">
                    <User size={24} className="text-blue-600" />
                  </div>
                  <div>
                    <h3 className="font-bold">{studentName}</h3>
                    <p className="text-sm text-gray-600">{email}</p>
                    <p className="text-xs text-gray-600">{eid}</p>
                  </div>
                </div>
                <div className="border-t pt-3">
                  <button 
                    className="w-full text-left py-2 hover:bg-gray-100 rounded px-2 flex items-center"
                    onClick={() => window.location.href = "/student/profile"}
                  >
                    <User size={16} className="mr-2" /> View Profile
                  </button>
                  <button 
                    className="w-full text-left py-2 hover:bg-gray-100 rounded px-2 flex items-center"
                    onClick={() => window.location.href = "/student/settings"}
                  >
                    <Settings size={16} className="mr-2" /> Settings
                  </button>
                  <button 
                    className="w-full text-left py-2 hover:bg-gray-100 rounded px-2 flex items-center text-red-600"
                    onClick={handleLogout}
                  >
                    <LogOut size={16} className="mr-2" /> Logout
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>


      <div className="flex-1 p-6">
        <WelcomeHeader studentName={studentName} upcomingEvents={upcomingEvents} />

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
          <button 
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
            onClick={() => window.location.href = "/student/nexcall"}
          >
            <Video size={24} className="text-blue-600 mb-2" />
            <span className="text-sm">Start NexCall</span>
          </button>
          <button 
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
            onClick={() => window.location.href = "/student/chat"}
          >
            <MessageCircle size={24} className="text-green-600 mb-2" />
            <span className="text-sm">Chat</span>
          </button>
          <button 
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
            onClick={() => window.location.href = "/student/study-groups"}
          >
            <Users size={24} className="text-purple-600 mb-2" />
            <span className="text-sm">Study Groups</span>
          </button>
          <button 
            className="bg-white p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow flex flex-col items-center"
            onClick={() => window.location.href = "/student/resources"}
          >
            <Book size={24} className="text-orange-600 mb-2" />
            <span className="text-sm">Resources</span>
          </button>
        </div>


        <h2 className="text-xl font-bold text-gray-800 mb-4">Study Tools</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
          <FeatureCard
            title="Create Study Circle"
            description="Start a new P2P group and invite your peers for collaborative learning."
            buttonText="Create Circle"
            icon={Users}
            color="blue"
            onClick={() => window.location.href = "/student/create-circle"}
          />
          <FeatureCard
            title="Join Circle"
            description="Enter a code to join an existing study circle and connect with peers."
            buttonText="Join Circle"
            icon={Users}
            color="green"
            onClick={() => window.location.href = "/student/join-circle"}
          />
          <FeatureCard
            title="Group Chat"
            description="Chat with your study circle members in real-time to discuss assignments."
            buttonText="Open Group Chat"
            icon={MessageCircle}
            color="purple"
            onClick={() => window.location.href = "/student/group-chat"}
          />
        </div>

        <h2 className="text-xl font-bold text-gray-800 mb-4">Connect & Communicate</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <FeatureCard
            title="Send a Message"
            description="Send quick messages to your peers or teachers."
            buttonText="Send Message"
            icon={MessageCircle}
            onClick={() => navigate("/student/chat")}
          />
          <FeatureCard
            title="NexCalls"
            description="Start or join a peer-to-peer video call with screen sharing capabilities."
            buttonText="Start NexCall"
            icon={Video}
            color="teal"
            onClick={() => window.location.href = "/student/nexcall"}
          />
          

          <div className="bg-white rounded-xl border shadow-sm p-6">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-bold">Quick Call</h3>
              <Video size={24} className="text-gray-700" />
            </div>
            <p className="text-gray-600 mb-4">Start a direct NexCall with a peer using their ID.</p>
            <div className="flex gap-2">
              <input
                type="text"
                value={peerId}
                onChange={(e) => setPeerId(e.target.value)}
                placeholder="Enter Peer ID"
                className="flex-1 px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
              <button
                onClick={startNexCall}
                className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg transition-colors duration-300"
              >
                Call
              </button>
            </div>
          </div>
        </div>
      </div>

      <footer className="bg-white py-4 px-6 text-center text-gray-600 border-t">
        <p>© 2025 EduNex. All rights reserved.</p>
      </footer>
    </div>
  );
};

export default StudentDashboard;