import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import LoginPage from './pages/LoginPage';
import ProjectsPage from './pages/ProjectsPage';
import AdminPage from './pages/AdminPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<LoginPage />} />
          <Route path='/projects' element={<ProjectsPage />} />
          <Route path='/admin' element={<AdminPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
