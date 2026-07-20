import { Routes, Route } from 'react-router-dom';
import Login from './components/Login';
import Signup from './components/Signup';
import Dashboard from './components/Dashboard';
import ImageUpload from './components/ImageUpload';
import Results from './components/Results';
import History from './components/History';
import DiseaseInfo from './components/DiseaseInfo';
import Home from './components/Home';

function App() {
  return (
    <Routes>
      <Route path="/" element={<Dashboard />} />
      <Route path="/home" element={<Home />} />
      <Route path="/dashboard" element={<Dashboard />} />
      <Route path="/login" element={<Login />} />
      <Route path="/signup" element={<Signup />} />
      <Route path="/upload" element={<ImageUpload />} />
      <Route path="/history" element={<History />} />
      <Route path="/disease/:name" element={<DiseaseInfo />} />
      <Route path="/results" element={<Results />} />
    </Routes>
  );
}

export default App;