import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import KnowledgeBaseDetailPage from './pages/KnowledgeBaseDetailPage';
import KnowledgeBasePage from './pages/KnowledgeBasePage';
import MapPage from './pages/MapPage';
import StructurePage from './pages/StructurePage';
import { KnowledgeBaseProvider } from './state/KnowledgeBaseContext';
import { OrgDataProvider } from './state/OrgDataContext';

export default function App() {
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
