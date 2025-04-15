import { useState } from 'react';
import React from 'react';
import { ToastContainer, toast } from 'react-toastify';
import "react-toastify/dist/ReactToastify.css";

const LoginForm = ({ projectName = "Edunex" }) => {
  const [userType, setUserType] = useState('student');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  const handleLogin = async (e) => {
    e.preventDefault();

    if (!email || !password) {
      toast.error("Please enter both email and password");
      return;
    }

    try {
      const res = await fetch("http://localhost:5000/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password, userType }),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success("Login successful");
        setTimeout(() => {
          window.location.href = "https://www.youtube.com";
        }, 1000);  // Redirect after 1 second
      } else {
        toast.error(data.message || "Login failed");
      }
    } catch (error) {
      toast.error("Something went wrong");
      console.error("Login error:", error);
    }
  };

  return (
    <div className="p-12 bg-white h-full flex flex-col justify-center items-center text-center text-gray-700">
      <h1 className="text-2xl font-bold mb-2 text-blue-600">{projectName}</h1>
      <p className="text-sm text-gray-500 mb-6">Sign in to your account</p>

      <div className="flex justify-center bg-gray-100 rounded-lg p-2 mb-4 w-4/5">
        <div className="flex items-center space-x-2 mx-4">
          <input 
            type="radio" 
            id="student-login" 
            name="role-login" 
            value="student" 
            checked={userType === 'student'}
            onChange={() => setUserType('student')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="student-login" className="text-sm">Student</label>
        </div>
        <div className="flex items-center space-x-2 mx-4">
          <input 
            type="radio" 
            id="teacher-login" 
            name="role-login" 
            value="teacher" 
            checked={userType === 'teacher'}
            onChange={() => setUserType('teacher')}
            className="text-blue-600 focus:ring-blue-500"
          />
          <label htmlFor="teacher-login" className="text-sm">Teacher</label>
        </div>
      </div>

      <input 
        type="email" 
        placeholder="Email Address" 
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        className="w-full p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        required 
      />
      <input 
        type="password" 
        placeholder="Password" 
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        className="w-full p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
        required 
      />

      <a href="#" className="text-blue-600 text-sm hover:text-blue-700 transition-colors mb-6">
        Forgot your password?
      </a>

      <button 
        type="submit"
        onClick={handleLogin}
        className="bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-8 rounded-full uppercase text-xs tracking-wider font-medium shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 focus:outline-none"
      >
        Sign In
      </button>

    </div>
  );
};

export default LoginForm;
