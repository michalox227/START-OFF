// Kategorie węzłów mapy organizacji.
// Każda kategoria ma kolor (motyw ciemny, styl Obsidian), etykietę i krótki opis.
// Legenda + filtry są generowane automatycznie na podstawie tej definicji.

export type CategoryId =
  | 'rdzen' // Rdzeń CRM
  | 'ai' // Agent AI (master)
  | 'asystent' // Indywidualny asystent AI
  | 'konto' // Typ konta (użytkownik zewnętrzny)
  | 'podkonto' // Podtyp konta
  | 'dzial'; // Dział wewnętrzny

export interface CategoryMeta {
  id: CategoryId;
  label: string;
  color: string;
  description: string;
}

export const CATEGORIES: CategoryMeta[] = [
  {
    id: 'rdzen',
    label: 'Rdzeń CRM',
    color: '#a78bfa',
    description: 'Centralny system spinający całą organizację.',
  },
  {
    id: 'ai',
    label: 'Agent AI (Master)',
    color: '#22d3ee',
    description: 'Master agenci orkiestrujący pracę systemu.',
  },
  {
    id: 'asystent',
    label: 'Asystent AI (indywidualny)',
    color: '#5eead4',
    description: 'Osobisty asystent AI przy każdym koncie i dziale.',
  },
  {
    id: 'konto',
    label: 'Typ konta',
    color: '#f59e0b',
    description: 'Główne rodzaje kont użytkowników platformy.',
  },
  {
    id: 'podkonto',
    label: 'Podtyp konta',
    color: '#fcd34d',
    description: 'Warianty poszczególnych typów kont.',
  },
  {
    id: 'dzial',
    label: 'Dział wewnętrzny',
    color: '#34d399',
    description: 'Obszary naszego zespołu prowadzącego projekt.',
  },
];

export const CATEGORY_MAP: Record<CategoryId, CategoryMeta> = CATEGORIES.reduce(
  (acc, c) => {
    acc[c.id] = c;
    return acc;
  },
  {} as Record<CategoryId, CategoryMeta>,
);
