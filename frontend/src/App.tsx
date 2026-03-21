import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Layout } from '@/components/Navigation';
import { HomePage } from '@/pages/Home';
import { LoginPage } from '@/pages/Login';
import { OnboardingPage } from '@/pages/Onboarding';
import { DreamPage } from '@/pages/Dream';
import { HistoryPage } from '@/pages/History';
import { ProfilePage } from '@/pages/Profile';

function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<HomePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/onboarding" element={<OnboardingPage />} />
          <Route path="/dream" element={<DreamPage />} />
          <Route path="/history" element={<HistoryPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  );
}

export default App;
