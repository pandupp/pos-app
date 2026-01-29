import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import Login from '@/pages/Login';

function App() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Redirect root ke login sementara */}
        <Route path="/" element={<Navigate to="/login" replace />} />
        
        <Route path="/login" element={<Login />} />
        
        {/* ruter dash */}
      </Routes>
    </BrowserRouter>
  );
}

export default App;