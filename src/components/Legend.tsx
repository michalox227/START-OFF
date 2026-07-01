import { useMemo } from 'react';
import { CATEGORIES, type CategoryId } from '../data/categories';
import { useOrgData } from '../state/OrgDataContext';

interface Props {
  active: Set<CategoryId>;
  onToggle: (id: CategoryId) => void;
  onAll: () => void;
  onFit: () => void;
}

export default function Legend({ active, onToggle, onAll, onFit }: Props) {
  const { nodes } = useOrgData();

  const counts = useMemo(
    () =>
      nodes.reduce(
        (acc, n) => {
          acc[n.category] = (acc[n.category] ?? 0) + 1;
          return acc;
        },
        {} as Record<string, number>,
      ),
    [nodes],
  );

  return (
    <aside className="legend">
      <p className="legend__title">Warstwy · filtr</p>
      {CATEGORIES.map((c) => {
        const on = active.has(c.id);
        return (
          <button
            key={c.id}
            className={`legend__item${on ? '' : ' legend__item--off'}`}
            onClick={() => onToggle(c.id)}
            title={on ? 'Kliknij, aby ukryć' : 'Kliknij, aby pokazać'}
          >
            <span className="legend__dot" style={{ color: c.color, background: c.color }} />
            <span>
              <span className="legend__label">{c.label}</span>
              <br />
              <span className="legend__desc">{c.description}</span>
            </span>
            <span className="legend__count">{counts[c.id] ?? 0}</span>
          </button>
        );
      })}
      <div className="legend__actions">
        <button className="btn" onClick={onAll}>
          Pokaż wszystko
        </button>
        <button className="btn" onClick={onFit}>
          Dopasuj widok
        </button>
      </div>
    </aside>
  );
}
