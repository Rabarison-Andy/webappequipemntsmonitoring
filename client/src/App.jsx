import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import PageLogin from './pages/PageLogin';
import PageMonitoring from './pages/PageMonitoring';
import PageStatistics from './pages/PageStatistics';
import PageMaintenance from './pages/PageMaintenance';
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<PageMonitoring />} />
        <Route path="/stats" element={<PageStatistics />} />
        <Route path="/maintenance" element={<PageMaintenance />} />
      </Routes>
    </Router>
  );
}

export default App;
