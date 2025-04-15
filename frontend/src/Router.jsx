import { BrowserRouter as Router, Routes, Route } from "react-router-dom";
import React from 'react';
import Auth from "./obj/Auth";

function App() {
  return (
    <Router>
      <Routes>

        <Route path="/auth" element={<Auth />} />
      </Routes>
    </Router>
  );
}

export default App;