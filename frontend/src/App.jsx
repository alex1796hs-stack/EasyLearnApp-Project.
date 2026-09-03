import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import Login from './pages/login';
import Placement from "./pages/Placement"
import ProtectedRoute from './components/ProtectedRoute';
import Register from './pages/Register';
import Lessons from './pages/Lessons';
import LessonDetail from './pages/LessonDetail';
import Profile from './pages/Profile';
import SmartReview from './pages/SmartReview';
import Background from './components/Background';

function App() {
  return (
    <Router>
      <Routes>
        <Route
          path="/placement"
          element={<ProtectedRoute><Placement /></ProtectedRoute>}
        />
        <Route
          path="/dashboard"
          element={<ProtectedRoute><Dashboard /></ProtectedRoute>}
        />
        <Route
          path="/login"
          element={<Login />}
        />
        <Route
          path="/register"
          element={<Register />}
        />
        <Route
          path="/lessons"
          element={<ProtectedRoute><Lessons /></ProtectedRoute>}
        />
        <Route
          path="/lesson"
          element={<ProtectedRoute><LessonDetail /></ProtectedRoute>}
        />
        <Route
          path="/profile"
          element={<ProtectedRoute><Profile /></ProtectedRoute>}
        />
        <Route
          path="/review"
          element={<ProtectedRoute><SmartReview /></ProtectedRoute>}
        />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <div className="min-h-screen bg-gradient-to-br from-slate-900 via-blue-950 to-slate-900 flex items-center justify-center relative overflow-hidden text-white">
                <Background />
                
                <div className="relative text-center z-10 px-6">
                    <h1 className="text-5xl font-black bg-gradient-to-r from-blue-400 to-indigo-400 bg-clip-text text-transparent mb-4">
                        EasyLearn.
                    </h1>
                    <p className="text-gray-300 text-xl font-medium mb-8">Making your life easier.</p>
                    <a href="/dashboard" className="inline-block bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold px-8 py-3 rounded-xl hover:from-blue-600 hover:to-indigo-700 transition-all shadow-lg shadow-blue-500/20">
                        Ir al Dashboard
                    </a>
                </div>
              </div>
            </ProtectedRoute>
          }
        />
      </Routes>
    </Router>
  )
}

export default App
