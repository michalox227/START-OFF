import { CATEGORY_MAP } from '../data/categories';
import { LINKS, NODE_MAP, type OrgNode } from '../data/organization';

interface Props {
  node: OrgNode | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

/** Zwraca wszystkie węzły połączone z danym (dowolnym rodzajem połączenia). */
function connectionsOf(id: string): OrgNode[] {
  const ids = new Set<string>();
  for (const l of LINKS) {
    if (l.source === id) ids.add(l.target);
    else if (l.target === id) ids.add(l.source);
  }
  return [...ids].map((i) => NODE_MAP[i]).filter(Boolean);
}

export default function NodeDetailPanel({ node, onSelect, onClose }: Props) {
  if (!node) {
    return (
      <section className="detail">
        <div className="detail__empty">
          <strong>Mapa organizacji Grantland</strong>
          Kliknij dowolny węzeł, aby zobaczyć szczegóły, powiązania i rolę w systemie.
          Użyj legendy po lewej, aby filtrować warstwy.
        </div>
      </section>
    );
  }

  const meta = CATEGORY_MAP[node.category];
  const connections = connectionsOf(node.id);

  return (
    <section className="detail">
      <button className="detail__close" onClick={onClose} aria-label="Zamknij">
        ✕
      </button>
      <div className="detail__head">
        <span className="detail__badge">
          <span className="legend__dot" style={{ color: meta.color, background: meta.color }} />
          {meta.label}
        </span>
        <h2 className="detail__title">{node.label}</h2>
        <p className="detail__summary">{node.summary}</p>
      </div>
      <div className="detail__body">
        {node.details && node.details.length > 0 && (
          <>
            <p className="detail__section-title">Zakres / rola</p>
            <ul className="detail__list">
              {node.details.map((d, i) => (
                <li key={i}>{d}</li>
              ))}
            </ul>
          </>
        )}

        {connections.length > 0 && (
          <>
            <p className="detail__section-title">Powiązania ({connections.length})</p>
            <div className="chip-list">
              {connections.map((c) => {
                const cm = CATEGORY_MAP[c.category];
                return (
                  <button key={c.id} className="chip" onClick={() => onSelect(c.id)}>
                    <span
                      className="legend__dot"
                      style={{ color: cm.color, background: cm.color, width: 8, height: 8 }}
                    />
                    {c.label}
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </section>
  );
}
