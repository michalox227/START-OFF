import { useMemo, useState } from 'react';
import { CATEGORIES, CATEGORY_MAP, type CategoryId } from '../data/categories';
import type { OrgNode } from '../data/organization';
import { useOrgData, type NodeInput } from '../state/OrgDataContext';
import NodeEditDialog from '../components/NodeEditDialog';

interface CardProps {
  node: OrgNode;
  onEdit: (node: OrgNode) => void;
  onDelete: (node: OrgNode) => void;
}

function Card({ node, onEdit, onDelete }: CardProps) {
  const { structuralChildren } = useOrgData();
  const meta = CATEGORY_MAP[node.category];
  const children = structuralChildren(node.id);

  return (
    <div className="card" style={{ borderLeftColor: meta.color }}>
      <div className="card__head">
        <h3 className="card__title">{node.label}</h3>
        <div className="card__actions">
          <button className="icon-btn" onClick={() => onEdit(node)} title="Edytuj element">
            ✎
          </button>
          <button className="icon-btn icon-btn--danger" onClick={() => onDelete(node)} title="Usuń element">
            ✕
          </button>
        </div>
      </div>
      <p className="card__summary">{node.summary}</p>
      {children.length > 0 && (
        <div className="card__children">
          {children.map((c) => (
            <span key={c.id} className="tag">
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructurePage() {
  const { nodes, connectionsOf, parentIdOf, addNode, updateNode, deleteNode, resetToDefault } = useOrgData();
  const [dialog, setDialog] = useState<{ mode: 'create' | 'edit'; category?: CategoryId; node?: OrgNode } | null>(
    null,
  );

  const nodesByCategory = useMemo(() => {
    const map = new Map<CategoryId, OrgNode[]>();
    for (const c of CATEGORIES) map.set(c.id, []);
    for (const n of nodes) map.get(n.category)?.push(n);
    return map;
  }, [nodes]);

  function handleSubmit(input: NodeInput) {
    if (dialog?.mode === 'edit' && dialog.node) {
      updateNode(dialog.node.id, input);
    } else {
      addNode(input);
    }
    setDialog(null);
  }

  function handleDelete(node: OrgNode) {
    const count = connectionsOf(node.id).length;
    const warning =
      count > 0
        ? `Element „${node.label}” ma ${count} powiązań, które również zostaną usunięte. Kontynuować?`
        : `Usunąć element „${node.label}”?`;
    if (window.confirm(warning)) deleteNode(node.id);
  }

  function handleReset() {
    if (window.confirm('Przywrócić domyślną strukturę organizacji? Wszystkie Twoje zmiany zostaną utracone.')) {
      resetToDefault();
    }
  }

  return (
    <div className="structure">
      <div className="structure__inner">
        <div className="structure__intro">
          <p className="structure__lead">
            Model organizacji GO ON [OFF] SHORE w formie czytelnego konspektu. Ten sam zestaw danych zasila
            interaktywną <strong>Mapę</strong> — edytuj, dodawaj i usuwaj elementy tutaj, a zmiany od razu
            pojawią się na mapie.
          </p>
          <div className="structure__intro-actions">
            <button className="btn" onClick={() => setDialog({ mode: 'create' })}>
              + Nowy element
            </button>
            <button className="btn" onClick={handleReset}>
              Przywróć domyślne
            </button>
          </div>
        </div>

        {CATEGORIES.map((cat) => {
          const list = nodesByCategory.get(cat.id) ?? [];
          return (
            <section key={cat.id} className="section">
              <h2 className="section__heading">
                <span className="legend__dot" style={{ color: cat.color, background: cat.color }} />
                {cat.label}
              </h2>
              <p className="section__intro">{cat.description}</p>
              {list.length > 0 ? (
                <div className="card-grid">
                  {list.map((node) => (
                    <Card
                      key={node.id}
                      node={node}
                      onEdit={(n) => setDialog({ mode: 'edit', node: n })}
                      onDelete={handleDelete}
                    />
                  ))}
                </div>
              ) : (
                <p className="section__empty">Brak elementów w tej kategorii.</p>
              )}
              <button className="btn btn--inline" onClick={() => setDialog({ mode: 'create', category: cat.id })}>
                + Dodaj do „{cat.label}”
              </button>
            </section>
          );
        })}
      </div>

      {dialog && (
        <NodeEditDialog
          mode={dialog.mode}
          initialCategory={dialog.category}
          node={dialog.node}
          initialParentId={dialog.node ? parentIdOf(dialog.node.id) : null}
          allNodes={nodes}
          onSubmit={handleSubmit}
          onClose={() => setDialog(null)}
        />
      )}
    </div>
  );
}
