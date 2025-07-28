import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./components/admin/AdminDashboard";
import ProtectedRoute from "./components/adminProtectedRoute/ProtectedRoute";
import Login from "./components/admin/Login";

function App() {
  return (
    <>
      <Routes>
        <Route path="/" element={<Login />} />
        <Route
          path="/admin/dashboard"
          element={
            <ProtectedRoute>
              <AdminDashboard />
            </ProtectedRoute>
          }
        />
      </Routes>
    </>
  );
}

export default App;
