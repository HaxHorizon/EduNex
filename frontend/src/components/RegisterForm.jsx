import React, { useState } from "react";
import { ToastContainer, toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const RegisterForm = ({ projectName = "Edunex" }) => {
  const [userType, setUserType] = useState("student");
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    extraInfo: "",
  });

  const generateEID = () => {
    const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789.-+";
    let eid = "";
    for (let i = 0; i < 13; i++) {
      eid += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return `${eid}@edunex`;
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const eid = generateEID();

    const payload = {
      fullName: formData.fullName,
      email: formData.email,
      password: formData.password,
      userType,
      extraInfo: formData.extraInfo,
      eid,
    };

    try {
      const res = await fetch("http://localhost:5000/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await res.json();

      if (res.ok) {
        toast.success(`Account created successfully!`);
        setFormData({ fullName: "", email: "", password: "", extraInfo: "" });
        setUserType("student");
      } else {
        toast.error(data.message || "Registration failed");
      }
    } catch (error) {
      toast.error("Server error!");
    }
  };

  return (
    <>
      <div className="p-12 bg-white h-full flex flex-col justify-center items-center text-center text-gray-700">
        <h1 className="text-2xl font-bold mb-2 text-blue-600">{projectName}</h1>
        <p className="text-sm text-gray-500 mb-6">Create your account</p>

        <form onSubmit={handleSubmit} className="w-full max-w-md">
          <div className="flex justify-center bg-gray-100 rounded-lg p-2 mb-4">
            <div className="flex items-center space-x-2 mx-4">
              <input
                type="radio"
                id="student-register"
                name="role"
                value="student"
                checked={userType === "student"}
                onChange={() => setUserType("student")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="student-register" className="text-sm">
                Student
              </label>
            </div>
            <div className="flex items-center space-x-2 mx-4">
              <input
                type="radio"
                id="teacher-register"
                name="role"
                value="teacher"
                checked={userType === "teacher"}
                onChange={() => setUserType("teacher")}
                className="text-blue-600 focus:ring-blue-500"
              />
              <label htmlFor="teacher-register" className="text-sm">
                Teacher
              </label>
            </div>
          </div>

          <input
            type="text"
            name="fullName"
            value={formData.fullName}
            onChange={handleChange}
            placeholder="Full Name"
            className="w-full p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          <input
            type="email"
            name="email"
            value={formData.email}
            onChange={handleChange}
            placeholder="Email Address"
            className="w-full p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />
          <input
            type="password"
            name="password"
            value={formData.password}
            onChange={handleChange}
            placeholder="Password"
            className="w-full p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
            required
          />

          <input
            type="text"
            name="extraInfo"
            value={formData.extraInfo}
            onChange={handleChange}
            placeholder={
              userType === "student" ? "Grade/Class" : "Subject Specialization"
            }
            className="w-full p-3 mb-4 bg-gray-100 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
          />

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-blue-600 to-blue-500 text-white py-3 px-8 rounded-full uppercase text-xs tracking-wider font-medium shadow-lg hover:shadow-xl transform transition hover:-translate-y-0.5 focus:outline-none mt-4"
          >
            Create Account
          </button>
        </form>
      </div>
    </>
  );
};

export default RegisterForm;
