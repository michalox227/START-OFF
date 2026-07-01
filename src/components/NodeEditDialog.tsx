import { useEffect, useState, type FormEvent } from 'react';
import { CATEGORIES, type CategoryId } from '../data/categories';
import type { OrgNode } from '../data/organization';
import type { NodeInput } from '../state/OrgDataContext';

interface Props {
  mode: 'create' | 'edit';
  /** Kategoria wstępnie zaznaczona przy tworzeniu nowego elementu (np. z sekcji, w której kliknięto „+ Dodaj”). */
  initialCategory?: CategoryId;
  /** Element do edycji (tryb 'edit'). */
  node?: OrgNode;
  /** Aktualny nadrzędny element (tryb 'edit'). */
  initialParentId?: string | null;
  allNodes: OrgNode[];
  onSubmit: (input: NodeInput) => void;
  onClose: () => void;
}

const LEVEL_OPTIONS: Array<{ value: 1 | 2 | 3; label: string }> = [
  { value: 1, label: '1 — mały' },
  { value: 2, label: '2 — średni' },
  { value: 3, label: '3 — kluczowy' },
];

export default function NodeEditDialog({
  mode,
  initialCategory,
  node,
  initialParentId,
  allNodes,
  onSubmit,
  onClose,
}: Props) {
  const [label, setLabel] = useState(node?.label ?? '');
  const [category, setCategory] = useState<CategoryId>(node?.category ?? initialCategory ?? CATEGORIES[0].id);
  const [level, setLevel] = useState<1 | 2 | 3>(node?.level ?? 2);
  const [summary, setSummary] = useState(node?.summary ?? '');
  const [detailsText, setDetailsText] = useState((node?.details ?? []).join('\n'));
  const [parentId, setParentId] = useState<string>(initialParentId ?? '');

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === 'Escape') onClose();
    }
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  const parentOptions = allNodes.filter((n) => n.id !== node?.id);

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!label.trim() || !summary.trim()) return;
    onSubmit({
      label: label.trim(),
      category,
      level,
      summary: summary.trim(),
      details: detailsText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      parentId: parentId || null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="modal__title">{mode === 'create' ? 'Nowy element' : 'Edytuj element'}</h2>

        <label className="form-field">
          <span>Nazwa</span>
          <input value={label} onChange={(e) => setLabel(e.target.value)} required autoFocus />
        </label>

        <label className="form-field">
          <span>Kategoria</span>
          <select value={category} onChange={(e) => setCategory(e.target.value as CategoryId)}>
            {CATEGORIES.map((c) => (
              <option key={c.id} value={c.id}>
                {c.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Waga węzła na mapie</span>
          <select value={level} onChange={(e) => setLevel(Number(e.target.value) as 1 | 2 | 3)}>
            {LEVEL_OPTIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Nadrzędny element (opcjonalnie)</span>
          <select value={parentId} onChange={(e) => setParentId(e.target.value)}>
            <option value="">— brak —</option>
            {parentOptions.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>

        <label className="form-field">
          <span>Opis</span>
          <textarea value={summary} onChange={(e) => setSummary(e.target.value)} rows={2} required />
        </label>

        <label className="form-field">
          <span>Szczegóły (jedna linia = jeden punkt)</span>
          <textarea value={detailsText} onChange={(e) => setDetailsText(e.target.value)} rows={4} />
        </label>

        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Anuluj
          </button>
          <button type="submit" className="btn btn--primary">
            {mode === 'create' ? 'Dodaj' : 'Zapisz'}
          </button>
        </div>
      </form>
    </div>
  );
}
