import { DEFAULT_BASES } from './knowledgeBase';
import type { OrgLink, OrgNode } from './organization';

// ---------------------------------------------------------------------------
// ELEMENTY FUNKCYJNE KONT — wyciągane z pełnych notatek bazy wiedzy.
//
// Notatki funkcjonalne mają numerowane sekcje („# 4. Dashboard…”) oraz
// podsekcje („## 4.2. Elementy dashboardu”). Parser zamienia je na drzewo
// elementów funkcyjnych, które stają się podelementami kont na Mapie
// i w Strukturze: konto → funkcje → podfunkcje.
// ---------------------------------------------------------------------------

export interface FnSpec {
  label: string;
  summary: string;
  details: string[];
  children: FnSpec[];
}

const MAX_DETAILS = 12;
const MAX_SUMMARY = 220;

function cleanInline(text: string): string {
  return text
    .replace(/\*\*|__|`/g, '')
    .replace(/\s+/g, ' ')
    .trim();
}

function truncate(text: string, max: number): string {
  if (text.length <= max) return text;
  const cut = text.slice(0, max);
  const space = cut.lastIndexOf(' ');
  return `${cut.slice(0, space > max * 0.6 ? space : max)}…`;
}

interface RawSection {
  num: number[];
  title: string;
  bodyLines: string[];
}

/** Rozbija notatkę markdown na numerowane sekcje (1., 2., … oraz N.M.). */
function splitSections(note: string): RawSection[] {
  const lines = note.split(/\r?\n/);
  const sections: RawSection[] = [];
  let current: RawSection | null = null;

  for (const line of lines) {
    const heading = /^(#{1,6})\s+(.*)$/.exec(line);
    if (heading) {
      const numbered = /^(\d+(?:\.\d+)*)\.?\s+(.+)$/.exec(heading[2].trim());
      if (numbered && numbered[1].split('.').length <= 2) {
        current = {
          num: numbered[1].split('.').map(Number),
          title: cleanInline(numbered[2]),
          bodyLines: [],
        };
        sections.push(current);
      } else if (current) {
        // Nienumerowany nagłówek wewnątrz sekcji (np. „### A. Status…”)
        // traktujemy jako punkt treści bieżącej sekcji.
        const title = cleanInline(heading[2]);
        if (title) current.bodyLines.push(`- ${title}`);
      }
      continue;
    }
    if (current) current.bodyLines.push(line);
  }
  return sections;
}

function hasContent(bodyLines: string[]): boolean {
  return bodyLines.some((l) => l.trim() && !/^-{3,}$/.test(l.trim()));
}

/** Wyciąga podsumowanie (pierwszy akapit) i punkty (listy) z treści sekcji. */
function extractContent(bodyLines: string[]): { summary: string; details: string[] } {
  let summary = '';
  const details: string[] = [];
  let paragraph: string[] = [];

  const flushParagraph = () => {
    if (!summary && paragraph.length) summary = cleanInline(paragraph.join(' '));
    paragraph = [];
  };

  for (const raw of bodyLines) {
    const line = raw.trim();
    if (!line || /^-{3,}$/.test(line)) {
      flushParagraph();
      continue;
    }
    const bullet = /^[-*]\s+(.+)$/.exec(line) ?? /^\d+\.\s+(.+)$/.exec(line);
    if (bullet) {
      flushParagraph();
      const item = cleanInline(bullet[1]).replace(/[,;]$/, '');
      if (item && details.length < MAX_DETAILS) details.push(item);
      else if (item && details.length === MAX_DETAILS) details.push('… (więcej w pełnej notatce w bazie wiedzy)');
      continue;
    }
    if (line.startsWith('>')) {
      flushParagraph();
      const quote = cleanInline(line.replace(/^>+\s?/, ''));
      if (quote && !summary) summary = quote;
      continue;
    }
    paragraph.push(line);
  }
  flushParagraph();

  if (!summary && details.length) summary = details[0];
  return { summary: truncate(summary, MAX_SUMMARY), details };
}

/** Parsuje pełną notatkę funkcjonalną na drzewo elementów funkcyjnych. */
export function parseFunctions(note: string): FnSpec[] {
  const sections = splitSections(note);
  const tops: FnSpec[] = [];
  let currentTop: FnSpec | null = null;

  sections.forEach((section, i) => {
    if (section.num.length === 1) {
      // Nagłówek-tytuł dokumentu: pusta treść i brak własnych podsekcji.
      const next = sections[i + 1];
      const hasSubs = next && next.num.length === 2;
      if (!hasContent(section.bodyLines) && !hasSubs) return;
      const { summary, details } = extractContent(section.bodyLines);
      currentTop = { label: section.title, summary, details, children: [] };
      tops.push(currentTop);
    } else if (currentTop) {
      const { summary, details } = extractContent(section.bodyLines);
      currentTop.children.push({ label: section.title, summary, details, children: [] });
    }
  });

  // Funkcja bez własnego opisu (cała treść w podsekcjach) dziedziczy opis
  // z pierwszej podfunkcji — zwykle „Główna idea …”.
  for (const top of tops) {
    if (!top.summary && top.children.length) {
      top.summary = top.children.find((c) => c.summary)?.summary ?? '';
    }
  }
  return tops;
}

/** Buduje węzły i połączenia elementów funkcyjnych dla wskazanego konta. */
export function buildFunctionGraph(
  accountId: string,
  fns: FnSpec[],
): { nodes: OrgNode[]; links: OrgLink[] } {
  const nodes: OrgNode[] = [];
  const links: OrgLink[] = [];

  fns.forEach((fn, i) => {
    const fnId = `fn-${accountId}-${i + 1}`;
    nodes.push({
      id: fnId,
      label: fn.label,
      category: 'funkcja',
      level: 1,
      summary: fn.summary || 'Element funkcyjny konta — pełny opis w bazie wiedzy.',
      details: fn.details.length ? fn.details : undefined,
    });
    links.push({ source: accountId, target: fnId, kind: 'struktura' });

    fn.children.forEach((sub, j) => {
      const subId = `${fnId}-${j + 1}`;
      nodes.push({
        id: subId,
        label: sub.label,
        category: 'funkcja',
        level: 1,
        summary: sub.summary || 'Element funkcyjny konta — pełny opis w bazie wiedzy.',
        details: sub.details.length ? sub.details : undefined,
      });
      links.push({ source: fnId, target: subId, kind: 'struktura' });
    });
  });

  return { nodes, links };
}

/** Prefiks id elementów funkcyjnych danego konta (do podmiany przy skanie). */
export function functionIdPrefix(accountId: string): string {
  return `fn-${accountId}-`;
}

// ---------------------------------------------------------------------------
// Domyślne elementy funkcyjne — wygenerowane z notatek bazy „Konta & Funkcje”.
// ---------------------------------------------------------------------------

function buildDefaults(): { nodes: OrgNode[]; links: OrgLink[] } {
  const nodes: OrgNode[] = [];
  const links: OrgLink[] = [];
  for (const base of DEFAULT_BASES) {
    for (const category of base.categories) {
      for (const entry of category.entries) {
        if (!entry.nodeId || !entry.note.trim()) continue;
        const graph = buildFunctionGraph(entry.nodeId, parseFunctions(entry.note));
        nodes.push(...graph.nodes);
        links.push(...graph.links);
      }
    }
  }
  return { nodes, links };
}

const DEFAULTS = buildDefaults();

export const DEFAULT_FUNCTION_NODES: OrgNode[] = DEFAULTS.nodes;
export const DEFAULT_FUNCTION_LINKS: OrgLink[] = DEFAULTS.links;
