import { HashRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from './components/layout/Layout';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import AddStudent from './pages/AddStudent';
import StudentDetails from './pages/StudentDetails';
import Parents from './pages/Parents';
import Attendance from './pages/Attendance';
import Teachers from './pages/Teachers';
import AddTeacher from './pages/AddTeacher';
import TeacherDetails from './pages/TeacherDetails';
import TeacherAttendance from './pages/TeacherAttendance';
import Revenue from './pages/Revenue';
import Classes from './pages/Classes';
import Settings from './pages/Settings';
import Setup from './pages/Setup';
import Login from './pages/Login';
import Register from './pages/Register';
import ForgotPassword from './pages/ForgotPassword';
import { AuthProvider, useAuth } from './context/AuthContext';
import { NotificationProvider } from './context/NotificationContext';

function PrivateRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isDeviceTrusted, isSetupComplete, initLoading } = useAuth();

  if (initLoading) return <div className="min-h-screen flex items-center justify-center">Loading...</div>;

  if (!isDeviceTrusted) {
    return <Navigate to="/setup" replace />;
  }

  if (!isSetupComplete) {
    return <Navigate to="/register" replace />;
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return <>{children}</>;
}

function App() {
  return (
    <AuthProvider>
      <NotificationProvider>
        <HashRouter>
          <Routes>
            <Route path="/setup" element={<Setup />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="/forgot-password" element={<ForgotPassword />} />

            <Route path="/" element={
              <PrivateRoute>
                <Layout />
              </PrivateRoute>
            }>
              <Route index element={<Dashboard />} />
              <Route path="students" element={<Students />} />
              <Route path="students/add" element={<AddStudent />} />
              <Route path="students/edit/:id" element={<AddStudent />} />
              <Route path="students/view/:id" element={<StudentDetails />} />
              <Route path="parents" element={<Parents />} />
              <Route path="attendance" element={<Attendance />} />
              <Route path="teachers" element={<Teachers />} />
              <Route path="teachers/add" element={<AddTeacher />} />
              <Route path="teachers/edit/:id" element={<AddTeacher />} />
              <Route path="teachers/view/:id" element={<TeacherDetails />} />
              <Route path="teachers/attendance" element={<TeacherAttendance />} />
              <Route path="revenue" element={<Revenue />} />
              <Route path="classes" element={<Classes />} />
              <Route path="settings" element={<Settings />} /> {/* New Settings Route */}
              <Route path="*" element={<Navigate to="/" replace />} />
            </Route>
          </Routes>
        </HashRouter>
      </NotificationProvider>
    </AuthProvider>
  );
}

export default App;
