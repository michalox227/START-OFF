import { useEffect, useMemo, useState } from 'react';
import { CATEGORY_MAP, type CategoryId } from '../data/categories';
import type { OrgNode } from '../data/organization';
import { useOrgData } from '../state/OrgDataContext';

// ---------------------------------------------------------------------------
// Widok hierarchii: struktura organizacji od góry do dołu.
// Na górze CRM, niżej typy kont / organizacja / master agent, a pod nimi
// przypisane do nich elementy (podkonta, działy, asystenci, funkcje…).
// Kliknięcie wiersza wybiera element — pełny opis pojawia się w prawym pasku.
// ---------------------------------------------------------------------------

interface Props {
  selectedId: string | null;
  onSelect: (id: string | null) => void;
}

// Kolejność kategorii w obrębie jednego poziomu (od najważniejszych).
const CATEGORY_ORDER: Record<CategoryId, number> = {
  rdzen: 0,
  konto: 1,
  dzial: 2,
  ai: 3,
  podkonto: 4,
  asystent: 5,
  funkcja: 6,
};

export default function OrgHierarchy({ selectedId, onSelect }: Props) {
  const { nodes, links, nodeMap } = useOrgData();

  const { roots, childrenOf, parentOf } = useMemo(() => {
    const structParent = new Map<string, string>();
    for (const l of links) if (l.kind === 'struktura') structParent.set(l.target, l.source);

    // Hierarchia AI: podwładni master agentów (źródła połączeń AI wskazujących
    // na agenta). Rdzeń (CRM) nigdy nie jest podwładnym swojego agenta.
    const aiChildren = new Map<string, string[]>();
    const aiParent = new Map<string, string>();
    for (const l of links) {
      if (l.kind !== 'ai') continue;
      const child = nodeMap[l.source];
      const parent = nodeMap[l.target];
      if (!child || !parent || child.category === 'rdzen') continue;
      // Tylko elementy bez rodzica strukturalnego podpinamy pod agenta,
      // aby uniknąć duplikatów (asystenci mają już miejsce w strukturze).
      if (structParent.has(child.id)) continue;
      aiChildren.set(parent.id, [...(aiChildren.get(parent.id) ?? []), child.id]);
      aiParent.set(child.id, parent.id);
    }

    const sortIds = (ids: string[]) =>
      [...ids].sort(
        (a, b) =>
          (CATEGORY_ORDER[nodeMap[a]?.category ?? 'funkcja'] ?? 9) -
          (CATEGORY_ORDER[nodeMap[b]?.category ?? 'funkcja'] ?? 9),
      );

    const childrenOf = (id: string): OrgNode[] => {
      const struct = links.filter((l) => l.kind === 'struktura' && l.source === id).map((l) => l.target);
      const ai = aiChildren.get(id) ?? [];
      return sortIds([...struct, ...ai])
        .map((cid) => nodeMap[cid])
        .filter(Boolean);
    };

    const parentOf = (id: string): string | null => structParent.get(id) ?? aiParent.get(id) ?? null;

    const roots = sortIds(
      nodes.filter((n) => !structParent.has(n.id) && !aiParent.has(n.id)).map((n) => n.id),
    )
      .map((id) => nodeMap[id])
      .filter(Boolean);

    return { roots, childrenOf, parentOf };
  }, [nodes, links, nodeMap]);

  // Rozwinięcia: domyślnie otwarty najwyższy poziom (CRM i pozostałe korzenie).
  const [expanded, setExpanded] = useState<Set<string>>(() => new Set(roots.map((r) => r.id)));

  // Wybór z zewnątrz (np. chip w panelu) rozwija przodków wybranego elementu.
  useEffect(() => {
    if (!selectedId) return;
    setExpanded((prev) => {
      const next = new Set(prev);
      let parent = parentOf(selectedId);
      let depth = 0;
      while (parent && depth++ < 24) {
        next.add(parent);
        parent = parentOf(parent);
      }
      return next.size === prev.size ? prev : next;
    });
  }, [selectedId, parentOf]);

  function toggle(id: string) {
    setExpanded((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  }

  function renderNode(node: OrgNode, depth: number) {
    const children = childrenOf(node.id);
    const isOpen = expanded.has(node.id);
    const meta = CATEGORY_MAP[node.category];
    return (
      <div key={node.id}>
        <button
          className={`hier-row${selectedId === node.id ? ' hier-row--selected' : ''}${
            node.category === 'funkcja' ? ' hier-row--fn' : ''
          }`}
          style={{ paddingLeft: 14 + depth * 22 }}
          onClick={() => {
            onSelect(node.id);
            if (children.length > 0 && !isOpen) toggle(node.id);
          }}
        >
          {children.length > 0 ? (
            <span
              className={`hier-row__chevron${isOpen ? ' hier-row__chevron--open' : ''}`}
              onClick={(e) => {
                e.stopPropagation();
                toggle(node.id);
              }}
            >
              ▸
            </span>
          ) : (
            <span className="hier-row__chevron hier-row__chevron--none" />
          )}
          <span className="legend__dot" style={{ color: meta.color, background: meta.color }} />
          <span className="hier-row__label">{node.label}</span>
          {children.length > 0 && <span className="hier-row__count">{children.length}</span>}
        </button>
        {isOpen && children.map((c) => renderNode(c, depth + 1))}
      </div>
    );
  }

  return (
    <div className="hier">
      <div className="hier__toolbar">
        <span className="hier__title">Hierarchia organizacji · od góry do dołu</span>
        <button
          className="btn"
          onClick={() => setExpanded(new Set(nodes.filter((n) => n.category !== 'funkcja').map((n) => n.id)))}
        >
          Rozwiń strukturę
        </button>
        <button className="btn" onClick={() => setExpanded(new Set(roots.map((r) => r.id)))}>
          Zwiń wszystko
        </button>
      </div>
      <div className="hier__list">{roots.map((r) => renderNode(r, 0))}</div>
    </div>
  );
}
