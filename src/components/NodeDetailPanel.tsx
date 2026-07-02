import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CATEGORY_MAP } from '../data/categories';
import { findFunctionFragment, functionIdPrefix } from '../data/functions';
import type { OrgNode } from '../data/organization';
import { useKnowledgeBase } from '../state/KnowledgeBaseContext';
import { useOrgData, type NodeInput } from '../state/OrgDataContext';
import MarkdownLite from './MarkdownLite';
import NodeEditDialog from './NodeEditDialog';

interface Props {
  node: OrgNode | null;
  onSelect: (id: string) => void;
  onClose: () => void;
  /** Otwiera sekcję pełnego opisu z bazy wiedzy od razu (widok hierarchii). */
  fullNote?: boolean;
}

export default function NodeDetailPanel({ node, onSelect, onClose, fullNote = false }: Props) {
  const { nodes, connectionsOf, parentIdOf, structuralChildren, updateNode, deleteNode } =
    useOrgData();
  const { findEntryByNode } = useKnowledgeBase();
  const [editing, setEditing] = useState(false);

  if (!node) {
    return (
      <section className="detail">
        <div className="detail__empty">
          <strong>Mapa organizacji GO ON [OFF] SHORE</strong>
          Kliknij dowolny węzeł, aby zobaczyć szczegóły, powiązania i rolę w systemie.
          Użyj legendy po lewej, aby filtrować warstwy.
        </div>
      </section>
    );
  }

  const meta = CATEGORY_MAP[node.category];
  const connections = connectionsOf(node.id);
  const fnChildren = structuralChildren(node.id).filter((c) => c.category === 'funkcja');
  const fnChildIds = new Set(fnChildren.map((c) => c.id));
  const otherConnections = connections.filter((c) => !fnChildIds.has(c.id));

  // Wpis bazy wiedzy: bezpośredni albo odziedziczony po koncie nadrzędnym
  // (elementy funkcyjne prowadzą do pełnej notatki swojego konta).
  let kbRef = findEntryByNode(node.id);
  for (let id = parentIdOf(node.id), depth = 0; !kbRef && id && depth < 24; depth++) {
    kbRef = findEntryByNode(id);
    id = parentIdOf(id);
  }

  // Pełny opis z bazy: cała notatka dla elementu z wpisem, a dla elementu
  // funkcyjnego — dokładnie ten fragment notatki, z którego powstał.
  let noteMarkdown: string | null = null;
  if (kbRef?.entry.note) {
    if (node.category === 'funkcja' && kbRef.entry.nodeId && node.id.startsWith(functionIdPrefix(kbRef.entry.nodeId))) {
      noteMarkdown = findFunctionFragment(kbRef.entry.note, kbRef.entry.nodeId, node.id);
    } else if (kbRef.entry.nodeId === node.id) {
      noteMarkdown = kbRef.entry.note;
    }
  }

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

        {fnChildren.length > 0 && (
          <>
            <p className="detail__section-title">Elementy funkcyjne ({fnChildren.length})</p>
            <div className="chip-list chip-list--fn" style={{ marginBottom: 22 }}>
              {fnChildren.map((c, i) => (
                <button key={c.id} className="chip chip--fn" onClick={() => onSelect(c.id)}>
                  <span className="chip__num">{i + 1}</span>
                  {c.label}
                </button>
              ))}
            </div>
          </>
        )}

        {kbRef && (
          <>
            <p className="detail__section-title">Baza wiedzy</p>
            <div className="chip-list" style={{ marginBottom: 22 }}>
              <Link className="chip" to={`/baza-wiedzy/${kbRef.base.id}/${kbRef.entry.id}`}>
                📚 {kbRef.entry.title}
              </Link>
            </div>
          </>
        )}

        {noteMarkdown && (
          <details className="detail__fullnote" key={`${node.id}-${fullNote}`} open={fullNote}>
            <summary>
              Pełny opis z bazy wiedzy
              {node.category === 'funkcja' ? ' (fragment notatki)' : ' (cała notatka)'}
            </summary>
            <MarkdownLite text={noteMarkdown} />
          </details>
        )}

        {otherConnections.length > 0 && (
          <>
            <p className="detail__section-title">Powiązania ({otherConnections.length})</p>
            <div className="chip-list">
              {otherConnections.map((c) => {
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
