import React, { useState, useEffect, useRef } from "react";
import { FiLogOut } from 'react-icons/fi';
import { Outlet } from 'react-router-dom';

import { 
  User, 
  Mail, 
  Phone, 
  Book, 
  Globe, 
  Calendar, 
  MapPin, 
  Edit2, 
  Save, 
  X, 
  ChevronRight, 
  Award, 
  FileText, 
  Camera,
  Bookmark
} from "lucide-react";

const API_BASE_URL = "http://localhost:5000/api";

const StudentProfile = () => {
  const fileInputRef = useRef(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [profileImage, setProfileImage] = useState(null);
  const [imagePreview, setImagePreview] = useState(null);
  const [activeTab, setActiveTab] = useState("personal");
  const [saveStatus, setSaveStatus] = useState(null);
  const [originalProfile, setOriginalProfile] = useState(null);

  const [profile, setProfile] = useState({
    personalInfo: {
      fullName: "",
      email: "",
      eid: "",
      phone: "",
      dob: "",
      bio: "",
      location: "",
      website: ""
    },
    academicInfo: {
      major: "",
      minor: "",
      year: "",
      gpa: "",
      expectedGraduation: "",
      advisor: ""
    },
    achievements: [],
    interests: []
  });

  useEffect(() => {
    fetchFullProfile();
  }, []);

  const fetchFullProfile = async () => {
    const token = localStorage.getItem("token");
    if (!token) {
      window.location.href = "/auth";
      return;
    }

    try {
      setIsLoading(true);
      
      const baseResponse = await fetch(`${API_BASE_URL}/me`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (!baseResponse.ok) {
        throw new Error("Failed to fetch user data");
      }

      const baseData = await baseResponse.json();
      
      const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      if (profileResponse.ok) {
        const profileData = await profileResponse.json();
        
        const mergedProfile = {
          personalInfo: {
            fullName: baseData.fullName || "",
            email: baseData.email || "",
            eid: baseData.eid || "",
            phone: profileData.personalInfo?.phone || "",
            dob: profileData.personalInfo?.dob || "",
            bio: profileData.personalInfo?.bio || "",
            location: profileData.personalInfo?.location || "",
            website: profileData.personalInfo?.website || ""
          },
          academicInfo: {
            major: profileData.academicInfo?.major || "",
            minor: profileData.academicInfo?.minor || "",
            year: profileData.academicInfo?.year || "",
            gpa: profileData.academicInfo?.gpa || "",
            expectedGraduation: profileData.academicInfo?.expectedGraduation || "",
            advisor: profileData.academicInfo?.advisor || ""
          },
          achievements: profileData.achievements || [],
          interests: profileData.interests || []
        };
        
        setProfile(mergedProfile);
        setOriginalProfile(JSON.parse(JSON.stringify(mergedProfile)));
        
        if (profileData.profileImageUrl) {
          setImagePreview(profileData.profileImageUrl);
        }
      } else {
        setProfile({
          personalInfo: {
            fullName: baseData.fullName || "",
            email: baseData.email || "",
            eid: baseData.eid || "",
            phone: "",
            dob: "",
            bio: "",
            location: "",
            website: ""
          },
          academicInfo: {
            major: "",
            minor: "",
            year: "",
            gpa: "",
            expectedGraduation: "",
            advisor: ""
          },
          achievements: [],
          interests: []
        });
        setOriginalProfile(JSON.parse(JSON.stringify(profile)));
      }
    } catch (err) {
      console.error("Error fetching profile:", err);
      showNotification("Failed to load profile data. Please try again.", "error");
    } finally {
      setIsLoading(false);
    }
  };

  const showNotification = (message, type) => {
    console.log(`${type.toUpperCase()}: ${message}`);
  };

  const handleProfileChange = (section, field, value) => {
    setProfile(prev => ({
      ...prev,
      [section]: {
        ...prev[section],
        [field]: value
      }
    }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        showNotification("Image size should be less than 5MB", "error");
        return;
      }
      
      setProfileImage(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setImagePreview(reader.result);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleImageClick = () => {
    if (isEditing) {
      fileInputRef.current.click();
    }
  };

  const handleAddAchievement = () => {
    const newId = profile.achievements.length > 0
      ? Math.max(...profile.achievements.map(a => a.id)) + 1
      : 1;
  
    setProfile(prev => ({
      ...prev,
      achievements: [
        ...prev.achievements,
        { id: newId, title: "", description: "", date: "" }
      ]
    }));
  };
  
  const handleRemoveAchievement = (id) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.filter(a => a.id !== id)
    }));
  };

  const handleAchievementChange = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      achievements: prev.achievements.map(a => 
        a.id === id ? { ...a, [field]: value } : a
      )
    }));
  };

  const handleAddInterest = (interest) => {
    if (interest && !profile.interests.includes(interest)) {
      setProfile(prev => ({
        ...prev,
        interests: [...prev.interests, interest]
      }));
    }
    document.getElementById('interestInput').value = '';
  };

  const handleRemoveInterest = (interest) => {
    setProfile(prev => ({
      ...prev,
      interests: prev.interests.filter(i => i !== interest)
    }));
  };

  const handleSaveProfile = async () => {
    try {
      setSaveStatus("saving");
  
      const token = localStorage.getItem("token");
      if (!token) {
        throw new Error("Authentication required");
      }
      
      if (!profile.personalInfo.fullName) {
        throw new Error("Full name is required");
      }
      
      const profileResponse = await fetch(`${API_BASE_URL}/profile`, {
        method: "POST", 
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(profile),
      });
  
      if (!profileResponse.ok) {
        throw new Error("Failed to save profile data");
      }
      
      if (profileImage) {
        const formData = new FormData();
        formData.append("profileImage", profileImage);
        
        const imageResponse = await fetch(`${API_BASE_URL}/profile/image`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
          },
          body: formData,
        });
        
        if (!imageResponse.ok) {
          throw new Error("Failed to upload profile image");
        }
        
        const imageData = await imageResponse.json();
        setImagePreview(imageData.imageUrl);
      }
  
      setOriginalProfile(JSON.parse(JSON.stringify(profile)));
      setSaveStatus("success");
      showNotification("Profile updated successfully!", "success");
      
      setTimeout(() => {
        setSaveStatus(null);
        setIsEditing(false);
      }, 2000);
    } catch (error) {
      console.error("Error saving profile:", error);
      setSaveStatus("error");
      showNotification(error.message || "Error saving profile. Please try again.", "error");
      
      setTimeout(() => {
        setSaveStatus(null);
      }, 3000);
    }
  };
  
  const handleCancelEdit = () => {
    if (originalProfile) {
      setProfile(JSON.parse(JSON.stringify(originalProfile)));
    }
    
    if (profileImage) {
      setProfileImage(null);
      setImagePreview(originalProfile?.profileImageUrl || null);
    }
    
    setIsEditing(false);
  };

  const handleLogout = () => {
    localStorage.removeItem("token");
    window.location.href = "/auth";
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-screen bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="flex min-h-screen flex-col bg-gray-100">
      {/* Header */}
      <div className="bg-blue-600 text-white p-4 shadow-md flex justify-between items-center">
        <div className="text-2xl md:text-4xl font-extrabold flex items-center">
          <span className="text-white">Edu</span>
          <span className="text-green-500">Nex</span>
        </div>
        <div className="flex items-center space-x-4">
          <button 
            onClick={() => window.location.href = "/student"}
            className="text-white hover:underline flex items-center text-sm md:text-base"
          >
            Dashboard
          </button>
          <button
    onClick={handleLogout}
    className="w-12 h-12 flex items-center justify-center rounded-full bg-red-500 hover:bg-red-600 text-white shadow-md text-xl"
    title="Logout"
  >
    <FiLogOut size={24} />
  </button>

        </div>
      </div>

      <div className="flex-1 p-4 md:p-6">
        {/* Profile Header */}
        <div className="bg-white rounded-xl shadow-md overflow-hidden mb-6">
          <div className="relative h-40 bg-gradient-to-r from-blue-500 to-teal-400">
            {isEditing && (
              <div className="absolute top-4 right-4 bg-black bg-opacity-50 rounded-full p-2">
                <button className="text-white text-xs">Change Cover</button>
              </div>
            )}
          </div>
          <div className="px-4 md:px-6 py-6 relative">
            <div className="flex flex-col md:flex-row">
              {/* Profile Image */}
              <div className="absolute -top-16 left-6 md:relative md:top-0 md:left-0 md:mr-6">
                <div 
                  className="h-32 w-32 rounded-full border-4 border-white shadow-md overflow-hidden bg-gray-200 flex items-center justify-center cursor-pointer relative"
                  onClick={handleImageClick}
                >
                  {imagePreview || profile.personalInfo.fullName ? (
                    imagePreview ? (
                      <img 
                        src={imagePreview} 
                        alt="Profile Preview" 
                        className="h-full w-full object-cover"
                      />
                    ) : (
                      <div className="h-full w-full bg-blue-100 flex items-center justify-center">
                        <span className="text-4xl font-bold text-blue-600">
                          {profile.personalInfo.fullName.charAt(0)}
                        </span>
                      </div>
                    )
                  ) : (
                    <User size={48} className="text-gray-400" />
                  )}
                  
                  {isEditing && (
                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center">
                      <Camera size={24} className="text-white" />
                    </div>
                  )}
                  
                  <input
                    type="file"
                    ref={fileInputRef}
                    onChange={handleImageChange}
                    accept="image/*"
                    className="hidden"
                  />
                </div>
              </div>

              {/* Profile Info */}
              <div className="mt-16 md:mt-0 flex-1">
                <div className="flex flex-col md:flex-row md:items-center justify-between">
                  <div>
                    <h1 className="text-2xl font-bold text-gray-800">{profile.personalInfo.fullName}</h1>
                    <p className="text-gray-600">{profile.academicInfo.major} {profile.academicInfo.year ? `• ${profile.academicInfo.year}` : ''}</p>
                  </div>
                  
                  {!isEditing ? (
                    <button
                      onClick={() => setIsEditing(true)}
                      className="mt-4 md:mt-0 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors duration-300"
                    >
                      <Edit2 size={16} className="mr-2" /> Edit Profile
                    </button>
                  ) : (
                    <div className="mt-4 md:mt-0 flex space-x-3">
                      <button
                        onClick={handleCancelEdit}
                        className="bg-gray-200 hover:bg-gray-300 text-gray-800 py-2 px-4 rounded-lg flex items-center transition-colors duration-300"
                      >
                        <X size={16} className="mr-2" /> Cancel
                      </button>
                      <button
                        onClick={handleSaveProfile}
                        className={`bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg flex items-center transition-colors duration-300 ${
                          saveStatus === "saving" ? "opacity-70 cursor-not-allowed" : ""
                        }`}
                        disabled={saveStatus === "saving"}
                      >
                        {saveStatus === "saving" ? (
                          <>
                            <div className="animate-spin rounded-full h-4 w-4 border-2 border-white mr-2"></div>
                            Saving...
                          </>
                        ) : (
                          <>
                            <Save size={16} className="mr-2" /> Save Changes
                          </>
                        )}
                      </button>
                    </div>
                  )}
                </div>
                
                {saveStatus === "success" && (
                  <div className="mt-3 text-green-600 flex items-center">
                    <span className="bg-green-100 text-green-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Profile saved successfully!
                    </span>
                  </div>
                )}
                
                {saveStatus === "error" && (
                  <div className="mt-3 text-red-600 flex items-center">
                    <span className="bg-red-100 text-red-800 text-xs font-medium px-2.5 py-0.5 rounded-full">
                      Error saving profile. Please try again.
                    </span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Profile Tabs */}
        <div className="flex border-b mb-6 overflow-x-auto">
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "personal"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("personal")}
          >
            Personal Info
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "academic"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("academic")}
          >
            Academic Info
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "achievements"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("achievements")}
          >
            Achievements
          </button>
          <button
            className={`py-3 px-6 font-medium whitespace-nowrap ${
              activeTab === "interests"
                ? "text-blue-600 border-b-2 border-blue-600"
                : "text-gray-600 hover:text-blue-600"
            }`}
            onClick={() => setActiveTab("interests")}
          >
            Interests
          </button>
        </div>

        {/* Tab Content */}
        <div className="bg-white rounded-xl shadow-md p-4 md:p-6">
          {/* Personal Info Tab */}
          {activeTab === "personal" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Personal Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Full Name */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Full Name</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.personalInfo.fullName}
                      onChange={(e) => handleProfileChange("personalInfo", "fullName", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                      required
                    />
                  ) : (
                    <div className="flex items-center">
                      <User size={16} className="text-gray-500 mr-2" />
                      <span>{profile.personalInfo.fullName || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Email */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                  {isEditing ? (
                    <input
                      type="email"
                      value={profile.personalInfo.email}
                      onChange={(e) => handleProfileChange("personalInfo", "email", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Mail size={16} className="text-gray-500 mr-2" />
                      <span>{profile.personalInfo.email || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* EID */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Student ID (EID)</label>
                  <div className="flex items-center">
                    <FileText size={16} className="text-gray-500 mr-2" />
                    <span>{profile.personalInfo.eid || "Not specified"}</span>
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                  {isEditing ? (
                    <input
                      type="tel"
                      value={profile.personalInfo.phone}
                      onChange={(e) => handleProfileChange("personalInfo", "phone", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Phone size={16} className="text-gray-500 mr-2" />
                      <span>{profile.personalInfo.phone || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Date of Birth */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Date of Birth</label>
                  {isEditing ? (
                    <input
                      type="date"
                      value={profile.personalInfo.dob}
                      onChange={(e) => handleProfileChange("personalInfo", "dob", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span>
                        {profile.personalInfo.dob 
                          ? new Date(profile.personalInfo.dob).toLocaleDateString() 
                          : "Not specified"}
                      </span>
                    </div>
                  )}
                </div>

                {/* Location */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.personalInfo.location}
                      onChange={(e) => handleProfileChange("personalInfo", "location", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <MapPin size={16} className="text-gray-500 mr-2" />
                      <span>{profile.personalInfo.location || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Website */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Website</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.personalInfo.website}
                      onChange={(e) => handleProfileChange("personalInfo", "website", e.target.value)}
                      placeholder="example.com (without http://)"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Globe size={16} className="text-gray-500 mr-2" />
                      {profile.personalInfo.website ? (
                        <a 
                          href={`https://${profile.personalInfo.website}`} 
                          target="_blank" 
                          rel="noopener noreferrer"
                          className="text-blue-600 hover:underline"
                        >
                          {profile.personalInfo.website}
                        </a>
                      ) : (
                        <span>Not specified</span>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* Bio */}
              <div className="mt-6">
                <label className="block text-sm font-medium text-gray-700 mb-1">Biography</label>
                {isEditing ? (
                  <textarea
                    value={profile.personalInfo.bio}
                    onChange={(e) => handleProfileChange("personalInfo", "bio", e.target.value)}
                    rows={4}
                    className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                ) : (
                  <p className="text-gray-700">{profile.personalInfo.bio || "No biography provided."}</p>
                )}
              </div>
            </div>
          )}

          {/* Academic Info Tab */}
          {activeTab === "academic" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Academic Information</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Major */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Major</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.academicInfo.major}
                      onChange={(e) => handleProfileChange("academicInfo", "major", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Book size={16} className="text-gray-500 mr-2" />
                      <span>{profile.academicInfo.major || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Minor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Minor</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.academicInfo.minor}
                      onChange={(e) => handleProfileChange("academicInfo", "minor", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Book size={16} className="text-gray-500 mr-2" />
                      <span>{profile.academicInfo.minor || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Year */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Year</label>
                  {isEditing ? (
                    <select
                      value={profile.academicInfo.year}
                      onChange={(e) => handleProfileChange("academicInfo", "year", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    >
                      <option value="">Select Academic Year</option>
<option value="Freshman">Freshman - 1st Year</option>
<option value="Sophomore">Sophomore - 2nd Year</option>
<option value="Junior">Junior - 3rd Year</option>
<option value="Senior">Senior - 4th Year</option>
<option value="Graduate">Graduate - Post-Bachelor</option>

                    </select>
                  ) : (
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span>{profile.academicInfo.year || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* GPA */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">GPA</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.academicInfo.gpa}
                      onChange={(e) => handleProfileChange("academicInfo", "gpa", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Award size={16} className="text-gray-500 mr-2" />
                      <span>{profile.academicInfo.gpa || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Expected Graduation */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Expected Graduation</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.academicInfo.expectedGraduation}
                      onChange={(e) => handleProfileChange("academicInfo", "expectedGraduation", e.target.value)}
                      placeholder="e.g., Spring 2026"
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <Calendar size={16} className="text-gray-500 mr-2" />
                      <span>{profile.academicInfo.expectedGraduation || "Not specified"}</span>
                    </div>
                  )}
                </div>

                {/* Academic Advisor */}
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Academic Advisor</label>
                  {isEditing ? (
                    <input
                      type="text"
                      value={profile.academicInfo.advisor}
                      onChange={(e) => handleProfileChange("academicInfo", "advisor", e.target.value)}
                      className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  ) : (
                    <div className="flex items-center">
                      <User size={16} className="text-gray-500 mr-2" />
                      <span>{profile.academicInfo.advisor || "Not specified"}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          )}

          {/* Achievements Tab */}
          {activeTab === "achievements" && (
            <div>
              <div className="flex justify-between items-center mb-6">
                <h2 className="text-xl font-bold text-gray-800">Achievements</h2>
                {isEditing && (
                  <button
                    onClick={handleAddAchievement}
                    className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm flex items-center transition-colors duration-300"
                  >
                    + Add Achievement
                  </button>
                )}
              </div>

              {profile.achievements?.length > 0 ? (
                <div className="space-y-6">
                  {profile.achievements.map((achievement) => (
                    <div key={achievement.id} className="border rounded-lg p-4 relative">
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveAchievement(achievement.id)}
                          className="absolute top-4 right-4 text-red-500 hover:text-red-700"
                        >
                          <X size={16} />
                        </button>
                      )}

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Title</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={achievement.title}
                            onChange={(e) =>
                              handleAchievementChange(achievement.id, "title", e.target.value)
                            }
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <h3 className="font-semibold text-lg">{achievement.title}</h3>
                        )}
                      </div>

                      <div className="mb-3">
                        <label className="block text-sm font-medium text-gray-700 mb-1">Date</label>
                        {isEditing ? (
                          <input
                            type="text"
                            value={achievement.date}
                            onChange={(e) =>
                              handleAchievementChange(achievement.id, "date", e.target.value)
                            }
                            placeholder="e.g., May 2023"
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-sm text-gray-600">{achievement.date}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                        {isEditing ? (
                          <textarea
                            value={achievement.description}
                            onChange={(e) =>
                              handleAchievementChange(achievement.id, "description", e.target.value)
                            }
                            rows={3}
                            className="w-full px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                          />
                        ) : (
                          <p className="text-gray-700">{achievement.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Award size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No achievements added yet.</p>
                  {isEditing && (
                    <button
                      onClick={handleAddAchievement}
                      className="mt-4 bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-lg text-sm inline-flex items-center transition-colors duration-300"
                    >
                      + Add Your First Achievement
                    </button>
                  )}
                </div>
              )}
            </div>
          )}

          {/* Interests Tab */}
          {activeTab === "interests" && (
            <div>
              <h2 className="text-xl font-bold text-gray-800 mb-6">Interests</h2>

              {isEditing && (
                <div className="mb-6">
                  <label className="block text-sm font-medium text-gray-700 mb-1">Add an Interest</label>
                  <div className="flex">
                    <input
                      id="interestInput"
                      type="text"
                      placeholder="e.g., Machine Learning"
                      className="flex-1 px-3 py-2 border rounded-l-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                    <button
                      onClick={() =>
                        handleAddInterest(document.getElementById("interestInput").value)
                      }
                      className="bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded-r-lg"
                    >
                      Add
                    </button>
                  </div>
                </div>
              )}

              {profile.interests?.length > 0 ? (
                <div className="flex flex-wrap gap-2">
                  {profile.interests.map((interest, index) => (
                    <div
                      key={index}
                      className="bg-blue-100 text-blue-800 px-3 py-1 rounded-full flex items-center"
                    >
                      <Bookmark size={14} className="mr-1" />
                      <span>{interest}</span>
                      {isEditing && (
                        <button
                          onClick={() => handleRemoveInterest(interest)}
                          className="ml-2 text-blue-600 hover:text-blue-800"
                        >
                          <X size={14} />
                        </button>
                      )}
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8">
                  <Bookmark size={48} className="mx-auto text-gray-300 mb-3" />
                  <p className="text-gray-500">No interests added yet.</p>
                  {isEditing && (
                    <p className="text-sm text-gray-500 mt-2">
                      Add interests to show what you're passionate about!
                    </p>
                  )}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-6 mt-6">
        <div className="container mx-auto px-4">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div className="mb-4 md:mb-0">
              <div className="text-2xl font-extrabold flex items-center">
                <span className="text-white">Edu</span>
                <span className="text-green-500">Nex</span>
              </div>
              <p className="text-gray-400 text-sm mt-1">
                Empowering Education through Technology
              </p>
            </div>
            <div className="flex space-x-4">
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Privacy Policy
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Terms of Service
              </a>
              <a href="#" className="text-gray-400 hover:text-white transition-colors duration-300">
                Help Center
              </a>
            </div>
          </div>
          <div className="mt-6 text-center text-gray-500 text-sm">
            &copy; {new Date().getFullYear()} EduNex Learning Platform. All rights reserved.
          </div>
        </div>
      </footer>
    </div>
  );
};

export default StudentProfile;