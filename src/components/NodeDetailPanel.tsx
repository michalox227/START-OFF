import { useState } from 'react';
import { CATEGORY_MAP } from '../data/categories';
import type { OrgNode } from '../data/organization';
import { useOrgData, type NodeInput } from '../state/OrgDataContext';
import NodeEditDialog from './NodeEditDialog';

interface Props {
  node: OrgNode | null;
  onSelect: (id: string) => void;
  onClose: () => void;
}

export default function NodeDetailPanel({ node, onSelect, onClose }: Props) {
  const { nodes, connectionsOf, parentIdOf, updateNode, deleteNode } = useOrgData();
  const [editing, setEditing] = useState(false);

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

  function handleSave(input: NodeInput) {
    updateNode(node!.id, input);
    setEditing(false);
  }

  function handleDelete() {
    const count = connections.length;
    const warning =
      count > 0
        ? `Element „${node!.label}” ma ${count} powiązań, które również zostaną usunięte. Kontynuować?`
        : `Usunąć element „${node!.label}”?`;
    if (window.confirm(warning)) {
      deleteNode(node!.id);
      onClose();
    }
  }

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
        <div className="detail__edit-actions">
          <button className="icon-btn" onClick={() => setEditing(true)} title="Edytuj element">
            ✎ Edytuj
          </button>
          <button className="icon-btn icon-btn--danger" onClick={handleDelete} title="Usuń element">
            ✕ Usuń
          </button>
        </div>
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

      {editing && (
        <NodeEditDialog
          mode="edit"
          node={node}
          initialParentId={parentIdOf(node.id)}
          allNodes={nodes}
          onSubmit={handleSave}
          onClose={() => setEditing(false)}
        />
      )}
    </section>
  );
}
