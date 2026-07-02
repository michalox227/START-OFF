import agencjaNote from './kb/agencjaNote';
import biznesNote from './kb/biznesNote';
import headhunterNote from './kb/headhunterNote';
import konsultanciNote from './kb/konsultanciNote';
import produktyNote from './kb/produktyNote';
import soloNote from './kb/soloNote';
import szkolenioweNote from './kb/szkolenioweNote';
import zespolNote from './kb/zespolNote';

// ---------------------------------------------------------------------------
// BAZA WIEDZY — domyślny (seed) zestaw danych.
//
// Struktura: baza wiedzy → kategorie → wpisy (każdy wpis ma podstronę z pełną
// notatką). Wpis może być powiązany z elementem mapy (`nodeId`), a kategoria
// z elementem nadrzędnym (`parentNodeId`) — narzędzie „Skanuj” zczytuje te
// dane i uzupełnia je w całej platformie (mapa + struktura).
// ---------------------------------------------------------------------------

export interface KbEntry {
  id: string;
  title: string;
  short: string;
  status: string;
  note: string;
  summary: string[];
  /** Powiązany element mapy organizacji (uzupełniany też przez skanowanie). */
  nodeId: string | null;
}

export interface KbCategory {
  id: string;
  title: string;
  description: string;
  /** Element mapy, pod który skanowanie podpina nowe wpisy tej kategorii. */
  parentNodeId: string | null;
  entries: KbEntry[];
}

export interface KbBase {
  id: string;
  name: string;
  description: string;
  categories: KbCategory[];
}

export const DEFAULT_BASES: KbBase[] = [
  {
    id: 'konta-funkcje',
    name: 'Konta & Funkcje',
    description:
      'Pełne notatki funkcjonalne wszystkich typów kont platformy GO ON [OFF] SHORE — od kont użytkowników, przez konta rekrutacyjne, po konta partnerów. Narzędzie „Skanuj” zczytuje te dane i uzupełnia je w całej platformie (mapa + struktura).',
    categories: [
      {
        id: 'konto-uzytkownika',
        title: 'Konto użytkownika',
        description: 'Konta dla osób indywidualnych oraz zespołów wykonawczych.',
        parentNodeId: 'konto-uzyt',
        entries: [
          {
            id: 'konto-uzytkownika-solo',
            title: 'Konto użytkownika — Solo',
            short: 'Indywidualny profil specjalisty, kandydata, kontraktora lub freelancera.',
            status: 'Notatka dodana 1:1',
            note: soloNote,
            summary: [
              'Profil zawodowy i dokumenty użytkownika.',
              'Oferty pracy/projekty w formie kart swipe.',
              'Kalendarz, komunikator, marketplace, centrum szkoleniowe i agent AI.',
              'Automatyczne CV, portfolio, mapa projektów i panel aplikacji.',
            ],
            nodeId: 'uzyt-solo',
          },
          {
            id: 'konto-uzytkownika-zespol',
            title: 'Konto użytkownika — Zespół',
            short: 'Konto dla firm i zespołów, które aplikują zbiorczo na projekty.',
            status: 'Notatka dodana 1:1',
            note: zespolNote,
            summary: [
              'Profil firmy i zapraszanie pracowników linkiem.',
              'Zbiorcze aplikowanie całym zespołem lub wybranymi osobami.',
              'Analiza braków: ludzie, certyfikaty, dokumenty, sprzęt.',
              'Moduł wycen, przetargów, checklist, zadań i agentów AI.',
            ],
            nodeId: 'uzyt-zespol',
          },
        ],
      },
      {
        id: 'konto-rekrutacyjne',
        title: 'Konto rekrutacyjne',
        description:
          'Konta dla firm, agencji oraz indywidualnych rekruterów obsługujących procesy rekrutacyjne.',
        parentNodeId: 'konto-firma',
        entries: [
          {
            id: 'konto-rekrutacyjne-biznes',
            title: 'Konto rekrutacyjne — Biznes',
            short: 'Dla firm realizujących projekty i szukających ludzi, zespołów, usług lub sprzętu.',
            status: 'Notatka dodana 1:1',
            note: biznesNote,
            summary: [
              'Dodawanie ofert pracy, zleceń i zapotrzebowań projektowych.',
              'Publikowanie własnych usług i wycen.',
              'Analiza kandydatów, spotkania, umowy i dokumenty.',
              'Mapa projektów, dashboard, marketplace i agenci AI.',
            ],
            nodeId: 'firma-firma',
          },
          {
            id: 'konto-rekrutacyjne-agencja-pracy',
            title: 'Konto rekrutacyjne — Agencja pracy',
            short: 'Dla agencji pracy rekrutujących kandydatów do projektów firm.',
            status: 'Notatka dodana 1:1',
            note: agencjaNote,
            summary: [
              'Dostęp do projektów firm i obsługa rekrutacji.',
              'Publikowanie ofert na platformie i zewnętrznych portalach.',
              'Pipeline kandydatów, kalkulacja marży i moduł przetargowy.',
              'Mapa projektów, komunikator, mailing, dokumenty i AI.',
            ],
            nodeId: 'firma-agencja',
          },
          {
            id: 'konto-rekrutacyjne-headhunter',
            title: 'Konto rekrutacyjne — Headhunter / Rekruter',
            short: 'Dla indywidualnych rekruterów i headhunterów działających samodzielnie.',
            status: 'Notatka dodana 1:1',
            note: headhunterNote,
            summary: [
              'Indywidualny profil rekrutera i własna baza kandydatów.',
              'Sourcing, pipeline, shortlisty i komunikacja z firmami.',
              'Kalkulacja prowizji, oferty, przetargi i umowy.',
              'Osobisty agent AI, kalendarz, mapa i analityka.',
            ],
            nodeId: 'firma-hh',
          },
        ],
      },
      {
        id: 'konto-partnera',
        title: 'Konto partnera',
        description:
          'Konta dla ekspertów, centrów szkoleniowych oraz firm sprzedających produkty i usługi.',
        parentNodeId: 'konto-partner',
        entries: [
          {
            id: 'konto-partnera-konsultanci',
            title: 'Konto partnera — Konsultanci / Doradcy / Eksperci',
            short: 'Dla osób i firm świadczących usługi doradcze, konsultacyjne i eksperckie.',
            status: 'Notatka dodana 1:1',
            note: konsultanciNote,
            summary: [
              'Profil partnera, weryfikacja i oferta usług.',
              'Leady, rekomendacje, zapytania i generator ofert.',
              'Social media, publikacje, wydarzenia i marketplace.',
              'Kalendarz, mailing, komunikator i asystent AI.',
            ],
            nodeId: 'part-eksperci',
          },
          {
            id: 'konto-partnera-centrum-szkoleniowe',
            title: 'Konto partnera — Centrum szkoleniowe',
            short: 'Dla firm szkoleniowych, certyfikacyjnych, szkół i ośrodków kursowych.',
            status: 'Notatka dodana 1:1',
            note: szkolenioweNote,
            summary: [
              'Oferta kursów, szkoleń, certyfikatów i uprawnień.',
              'Terminy, sloty, lokalizacje, tryby online/stacjonarne.',
              'Rekomendacje przy brakujących uprawnieniach do projektów.',
              'Sprzedaż szkoleń, materiały, certyfikaty i AI.',
            ],
            nodeId: 'part-szkolenia',
          },
          {
            id: 'konto-partnera-produkty-uslugi',
            title: 'Konto partnera — Produkty i usługi',
            short: 'Dla marek, sklepów, dostawców, producentów i usługodawców.',
            status: 'Notatka dodana 1:1',
            note: produktyNote,
            summary: [
              'Profil firmy i katalog produktów/usług.',
              'Import produktów ze sklepu online lub transfer przez platformę.',
              'Marketplace/dropshipping, zamówienia, wysyłka i marża.',
              'Reklamy, pop-upy, leady, integracje i agent AI.',
            ],
            nodeId: 'part-produkty',
          },
        ],
      },
    ],
  },
];
