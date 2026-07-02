import type { ReactNode } from 'react';

// Lekki renderer notatek markdown (nagłówki, listy, cytaty, pogrubienia, hr).
// Tekst jest renderowany jako elementy React, więc treść jest bezpiecznie
// escapowana — bez dangerouslySetInnerHTML.

function renderInline(text: string): ReactNode {
  const parts = text.split('**');
  if (parts.length === 1) return text;
  return parts.map((part, i) => (i % 2 === 1 ? <strong key={i}>{part}</strong> : part));
}

export default function MarkdownLite({ text }: { text: string }) {
  const lines = text.split('\n');
  const blocks: ReactNode[] = [];
  let paragraph: string[] = [];
  let key = 0;
  let i = 0;

  const flushParagraph = () => {
    if (paragraph.length) {
      blocks.push(<p key={key++}>{renderInline(paragraph.join(' '))}</p>);
      paragraph = [];
    }
  };

  while (i < lines.length) {
    const line = lines[i].trim();

    if (!line) {
      flushParagraph();
      i++;
      continue;
    }

    if (/^-{3,}$/.test(line)) {
      flushParagraph();
      blocks.push(<hr key={key++} />);
      i++;
      continue;
    }

    const heading = line.match(/^(#{1,6})\s+(.*)$/);
    if (heading) {
      flushParagraph();
      const level = heading[1].length;
      const content = renderInline(heading[2]);
      if (level === 1) blocks.push(<h1 key={key++}>{content}</h1>);
      else if (level === 2) blocks.push(<h2 key={key++}>{content}</h2>);
      else if (level === 3) blocks.push(<h3 key={key++}>{content}</h3>);
      else blocks.push(<h4 key={key++}>{content}</h4>);
      i++;
      continue;
    }

    if (line.startsWith('>')) {
      flushParagraph();
      const quote: string[] = [];
      while (i < lines.length && lines[i].trim().startsWith('>')) {
        const q = lines[i].trim().replace(/^>\s?/, '');
        if (q) quote.push(q);
        i++;
      }
      blocks.push(
        <blockquote key={key++}>
          {quote.map((q, j) => (
            <p key={j}>{renderInline(q)}</p>
          ))}
        </blockquote>,
      );
      continue;
    }

    if (/^[-*]\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^[-*]\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^[-*]\s+/, ''));
        i++;
      }
      blocks.push(
        <ul key={key++}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ul>,
      );
      continue;
    }

    if (/^\d+\.\s+/.test(line)) {
      flushParagraph();
      const items: string[] = [];
      while (i < lines.length && /^\d+\.\s+/.test(lines[i].trim())) {
        items.push(lines[i].trim().replace(/^\d+\.\s+/, ''));
        i++;
      }
      blocks.push(
        <ol key={key++}>
          {items.map((item, j) => (
            <li key={j}>{renderInline(item)}</li>
          ))}
        </ol>,
      );
      continue;
    }

    paragraph.push(line);
    i++;
  }

  flushParagraph();
  return <div className="kb-note">{blocks}</div>;
}
