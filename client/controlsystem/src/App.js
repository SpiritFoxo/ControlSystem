import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import AdminPage from './pages/AdminPage';
import ProjectPage from './pages/ProjectPage';
import DefectPage from './pages/DefectPage';
import ProtectedRoute from './components/ProtectedRoute';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/login" element={<LoginPage />} />
          <Route path='/' element={<ProtectedRoute><ProjectsPage /></ProtectedRoute>} />
          <Route path='/project' element={<ProtectedRoute><ProjectPage /></ProtectedRoute>} />
          <Route path='/admin' element={<ProtectedRoute><AdminPage /></ProtectedRoute>} />
          <Route path='/defect' element={<ProtectedRoute><DefectPage /></ProtectedRoute>} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
