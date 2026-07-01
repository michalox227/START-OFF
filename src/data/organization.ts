import type { CategoryId } from './categories';

// ---------------------------------------------------------------------------
// MODEL DANYCH ORGANIZACJI GRANTLAND
// ---------------------------------------------------------------------------
// To jest jedyne źródło prawdy dla całej wizualizacji.
// - Mapa organizacji (graf w stylu Obsidian) buduje się z `NODES` i `LINKS`.
// - Strona "Struktura" (czytelny konspekt) korzysta z tych samych danych.
//
// Dzięki temu model można łatwo rozbudowywać oraz importować / reużywać
// w innych repozytoriach (wystarczy zaimportować `NODES`, `LINKS`).
// ---------------------------------------------------------------------------

export type LinkKind = 'struktura' | 'ai';

export interface OrgNode {
  id: string;
  label: string;
  category: CategoryId;
  /** Rozmiar / waga węzła: 1 = mały, 2 = średni, 3 = kluczowy. */
  level: 1 | 2 | 3;
  /** Jedno zdanie widoczne w nagłówku panelu szczegółów. */
  summary: string;
  /** Punkty rozwijane w panelu szczegółów. */
  details?: string[];
}

export interface OrgLink {
  source: string;
  target: string;
  kind: LinkKind;
}

// ---------------------------------------------------------------------------
// WĘZŁY
// ---------------------------------------------------------------------------

export const NODES: OrgNode[] = [
  // --- Rdzeń -------------------------------------------------------------
  {
    id: 'crm',
    label: 'Główny CRM',
    category: 'rdzen',
    level: 3,
    summary:
      'Centralne serce systemu — jedna platforma spinająca wszystkie konta, działy i warstwę AI.',
    details: [
      'Wspólna warstwa danych, uprawnień i integracji',
      'Sterowany modelem AI od pierwszego dnia (AI-first)',
      'Jeden punkt wejścia dla wszystkich typów użytkowników',
    ],
  },

  // --- Warstwa AI: master agenci ----------------------------------------
  {
    id: 'agent-master-crm',
    label: 'Master Agent CRM',
    category: 'ai',
    level: 3,
    summary:
      'Najwyższy agent AI całego systemu. Administruje wszystkimi master agentami i pilnuje polityk.',
    details: [
      'Orkiestracja wszystkich agentów w organizacji',
      'Bezpieczeństwo, uprawnienia i polityki AI',
      'Globalny kontekst i pamięć całej organizacji',
    ],
  },
  {
    id: 'agent-master-prac',
    label: 'Master Agent — Pracownicy',
    category: 'ai',
    level: 2,
    summary:
      'Master agent kont pracowniczych/administracyjnych. Administrowany przez Master Agenta CRM.',
    details: [
      'Zarządza asystentami AI naszego zespołu',
      'Pilnuje procesów wewnętrznych i przepływu dokumentów',
    ],
  },
  {
    id: 'agent-master-uzyt',
    label: 'Master Agent — Użytkownicy',
    category: 'ai',
    level: 2,
    summary:
      'Master agent kont użytkowników/wykonawców. Administrowany przez Master Agenta CRM.',
    details: [
      'Zarządza asystentami wykonawców (solo i zespoły)',
      'Wspiera realizację zleceń i dopasowanie do zadań',
    ],
  },
  {
    id: 'agent-master-firma',
    label: 'Master Agent — Firmy i Rekrutacja',
    category: 'ai',
    level: 2,
    summary:
      'Master agent kont firmowych i rekrutacyjnych. Administrowany przez Master Agenta CRM.',
    details: [
      'Zarządza asystentami firm, agencji i head hunterów',
      'Wspiera pozyskiwanie i rekrutację wykonawców',
    ],
  },
  {
    id: 'agent-master-partner',
    label: 'Master Agent — Partnerzy',
    category: 'ai',
    level: 2,
    summary:
      'Master agent kont partnerskich. Administrowany przez Master Agenta CRM.',
    details: [
      'Zarządza asystentami ekspertów, szkoleń, produktów i usług',
      'Wspiera rozwój ekosystemu partnerów',
    ],
  },

  // --- Organizacja wewnętrzna: hub + działy ------------------------------
  {
    id: 'org',
    label: 'Organizacja (Zespół)',
    category: 'dzial',
    level: 3,
    summary:
      'Nasz wewnętrzny zespół prowadzący projekt — sześć obszarów działających w modelu AI-first.',
    details: [
      'Każdy obszar ma własnego asystenta AI',
      'Wszyscy pracują na wspólnych danych CRM',
    ],
  },
  {
    id: 'dz-it',
    label: 'IT & R&D',
    category: 'dzial',
    level: 2,
    summary:
      'Programiści tworzący, ulepszający i testujący rozwiązania platformy.',
    details: [
      'Rozwój produktu i nowych funkcji',
      'Badania, prototypy i testy',
      'Utrzymanie i bezpieczeństwo systemu',
    ],
  },
  {
    id: 'dz-sprzedaz',
    label: 'Sprzedaż & BOK',
    category: 'dzial',
    level: 2,
    summary:
      'Pozyskiwanie klientów, sprzedaż i obsługa klienta (Biuro Obsługi Klienta).',
    details: [
      'Pozyskiwanie i konwersja klientów',
      'Obsługa i utrzymanie relacji',
      'Przychody i rozwój sprzedaży',
    ],
  },
  {
    id: 'dz-marketing',
    label: 'Marketing',
    category: 'dzial',
    level: 2,
    summary: 'Wszystkie obszary marketingu — od treści po kampanie i markę.',
    details: ['Marka i komunikacja', 'Kampanie i pozyskiwanie leadów', 'Treści i social media'],
  },
  {
    id: 'dz-hr',
    label: 'HR, Rekrutacja, Kadry & Administracja',
    category: 'dzial',
    level: 2,
    summary:
      'Nadzór nad zespołami i przepływem dokumentów; rekrutacja i kadry.',
    details: [
      'Rekrutacja i onboarding',
      'Kadry i dokumentacja',
      'Nadzór i administracja wewnętrzna',
    ],
  },
  {
    id: 'dz-finanse',
    label: 'Finanse & Compliance',
    category: 'dzial',
    level: 2,
    summary: 'Księgowość, zgodność prawna i bezpieczeństwo regulacyjne.',
    details: ['Księgowość i rozliczenia', 'Zgodność prawna (compliance)', 'Kontrola i raportowanie'],
  },
  {
    id: 'dz-zarzad',
    label: 'Zarząd',
    category: 'dzial',
    level: 2,
    summary: 'Podgląd i dostęp do wszystkiego — pełen obraz organizacji.',
    details: ['Strategia i decyzje', 'Pełny wgląd we wszystkie obszary', 'Nadzór właścicielski'],
  },

  // --- Asystenci AI działów wewnętrznych ---------------------------------
  ...internalAssistants(),

  // --- Konta zewnętrzne: typy --------------------------------------------
  {
    id: 'konto-prac',
    label: 'Konto Administratora / Pracownika',
    category: 'konto',
    level: 2,
    summary:
      'Konto naszego pracownika-administratora obsługującego platformę i klientów.',
    details: [
      'Zarządzanie kontami i danymi',
      'Obsługa procesów i wsparcie użytkowników',
    ],
  },
  {
    id: 'konto-uzyt',
    label: 'Konto Użytkownika / Wykonawcy',
    category: 'konto',
    level: 2,
    summary:
      'Konto osób realizujących zlecenia — w wersji solo lub zespołowej.',
    details: ['Profil i portfolio', 'Realizacja zleceń', 'Rozliczenia i oceny'],
  },
  {
    id: 'konto-firma',
    label: 'Konto Firmowe / Rekrutacyjne',
    category: 'konto',
    level: 2,
    summary:
      'Konto podmiotów pozyskujących wykonawców i rekrutujących.',
    details: ['Publikowanie zleceń i ofert', 'Rekrutacja i selekcja', 'Zarządzanie współpracą'],
  },
  {
    id: 'konto-partner',
    label: 'Konto Partnera',
    category: 'konto',
    level: 2,
    summary:
      'Konto partnerów rozszerzających ekosystem o wiedzę, szkolenia, produkty i usługi.',
    details: ['Oferta partnerska', 'Integracje i współpraca', 'Rozwój ekosystemu'],
  },

  // --- Podtypy kont ------------------------------------------------------
  podkonto('uzyt-solo', 'Wykonawca — Solo', 'Pojedynczy wykonawca realizujący zlecenia samodzielnie.'),
  podkonto('uzyt-zespol', 'Wykonawca — Zespół', 'Zespół wykonawców współpracujących nad zleceniami.'),
  podkonto('firma-firma', 'Firma', 'Firma poszukująca wykonawców lub oferująca współpracę.'),
  podkonto('firma-agencja', 'Agencja Pracy', 'Agencja pośrednicząca w pozyskiwaniu wykonawców.'),
  podkonto('firma-hh', 'Head Hunter', 'Rekruter wyszukujący i pozyskujący najlepszych kandydatów.'),
  podkonto('part-eksperci', 'Eksperci / Doradcy', 'Eksperci i doradcy wnoszący wiedzę do ekosystemu.'),
  podkonto('part-szkolenia', 'Centra Szkoleniowe', 'Podmioty oferujące szkolenia i rozwój kompetencji.'),
  podkonto('part-produkty', 'Produkty', 'Partnerzy dostarczający produkty do ekosystemu.'),
  podkonto('part-uslugi', 'Usługi', 'Partnerzy dostarczający usługi do ekosystemu.'),
  podkonto('part-inni', 'Inni', 'Pozostali partnerzy rozszerzający ofertę platformy.'),

  // --- Asystenci AI kont zewnętrznych ------------------------------------
  assistant('as-konto-prac', 'Asystent AI — Administrator', 'konta administratora/pracownika'),
  assistant('as-konto-uzyt', 'Asystent AI — Użytkownik', 'konta użytkownika/wykonawcy'),
  assistant('as-konto-firma', 'Asystent AI — Firma', 'konta firmowego/rekrutacyjnego'),
  assistant('as-konto-partner', 'Asystent AI — Partner', 'konta partnera'),
];

// ---------------------------------------------------------------------------
// POŁĄCZENIA
// ---------------------------------------------------------------------------

export const LINKS: OrgLink[] = [
  // Rdzeń → warstwa AI oraz główne gałęzie
  ai('crm', 'agent-master-crm'),
  struktura('crm', 'org'),
  struktura('crm', 'konto-prac'),
  struktura('crm', 'konto-uzyt'),
  struktura('crm', 'konto-firma'),
  struktura('crm', 'konto-partner'),

  // Organizacja → działy
  struktura('org', 'dz-it'),
  struktura('org', 'dz-sprzedaz'),
  struktura('org', 'dz-marketing'),
  struktura('org', 'dz-hr'),
  struktura('org', 'dz-finanse'),
  struktura('org', 'dz-zarzad'),

  // Działy → ich asystenci AI
  struktura('dz-it', 'as-it'),
  struktura('dz-sprzedaz', 'as-sprzedaz'),
  struktura('dz-marketing', 'as-marketing'),
  struktura('dz-hr', 'as-hr'),
  struktura('dz-finanse', 'as-finanse'),
  struktura('dz-zarzad', 'as-zarzad'),

  // Asystenci działów → Master Agent CRM (łączą się z agentem całego systemu)
  ai('as-it', 'agent-master-crm'),
  ai('as-sprzedaz', 'agent-master-crm'),
  ai('as-marketing', 'agent-master-crm'),
  ai('as-hr', 'agent-master-crm'),
  ai('as-finanse', 'agent-master-crm'),
  ai('as-zarzad', 'agent-master-crm'),

  // Konta → podtypy
  struktura('konto-uzyt', 'uzyt-solo'),
  struktura('konto-uzyt', 'uzyt-zespol'),
  struktura('konto-firma', 'firma-firma'),
  struktura('konto-firma', 'firma-agencja'),
  struktura('konto-firma', 'firma-hh'),
  struktura('konto-partner', 'part-eksperci'),
  struktura('konto-partner', 'part-szkolenia'),
  struktura('konto-partner', 'part-produkty'),
  struktura('konto-partner', 'part-uslugi'),
  struktura('konto-partner', 'part-inni'),

  // Konta → ich indywidualni asystenci AI
  struktura('konto-prac', 'as-konto-prac'),
  struktura('konto-uzyt', 'as-konto-uzyt'),
  struktura('konto-firma', 'as-konto-firma'),
  struktura('konto-partner', 'as-konto-partner'),

  // Asystenci kont → master agent danego typu
  ai('as-konto-prac', 'agent-master-prac'),
  ai('as-konto-uzyt', 'agent-master-uzyt'),
  ai('as-konto-firma', 'agent-master-firma'),
  ai('as-konto-partner', 'agent-master-partner'),

  // Master agenci typów → Master Agent CRM (administrowani od góry)
  ai('agent-master-prac', 'agent-master-crm'),
  ai('agent-master-uzyt', 'agent-master-crm'),
  ai('agent-master-firma', 'agent-master-crm'),
  ai('agent-master-partner', 'agent-master-crm'),
];

// ---------------------------------------------------------------------------
// Pomocnicze fabryki (utrzymują dane zwięzłe i spójne)
// ---------------------------------------------------------------------------

function struktura(source: string, target: string): OrgLink {
  return { source, target, kind: 'struktura' };
}

function ai(source: string, target: string): OrgLink {
  return { source, target, kind: 'ai' };
}

function podkonto(id: string, label: string, summary: string): OrgNode {
  return { id, label, category: 'podkonto', level: 1, summary };
}

function assistant(id: string, label: string, ownerLabel: string): OrgNode {
  return {
    id,
    label,
    category: 'asystent',
    level: 1,
    summary: `Indywidualny asystent AI ${ownerLabel}. Łączy się z master agentem swojego typu.`,
    details: [
      'Pomaga korzystać z funkcji dostępnych dla konta',
      'Łączy się z master agentem danego typu konta',
    ],
  };
}

function internalAssistants(): OrgNode[] {
  const owners: Array<[string, string]> = [
    ['as-it', 'IT & R&D'],
    ['as-sprzedaz', 'Sprzedaż & BOK'],
    ['as-marketing', 'Marketing'],
    ['as-hr', 'HR & Administracja'],
    ['as-finanse', 'Finanse & Compliance'],
    ['as-zarzad', 'Zarząd'],
  ];
  return owners.map(([id, dept]) => ({
    id,
    label: `Asystent AI — ${dept}`,
    category: 'asystent' as CategoryId,
    level: 1,
    summary: `Indywidualny asystent AI działu ${dept}. Łączy się bezpośrednio z Master Agentem CRM.`,
    details: [
      'Wspiera codzienną pracę zespołu',
      'Łączy się z Master Agentem CRM (agentem całego systemu)',
    ],
  }));
}

// ---------------------------------------------------------------------------
// Szybki dostęp po id (przydatne w panelu szczegółów i na stronie struktury)
// ---------------------------------------------------------------------------

export const NODE_MAP: Record<string, OrgNode> = NODES.reduce(
  (acc, n) => {
    acc[n.id] = n;
    return acc;
  },
  {} as Record<string, OrgNode>,
);

/** Zwraca dzieci węzła w hierarchii strukturalnej (pomija połączenia AI). */
export function structuralChildren(id: string): OrgNode[] {
  return LINKS.filter((l) => l.source === id && l.kind === 'struktura')
    .map((l) => NODE_MAP[l.target])
    .filter(Boolean);
}
