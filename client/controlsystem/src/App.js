import { BrowserRouter as Router, Route, Routes } from 'react-router-dom';
import {AuthProvider} from './context/AuthContext';
import LoginPage from './pages/LoginPage';

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          <Route path="/" element={<div>Home Page</div>} />
          <Route path="/login" element={<LoginPage />} />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
