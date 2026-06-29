import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";

import Landing from "./pages/Landing";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import "react-toastify/dist/ReactToastify.css";
import { ToastContainer } from "react-toastify";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/login" />;
};

function App() {
  return (
    <BrowserRouter>
      <ToastContainer
        position="bottom-right"
        autoClose={2000}
        theme="dark"
        limit={3}
        newestOnTop={false}
        closeOnClick
        pauseOnFocusLoss={false}
        style={{ zIndex: 9999 }}
        toastStyle={{
          background: "rgba(15, 23, 42, 0.95)",
          backdropFilter: "blur(16px)",
          border: "1px solid rgba(255, 255, 255, 0.06)",
          borderRadius: "14px",
          boxShadow: "0 12px 40px rgba(0, 0, 0, 0.4)",
          fontFamily: "'Inter', sans-serif",
          fontSize: "13px",
          fontWeight: "500",
        }}
        progressStyle={{
          background: "linear-gradient(90deg, #06d6a0, #38bdf8)",
        }}
      />
      <Routes>
        <Route path="/" element={<Landing />} />
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
        <Route
          path="/dashboard"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </BrowserRouter>
  );
}

export default App;