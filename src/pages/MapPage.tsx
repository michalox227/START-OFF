import { useCallback, useState } from 'react';
import GraphControls from '../components/GraphControls';
import Legend from '../components/Legend';
import NodeDetailPanel from '../components/NodeDetailPanel';
import OrgGraph from '../components/OrgGraph';
import OrgHierarchy from '../components/OrgHierarchy';
import { CATEGORIES, type CategoryId } from '../data/categories';
import { usePersistentState } from '../hooks/usePersistentState';
import { useOrgData } from '../state/OrgDataContext';

type MapView = 'graf' | 'hierarchia';

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

export default function MapPage() {
  const { nodeMap, parentIdOf } = useOrgData();
  const [active, setActive] = useState<Set<CategoryId>>(new Set(ALL_CATEGORIES));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());
  const [fitSignal, setFitSignal] = useState(0);
  const [distanceLevel, setDistanceLevel] = usePersistentState('grantland-graph-distance', 3);
  const [labelLevel, setLabelLevel] = usePersistentState('grantland-graph-label', 3);
  const [view, setView] = usePersistentState<MapView>('grantland-map-view', 'graf');

  const toggleExpand = useCallback((id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }, []);

  // Wybór węzła (np. z panelu szczegółów) rozwija jego przodków, aby element
  // funkcyjny był widoczny na mapie.
  const handleSelect = useCallback(
    (id: string | null) => {
      setSelectedId(id);
      if (!id) return;
      setExpandedIds((prev) => {
        const next = new Set(prev);
        let parent = parentIdOf(id);
        let depth = 0;
        while (parent && depth++ < 24) {
          next.add(parent);
          parent = parentIdOf(parent);
        }
        return next.size === prev.size ? prev : next;
      });
    },
    [parentIdOf],
  );

  const toggle = useCallback((id: CategoryId) => {
    setActive((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      // Nie pozwól ukryć wszystkiego naraz.
      return next.size === 0 ? prev : next;
    });
  }, []);

  const showAll = useCallback(() => setActive(new Set(ALL_CATEGORIES)), []);
  const fit = useCallback(() => setFitSignal((n) => n + 1), []);

  const selectedNode = selectedId ? nodeMap[selectedId] ?? null : null;

  return (
    <div className="map">
      {view === 'graf' ? (
        <OrgGraph
          activeCategories={active}
          selectedId={selectedId}
          onSelect={handleSelect}
          expandedIds={expandedIds}
          onToggleExpand={toggleExpand}
          fitSignal={fitSignal}
          distanceLevel={distanceLevel}
          labelLevel={labelLevel}
        />
      ) : (
        <OrgHierarchy selectedId={selectedId} onSelect={handleSelect} />
      )}
      {view === 'graf' && <Legend active={active} onToggle={toggle} onAll={showAll} onFit={fit} />}
      <div className="view-switch">
        <button
          className={`view-switch__btn${view === 'graf' ? ' view-switch__btn--on' : ''}`}
          onClick={() => setView('graf')}
        >
          Graf
        </button>
        <button
          className={`view-switch__btn${view === 'hierarchia' ? ' view-switch__btn--on' : ''}`}
          onClick={() => setView('hierarchia')}
        >
          Hierarchia
        </button>
      </div>
      <div className="map__right-rail">
        {view === 'graf' && (
          <GraphControls
            distanceLevel={distanceLevel}
            labelLevel={labelLevel}
            onDistanceChange={setDistanceLevel}
            onLabelChange={setLabelLevel}
          />
        )}
        <NodeDetailPanel
          node={selectedNode}
          onSelect={handleSelect}
          onClose={() => setSelectedId(null)}
          fullNote={view === 'hierarchia'}
        />
      </div>
      <div className="map__hint">
        {view === 'graf'
          ? 'Przeciągaj, aby przesuwać · scroll = zoom · kliknij konto (+N), aby rozwinąć jego funkcje · kliknij węzeł, aby zobaczyć szczegóły'
          : 'Kliknij element, aby zobaczyć pełny opis z bazy wiedzy po prawej · ▸ rozwija przypisane elementy'}
      </div>
    </div>
  );
}
