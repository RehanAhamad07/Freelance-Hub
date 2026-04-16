import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { SocketProvider } from './context/SocketContext';
import { ToastContainer } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

// Components
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import CreateService from './pages/CreateService';
import ServicesListing from './pages/ServicesListing';
import ServiceDetail from './pages/ServiceDetail';
import CreateJob from './pages/CreateJob';
import JobsListing from './pages/JobsListing';
import JobDetail from './pages/JobDetail';
import Chat from './pages/Chat';
import Profile from './pages/Profile';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <SocketProvider>
          <div className="min-h-screen bg-gray-50 dark:bg-dark dark:text-white transition-colors duration-300">
            <Navbar />
            <div className="pt-16">
              <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/services" element={<ServicesListing />} />
                <Route path="/service/:id" element={<ServiceDetail />} />
                <Route path="/jobs" element={<JobsListing />} />
                <Route path="/jobs/:id" element={<JobDetail />} />
                <Route path="/profile/:id" element={<Profile />} />
                <Route path="/login" element={<Login />} />
                <Route path="/register" element={<Register />} />
                <Route path="/dashboard" element={<ProtectedRoute><Dashboard /></ProtectedRoute>} />
                <Route path="/create-service" element={<ProtectedRoute><CreateService /></ProtectedRoute>} />
                <Route path="/create-job" element={<ProtectedRoute><CreateJob /></ProtectedRoute>} />
                <Route path="/chat" element={<ProtectedRoute><Chat /></ProtectedRoute>} />
              </Routes>
            </div>
            <ToastContainer position="bottom-right" />
          </div>
        </SocketProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
