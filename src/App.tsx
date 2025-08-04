import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AppLayout } from './components';
import { Dashboard, CreateJob, Jobs, Results, Health } from './pages';

function App() {
  return (
    <Router>
      <AppLayout>
        <Routes>
          <Route path="/" element={<Dashboard />} />
          <Route path="/create" element={<CreateJob />} />
          <Route path="/jobs" element={<Jobs />} />
          <Route path="/results" element={<Results />} />
          <Route path="/health" element={<Health />} />
        </Routes>
      </AppLayout>
    </Router>
  );
}

export default App;
