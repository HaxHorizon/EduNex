
import React from "react";

export const FeatureCard = ({ title, description, buttonText, onClick }) => {
  return (
    <div className="rounded-2xl shadow-md bg-white p-4">
      <h2 className="text-xl font-semibold mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <Button onClick={onClick}>{buttonText}</Button>
    </div>
  );
};

export const WelcomeHeader = ({ studentName }) => {
  return (
    <h1 className="text-3xl font-bold mb-6">
      Hello, {studentName || "Student"} 👋
    </h1>
  );
};

export const Button = ({ children, onClick }) => {
  return (
    <button
      onClick={onClick}
      className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition"
    >
      {children}
    </button>
  );
};
