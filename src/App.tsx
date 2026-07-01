import { Route, Routes } from 'react-router-dom';
import Header from './components/Header';
import MapPage from './pages/MapPage';
import StructurePage from './pages/StructurePage';
import { OrgDataProvider } from './state/OrgDataContext';

export default function App() {
  return (
    <OrgDataProvider>
      <div className="app">
        <Header />
        <main className="app__main">
          <Routes>
            <Route path="/" element={<MapPage />} />
            <Route path="/struktura" element={<StructurePage />} />
          </Routes>
        </main>
      </div>
    </OrgDataProvider>
  );
}
