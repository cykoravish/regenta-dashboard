import { Route, Routes } from "react-router-dom";
import AdminDashboard from "./Components/admin/AdminDashboard";
import ProtectedRoute from "./Components/adminProtectedRoute/ProtectedRoute";
import Login from "./Components/admin/Login";

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
