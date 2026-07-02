import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react';
import { DEFAULT_BASES, type KbBase, type KbCategory, type KbEntry } from '../data/knowledgeBase';

// ---------------------------------------------------------------------------
// Edytowalny magazyn baz wiedzy (Context + localStorage).
//
// Analogicznie do OrgDataContext: strony czytają i modyfikują ten sam stan,
// a zmiany przetrwają odświeżenie strony. „Przywróć domyślne” resetuje dane
// do seeda z src/data/knowledgeBase.ts.
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'grantland-kb-v1';
const VERSION_KEY = 'grantland-kb-data-version';
// Podbij po każdej aktualizacji domyślnych notatek (np. synchronizacji z wiki),
// aby zapisane dane użytkowników dostały nową treść bez utraty ich własnych wpisów.
const DATA_VERSION = '2-wiki';

/**
 * Odświeża domyślne bazy do bieżącej wersji: domyślne bazy/kategorie/wpisy są
 * podmieniane na nowe, a dodane przez użytkownika — zachowywane.
 */
function migrate(stored: KbBase[]): KbBase[] {
  const defaults = new Map(DEFAULT_BASES.map((b) => [b.id, b]));
  const result: KbBase[] = DEFAULT_BASES.map((b) => ({
    ...b,
    categories: b.categories.map((c) => ({ ...c, entries: [...c.entries] })),
  }));
  for (const base of stored) {
    const target = result.find((b) => b.id === base.id);
    if (!defaults.has(base.id) || !target) {
      result.push(base);
      continue;
    }
    for (const category of base.categories) {
      const targetCat = target.categories.find((c) => c.id === category.id);
      if (!targetCat) {
        target.categories.push(category);
        continue;
      }
      for (const entry of category.entries) {
        if (!targetCat.entries.some((e) => e.id === entry.id)) targetCat.entries.push(entry);
      }
    }
  }
  return result;
}

function loadInitial(): KbBase[] {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        const bases = parsed as KbBase[];
        return localStorage.getItem(VERSION_KEY) === DATA_VERSION ? bases : migrate(bases);
      }
    }
  } catch {
    /* uszkodzone dane w localStorage — wracamy do domyślnych */
  }
  return DEFAULT_BASES;
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

function uniqueId(label: string, existing: Set<string>): string {
  const base = slugify(label);
  let candidate = base;
  let i = 2;
  while (existing.has(candidate)) candidate = `${base}-${i++}`;
  return candidate;
}

export interface KbBaseInput {
  name: string;
  description: string;
}

export interface KbCategoryInput {
  title: string;
  description: string;
  parentNodeId: string | null;
}

export interface KbEntryInput {
  title: string;
  short: string;
  status: string;
  note: string;
  summary: string[];
  nodeId: string | null;
}

export interface KbEntryRef {
  base: KbBase;
  category: KbCategory;
  entry: KbEntry;
}

interface KnowledgeBaseValue {
  bases: KbBase[];
  baseMap: Record<string, KbBase>;
  addBase: (input: KbBaseInput) => string;
  updateBase: (baseId: string, input: KbBaseInput) => void;
  deleteBase: (baseId: string) => void;
  addCategory: (baseId: string, input: KbCategoryInput) => string;
  updateCategory: (baseId: string, categoryId: string, input: KbCategoryInput) => void;
  deleteCategory: (baseId: string, categoryId: string) => void;
  addEntry: (baseId: string, categoryId: string, input: KbEntryInput) => string;
  updateEntry: (baseId: string, categoryId: string, entryId: string, patch: Partial<KbEntry>) => void;
  deleteEntry: (baseId: string, categoryId: string, entryId: string) => void;
  findEntryByNode: (nodeId: string) => KbEntryRef | null;
  resetToDefault: () => void;
}

const KnowledgeBaseContext = createContext<KnowledgeBaseValue | null>(null);

export function KnowledgeBaseProvider({ children }: { children: ReactNode }) {
  const [bases, setBases] = useState<KbBase[]>(loadInitial);

  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(bases));
      localStorage.setItem(VERSION_KEY, DATA_VERSION);
    } catch {
      /* quota / prywatny tryb przeglądarki — pomijamy */
    }
  }, [bases]);

  const baseMap = useMemo(() => {
    const map: Record<string, KbBase> = {};
    for (const b of bases) map[b.id] = b;
    return map;
  }, [bases]);

  function addBase(input: KbBaseInput): string {
    const id = uniqueId(input.name, new Set(bases.map((b) => b.id)));
    setBases((prev) => [...prev, { id, name: input.name, description: input.description, categories: [] }]);
    return id;
  }

  function updateBase(baseId: string, input: KbBaseInput) {
    setBases((prev) =>
      prev.map((b) => (b.id === baseId ? { ...b, name: input.name, description: input.description } : b)),
    );
  }

  function deleteBase(baseId: string) {
    setBases((prev) => prev.filter((b) => b.id !== baseId));
  }

  function addCategory(baseId: string, input: KbCategoryInput): string {
    const base = baseMap[baseId];
    const existing = new Set(base ? base.categories.map((c) => c.id) : []);
    const id = uniqueId(input.title, existing);
    setBases((prev) =>
      prev.map((b) =>
        b.id === baseId
          ? { ...b, categories: [...b.categories, { id, ...input, entries: [] }] }
          : b,
      ),
    );
    return id;
  }

  function updateCategory(baseId: string, categoryId: string, input: KbCategoryInput) {
    setBases((prev) =>
      prev.map((b) =>
        b.id === baseId
          ? {
              ...b,
              categories: b.categories.map((c) => (c.id === categoryId ? { ...c, ...input } : c)),
            }
          : b,
      ),
    );
  }

  function deleteCategory(baseId: string, categoryId: string) {
    setBases((prev) =>
      prev.map((b) =>
        b.id === baseId ? { ...b, categories: b.categories.filter((c) => c.id !== categoryId) } : b,
      ),
    );
  }

  function addEntry(baseId: string, categoryId: string, input: KbEntryInput): string {
    const base = baseMap[baseId];
    const existing = new Set<string>();
    if (base) for (const c of base.categories) for (const e of c.entries) existing.add(e.id);
    const id = uniqueId(input.title, existing);
    setBases((prev) =>
      prev.map((b) =>
        b.id === baseId
          ? {
              ...b,
              categories: b.categories.map((c) =>
                c.id === categoryId ? { ...c, entries: [...c.entries, { id, ...input }] } : c,
              ),
            }
          : b,
      ),
    );
    return id;
  }

  function updateEntry(baseId: string, categoryId: string, entryId: string, patch: Partial<KbEntry>) {
    setBases((prev) =>
      prev.map((b) =>
        b.id === baseId
          ? {
              ...b,
              categories: b.categories.map((c) =>
                c.id === categoryId
                  ? {
                      ...c,
                      entries: c.entries.map((e) => (e.id === entryId ? { ...e, ...patch, id: e.id } : e)),
                    }
                  : c,
              ),
            }
          : b,
      ),
    );
  }

  function deleteEntry(baseId: string, categoryId: string, entryId: string) {
    setBases((prev) =>
      prev.map((b) =>
        b.id === baseId
          ? {
              ...b,
              categories: b.categories.map((c) =>
                c.id === categoryId ? { ...c, entries: c.entries.filter((e) => e.id !== entryId) } : c,
              ),
            }
          : b,
      ),
    );
  }

  function findEntryByNode(nodeId: string): KbEntryRef | null {
    for (const base of bases) {
      for (const category of base.categories) {
        const entry = category.entries.find((e) => e.nodeId === nodeId);
        if (entry) return { base, category, entry };
      }
    }
    return null;
  }

  function resetToDefault() {
    setBases(DEFAULT_BASES);
  }

  const value: KnowledgeBaseValue = {
    bases,
    baseMap,
    addBase,
    updateBase,
    deleteBase,
    addCategory,
    updateCategory,
    deleteCategory,
    addEntry,
    updateEntry,
    deleteEntry,
    findEntryByNode,
    resetToDefault,
  };

  return <KnowledgeBaseContext.Provider value={value}>{children}</KnowledgeBaseContext.Provider>;
}

export function useKnowledgeBase(): KnowledgeBaseValue {
  const ctx = useContext(KnowledgeBaseContext);
  if (!ctx) throw new Error('useKnowledgeBase musi być użyty wewnątrz KnowledgeBaseProvider');
  return ctx;
}
