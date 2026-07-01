import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import type { CategoryId } from '../data/categories';
import { LINKS as DEFAULT_LINKS, NODES as DEFAULT_NODES, type OrgLink, type OrgNode } from '../data/organization';

// ---------------------------------------------------------------------------
// Edytowalny magazyn danych organizacji.
//
// Mapa i strona Struktura czytają i modyfikują TEN SAM stan (przez kontekst),
// dzięki czemu edycje elementów są od razu widoczne w obu widokach. Stan jest
// zapisywany w localStorage, więc przetrwa odświeżenie strony.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'grantland-org-data-v1';

interface StoredData {
  nodes: OrgNode[];
  links: OrgLink[];
}

function loadInitial(): StoredData {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw) as Partial<StoredData>;
      if (Array.isArray(parsed.nodes) && Array.isArray(parsed.links)) {
        return { nodes: parsed.nodes, links: parsed.links };
      }
    }
  } catch {
    /* uszkodzone dane w localStorage — wracamy do domyślnych */
  }
  return { nodes: DEFAULT_NODES, links: DEFAULT_LINKS };
}

function slugify(label: string): string {
  const base = label
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-+|-+$)/g, '');
  return base || 'element';
}

export interface NodeInput {
  label: string;
  category: CategoryId;
  level: 1 | 2 | 3;
  summary: string;
  details: string[];
  /** Id nadrzędnego elementu (połączenie strukturalne) albo null. */
  parentId: string | null;
}

interface OrgDataValue {
  nodes: OrgNode[];
  links: OrgLink[];
  nodeMap: Record<string, OrgNode>;
  parentIdOf: (id: string) => string | null;
  structuralChildren: (id: string) => OrgNode[];
  connectionsOf: (id: string) => OrgNode[];
  addNode: (input: NodeInput) => string;
  updateNode: (id: string, input: NodeInput) => void;
  deleteNode: (id: string) => void;
  resetToDefault: () => void;
}

const OrgDataContext = createContext<OrgDataValue | null>(null);

export function OrgDataProvider({ children }: { children: ReactNode }) {
  const [nodes, setNodes] = useState<OrgNode[]>(() => loadInitial().nodes);
  const [links, setLinks] = useState<OrgLink[]>(() => loadInitial().links);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify({ nodes, links }));
    } catch {
      /* quota / prywatny tryb przeglądarki — pomijamy */
    }
  }, [nodes, links]);

  const nodeMap = useMemo(() => {
    const map: Record<string, OrgNode> = {};
    for (const n of nodes) map[n.id] = n;
    return map;
  }, [nodes]);

  function parentIdOf(id: string): string | null {
    return links.find((l) => l.target === id && l.kind === 'struktura')?.source ?? null;
  }

  function structuralChildren(id: string): OrgNode[] {
    return links
      .filter((l) => l.source === id && l.kind === 'struktura')
      .map((l) => nodeMap[l.target])
      .filter(Boolean);
  }

  function connectionsOf(id: string): OrgNode[] {
    const ids = new Set<string>();
    for (const l of links) {
      if (l.source === id) ids.add(l.target);
      else if (l.target === id) ids.add(l.source);
    }
    return [...ids].map((i) => nodeMap[i]).filter(Boolean);
  }

  function uniqueId(label: string): string {
    const base = slugify(label);
    const existing = new Set(nodes.map((n) => n.id));
    let candidate = base;
    let i = 2;
    while (existing.has(candidate)) candidate = `${base}-${i++}`;
    return candidate;
  }

  function addNode(input: NodeInput): string {
    const id = uniqueId(input.label);
    const newNode: OrgNode = {
      id,
      label: input.label,
      category: input.category,
      level: input.level,
      summary: input.summary,
      details: input.details.length ? input.details : undefined,
    };
    setNodes((prev) => [...prev, newNode]);
    if (input.parentId) {
      setLinks((prev) => [...prev, { source: input.parentId as string, target: id, kind: 'struktura' }]);
    }
    return id;
  }

  function updateNode(id: string, input: NodeInput) {
    setNodes((prev) =>
      prev.map((n) =>
        n.id === id
          ? {
              ...n,
              label: input.label,
              category: input.category,
              level: input.level,
              summary: input.summary,
              details: input.details.length ? input.details : undefined,
            }
          : n,
      ),
    );
    setLinks((prev) => {
      const withoutOldParent = prev.filter((l) => !(l.target === id && l.kind === 'struktura'));
      return input.parentId
        ? [...withoutOldParent, { source: input.parentId as string, target: id, kind: 'struktura' }]
        : withoutOldParent;
    });
  }

  function deleteNode(id: string) {
    setNodes((prev) => prev.filter((n) => n.id !== id));
    setLinks((prev) => prev.filter((l) => l.source !== id && l.target !== id));
  }

  function resetToDefault() {
    setNodes(DEFAULT_NODES);
    setLinks(DEFAULT_LINKS);
  }

  const value: OrgDataValue = {
    nodes,
    links,
    nodeMap,
    parentIdOf,
    structuralChildren,
    connectionsOf,
    addNode,
    updateNode,
    deleteNode,
    resetToDefault,
  };

  return <OrgDataContext.Provider value={value}>{children}</OrgDataContext.Provider>;
}

export function useOrgData(): OrgDataValue {
  const ctx = useContext(OrgDataContext);
  if (!ctx) throw new Error('useOrgData musi być użyty wewnątrz OrgDataProvider');
  return ctx;
}
