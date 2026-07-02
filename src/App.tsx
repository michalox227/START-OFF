import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import LoginScreen from './components/LoginScreen';
import KnowledgeBaseDetailPage from './pages/KnowledgeBaseDetailPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import MapPage from './pages/MapPage';
import StructurePage from './pages/StructurePage';
import { AuthProvider, useAuth } from './state/AuthContext';
import { KnowledgeBaseProvider } from './state/KnowledgeBaseContext';
import { OrgDataProvider } from './state/OrgDataContext';

function Platform() {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) return <LoginScreen />;

  return (
    <OrgDataProvider>
      <KnowledgeBaseProvider>
        <div className="app">
          <Header />
          <main className="app__main">
            <Routes>
              <Route path="/" element={<MapPage />} />
              <Route path="/struktura" element={<StructurePage />} />
              <Route path="/baza-wiedzy" element={<KnowledgeBasePage />} />
              <Route path="/baza-wiedzy/:baseId" element={<KnowledgeBaseDetailPage />} />
              <Route path="/baza-wiedzy/:baseId/:entryId" element={<KnowledgeBaseDetailPage />} />
            </Routes>
          </main>
        </div>
      </KnowledgeBaseProvider>
    </OrgDataProvider>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <Platform />
    </AuthProvider>
  );
}
