import { useCallback, useState } from 'react';
import GraphControls from '../components/GraphControls';
import Legend from '../components/Legend';
import NodeDetailPanel from '../components/NodeDetailPanel';
import OrgGraph from '../components/OrgGraph';
import { CATEGORIES, type CategoryId } from '../data/categories';
import { usePersistentState } from '../hooks/usePersistentState';
import { useOrgData } from '../state/OrgDataContext';

const ALL_CATEGORIES = new Set<CategoryId>(CATEGORIES.map((c) => c.id));

export default function MapPage() {
  const { nodeMap } = useOrgData();
  const [active, setActive] = useState<Set<CategoryId>>(new Set(ALL_CATEGORIES));
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [fitSignal, setFitSignal] = useState(0);
  const [distanceLevel, setDistanceLevel] = usePersistentState('grantland-graph-distance', 3);
  const [labelLevel, setLabelLevel] = usePersistentState('grantland-graph-label', 3);

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
      <OrgGraph
        activeCategories={active}
        selectedId={selectedId}
        onSelect={setSelectedId}
        fitSignal={fitSignal}
        distanceLevel={distanceLevel}
        labelLevel={labelLevel}
      />
      <Legend active={active} onToggle={toggle} onAll={showAll} onFit={fit} />
      <div className="map__right-rail">
        <GraphControls
          distanceLevel={distanceLevel}
          labelLevel={labelLevel}
          onDistanceChange={setDistanceLevel}
          onLabelChange={setLabelLevel}
        />
        <NodeDetailPanel
          node={selectedNode}
          onSelect={setSelectedId}
          onClose={() => setSelectedId(null)}
        />
      </div>
      <div className="map__hint">
        Przeciągaj, aby przesuwać · scroll = zoom · kliknij węzeł, aby zobaczyć szczegóły
      </div>
    </div>
  );
}
