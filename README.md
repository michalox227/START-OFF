# Grantland — Wizualizacja architektury organizacji

Interaktywna wizualizacja pomysłu biznesowego **Grantland** — dla Grantland, inwestorów,
pracowników i partnerów. Pierwsza strona to **mapa organizacji w stylu grafu Obsidian**:
połączone ze sobą elementy pokazujące, jak działa cały system.

Aplikacja jest sterowana jednym modelem danych (`src/data/organization.ts`), dzięki czemu
łatwo ją **rozbudowywać i reużywać zasoby z innych repozytoriów** — wystarczy zaimportować
lub rozszerzyć węzły i połączenia.

## 🔗 Podgląd na żywo

**➡️ https://michalox227.github.io/START-OFF/**

Hosting darmowy (GitHub Pages), wdrażany automatycznie po każdej zmianie na gałęzi
(workflow `.github/workflows/deploy.yml`).

## Co pokazuje mapa

Model to **AI-first CRM** z czterema warstwami:

- **Rdzeń CRM** — centralna platforma spinająca wszystko.
- **Warstwa AI** — najwyższy **Master Agent CRM** administruje master agentami
  poszczególnych typów kont; każdy użytkownik i dział ma **indywidualnego asystenta AI**.
- **Konta użytkowników** — typy kont i ich warianty:
  - Konto Administratora / Pracownika
  - Konto Użytkownika / Wykonawcy (solo, zespół)
  - Konto Firmowe / Rekrutacyjne (firma, agencja pracy, head hunter)
  - Konto Partnera (eksperci/doradcy, centra szkoleniowe, produkty, usługi, inni)
- **Organizacja (nasz zespół)** — sześć obszarów: IT & R&D, Sprzedaż & BOK, Marketing,
  HR & Administracja, Finanse & Compliance, Zarząd.

### Przepływ AI

```
Asystent AI (użytkownik/dział)  →  Master Agent danego typu konta  →  Master Agent CRM
```

Asystenci działów wewnętrznych łączą się bezpośrednio z Master Agentem CRM
(agentem całego systemu).

## Strony

- **Mapa** (`/`) — interaktywny graf: przeciąganie, zoom, klik węzła = szczegóły i powiązania,
  legenda po lewej filtruje warstwy.
- **Struktura** (`/struktura`) — ten sam model w formie czytelnego konspektu (dobre na mobile
  i do prezentacji).

## Uruchomienie

```bash
npm install
npm run dev      # tryb deweloperski (http://localhost:5173)
npm run build    # produkcyjny build do ./dist
npm run preview  # podgląd builda
```

Wymagany Node 18+ (testowane na Node 22).

## Struktura projektu

```
src/
  data/
    organization.ts    # JEDYNE źródło prawdy: węzły (NODES) i połączenia (LINKS)
    categories.ts      # kategorie węzłów: kolory, etykiety, opisy (zasila legendę)
  components/
    OrgGraph.tsx        # graf w stylu Obsidian (react-force-graph-2d)
    Legend.tsx          # legenda + filtr warstw
    NodeDetailPanel.tsx # panel szczegółów wybranego węzła
    Header.tsx          # nagłówek + nawigacja
  pages/
    MapPage.tsx         # strona mapy
    StructurePage.tsx   # strona ze strukturą (konspekt)
  hooks/
    useMeasure.ts       # pomiar rozmiaru kontenera (ResizeObserver)
```

## Jak rozbudować / reużyć

Cała treść modelu żyje w `src/data/organization.ts`:

- Dodaj węzeł do `NODES` (`id`, `label`, `category`, `level`, `summary`, opcjonalnie `details`).
- Połącz go w `LINKS` (`struktura` = hierarchia, `ai` = połączenie agentów).
- Nowe kategorie/kolory dodaj w `src/data/categories.ts`.

Model można też zaimportować w innym repozytorium:

```ts
import { NODES, LINKS } from './src/data/organization';
```

## Stos technologiczny

Vite · React · TypeScript · `react-force-graph-2d` (canvas + d3-force) · React Router.
