import { useMemo, useState, type FormEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import MarkdownLite from '../components/MarkdownLite';
import type { KbCategory, KbEntry } from '../data/knowledgeBase';
import type { OrgNode } from '../data/organization';
import {
  useKnowledgeBase,
  type KbCategoryInput,
  type KbEntryInput,
} from '../state/KnowledgeBaseContext';
import { useOrgData } from '../state/OrgDataContext';

// ---------------------------------------------------------------------------
// Dialog kategorii
// ---------------------------------------------------------------------------

interface CategoryDialogProps {
  category?: KbCategory;
  orgNodes: OrgNode[];
  onSubmit: (input: KbCategoryInput) => void;
  onClose: () => void;
}

function CategoryDialog({ category, orgNodes, onSubmit, onClose }: CategoryDialogProps) {
  const [title, setTitle] = useState(category?.title ?? '');
  const [description, setDescription] = useState(category?.description ?? '');
  const [parentNodeId, setParentNodeId] = useState(category?.parentNodeId ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({ title: title.trim(), description: description.trim(), parentNodeId: parentNodeId || null });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="modal__title">{category ? 'Edytuj kategorię' : 'Nowa kategoria'}</h2>
        <label className="form-field">
          <span>Nazwa kategorii</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label className="form-field">
          <span>Opis</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} />
        </label>
        <label className="form-field">
          <span>Element mapy, pod który skan podpina nowe wpisy (opcjonalnie)</span>
          <select value={parentNodeId} onChange={(e) => setParentNodeId(e.target.value)}>
            <option value="">— brak —</option>
            {orgNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Anuluj
          </button>
          <button type="submit" className="btn btn--primary">
            {category ? 'Zapisz' : 'Dodaj'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Dialog wpisu
// ---------------------------------------------------------------------------

interface EntryDialogProps {
  entry?: KbEntry;
  orgNodes: OrgNode[];
  onSubmit: (input: KbEntryInput) => void;
  onClose: () => void;
}

function EntryDialog({ entry, orgNodes, onSubmit, onClose }: EntryDialogProps) {
  const [title, setTitle] = useState(entry?.title ?? '');
  const [short, setShort] = useState(entry?.short ?? '');
  const [status, setStatus] = useState(entry?.status ?? 'Szkic');
  const [nodeId, setNodeId] = useState(entry?.nodeId ?? '');
  const [summaryText, setSummaryText] = useState((entry?.summary ?? []).join('\n'));
  const [note, setNote] = useState(entry?.note ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!title.trim()) return;
    onSubmit({
      title: title.trim(),
      short: short.trim(),
      status: status.trim() || 'Szkic',
      note,
      summary: summaryText
        .split('\n')
        .map((s) => s.trim())
        .filter(Boolean),
      nodeId: nodeId || null,
    });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal modal--wide" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="modal__title">{entry ? 'Edytuj wpis' : 'Nowy wpis'}</h2>
        <label className="form-field">
          <span>Tytuł</span>
          <input value={title} onChange={(e) => setTitle(e.target.value)} required autoFocus />
        </label>
        <label className="form-field">
          <span>Krótki opis</span>
          <textarea value={short} onChange={(e) => setShort(e.target.value)} rows={2} />
        </label>
        <label className="form-field">
          <span>Status (np. „Notatka dodana 1:1”, „Szkic”)</span>
          <input value={status} onChange={(e) => setStatus(e.target.value)} />
        </label>
        <label className="form-field">
          <span>Powiązany element mapy (opcjonalnie — skan zaktualizuje ten element)</span>
          <select value={nodeId} onChange={(e) => setNodeId(e.target.value)}>
            <option value="">— brak (skan utworzy nowy element) —</option>
            {orgNodes.map((n) => (
              <option key={n.id} value={n.id}>
                {n.label}
              </option>
            ))}
          </select>
        </label>
        <label className="form-field">
          <span>Zakres roboczy (jedna linia = jeden punkt)</span>
          <textarea value={summaryText} onChange={(e) => setSummaryText(e.target.value)} rows={4} />
        </label>
        <label className="form-field">
          <span>Pełna notatka (markdown: nagłówki #, listy -, cytaty {'>'}, pogrubienie **)</span>
          <textarea value={note} onChange={(e) => setNote(e.target.value)} rows={12} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Anuluj
          </button>
          <button type="submit" className="btn btn--primary">
            {entry ? 'Zapisz' : 'Dodaj'}
          </button>
        </div>
      </form>
    </div>
  );
}

// ---------------------------------------------------------------------------
// Strona bazy wiedzy
// ---------------------------------------------------------------------------

export default function KnowledgeBaseDetailPage() {
  const { baseId, entryId } = useParams();
  const navigate = useNavigate();
  const kb = useKnowledgeBase();
  const org = useOrgData();

  const base = baseId ? kb.baseMap[baseId] : undefined;

  const [catDialog, setCatDialog] = useState<{ category?: KbCategory } | null>(null);
  const [entryDialog, setEntryDialog] = useState<{ categoryId: string; entry?: KbEntry } | null>(null);
  const [scanResult, setScanResult] = useState<string | null>(null);

  const current = useMemo(() => {
    if (!base || !entryId) return null;
    for (const category of base.categories) {
      const entry = category.entries.find((e) => e.id === entryId);
      if (entry) return { category, entry };
    }
    return null;
  }, [base, entryId]);

  const numbers = useMemo(() => {
    const map = new Map<string, number>();
    if (!base) return map;
    let n = 0;
    for (const c of base.categories) for (const e of c.entries) map.set(e.id, ++n);
    return map;
  }, [base]);

  if (!base) {
    return (
      <div className="kb-list-page">
        <div className="kb-list-page__inner">
          <div className="detail__empty">
            <strong>Nie znaleziono bazy wiedzy</strong>
            <Link className="btn btn--inline" to="/baza-wiedzy">
              Wróć do listy baz
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const entryCount = base.categories.reduce((n, c) => n + c.entries.length, 0);
  const noteCount = base.categories.reduce(
    (n, c) => n + c.entries.filter((e) => e.note.trim().length > 0).length,
    0,
  );
  const linkedCount = base.categories.reduce(
    (n, c) => n + c.entries.filter((e) => e.nodeId && org.nodeMap[e.nodeId]).length,
    0,
  );

  // Narzędzie skanujące: zczytuje dane z bazy wiedzy i uzupełnia je na platformie.
  // Wpis powiązany z elementem mapy aktualizuje jego opis i szczegóły; wpis bez
  // powiązania tworzy nowy element (pod elementem nadrzędnym kategorii).
  function handleScan() {
    let updated = 0;
    let created = 0;
    for (const category of base!.categories) {
      for (const entry of category.entries) {
        const existing = entry.nodeId ? org.nodeMap[entry.nodeId] : undefined;
        if (existing) {
          org.updateNode(existing.id, {
            label: existing.label,
            category: existing.category,
            level: existing.level,
            summary: entry.short || existing.summary,
            details: entry.summary,
            parentId: org.parentIdOf(existing.id),
          });
          updated++;
        } else {
          const parentId =
            category.parentNodeId && org.nodeMap[category.parentNodeId] ? category.parentNodeId : null;
          const newId = org.addNode({
            label: entry.title,
            category: 'podkonto',
            level: 1,
            summary: entry.short,
            details: entry.summary,
            parentId,
          });
          kb.updateEntry(base!.id, category.id, entry.id, { nodeId: newId });
          created++;
        }
      }
    }
    setScanResult(
      `Skanowanie zakończone: zaktualizowano ${updated} elementów platformy, utworzono ${created} nowych. Zmiany są widoczne na Mapie i w Strukturze.`,
    );
  }

  function submitCategory(input: KbCategoryInput) {
    const dialog = catDialog;
    if (!dialog) return;
    if (dialog.category) kb.updateCategory(base!.id, dialog.category.id, input);
    else kb.addCategory(base!.id, input);
    setCatDialog(null);
  }

  function submitEntry(input: KbEntryInput) {
    const dialog = entryDialog;
    if (!dialog) return;
    if (dialog.entry) {
      kb.updateEntry(base!.id, dialog.categoryId, dialog.entry.id, input);
    } else {
      const id = kb.addEntry(base!.id, dialog.categoryId, input);
      navigate(`/baza-wiedzy/${base!.id}/${id}`);
    }
    setEntryDialog(null);
  }

  function handleDeleteCategory(category: KbCategory) {
    if (
      window.confirm(
        `Usunąć kategorię „${category.title}” wraz z ${category.entries.length} wpisami?`,
      )
    ) {
      const containsCurrent = current && current.category.id === category.id;
      kb.deleteCategory(base!.id, category.id);
      if (containsCurrent) navigate(`/baza-wiedzy/${base!.id}`);
    }
  }

  function handleDeleteEntry(category: KbCategory, entry: KbEntry) {
    if (window.confirm(`Usunąć wpis „${entry.title}” z bazy wiedzy?`)) {
      kb.deleteEntry(base!.id, category.id, entry.id);
      if (entryId === entry.id) navigate(`/baza-wiedzy/${base!.id}`);
    }
  }

  const linkedNode = current?.entry.nodeId ? org.nodeMap[current.entry.nodeId] : undefined;

  return (
    <div className="kb">
      <aside className="kb__sidebar">
        <div className="kb__brand">
          <p className="kb__kicker">
            <Link to="/baza-wiedzy">Baza wiedzy</Link> · {base.categories.length} kategorie
          </p>
          <h1>{base.name}</h1>
          <p className="kb__desc">{base.description}</p>
          <div className="kb__brand-actions">
            <button className="btn" onClick={() => navigate(`/baza-wiedzy/${base.id}`)}>
              Indeks
            </button>
            <button
              className="btn btn--primary"
              onClick={handleScan}
              title="Zczytaj dane z bazy wiedzy i uzupełnij je na mapie oraz w strukturze"
            >
              Skanuj → platforma
            </button>
          </div>
        </div>

        {base.categories.map((category) => (
          <div className="kb-cat" key={category.id}>
            <div className="kb-cat__head">
              <span className="kb-cat__title">{category.title}</span>
              <span className="kb-cat__actions">
                <button
                  className="icon-btn"
                  onClick={() => setCatDialog({ category })}
                  title="Edytuj kategorię"
                >
                  ✎
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleDeleteCategory(category)}
                  title="Usuń kategorię"
                >
                  ✕
                </button>
              </span>
            </div>
            <div className="kb-cat__list">
              {category.entries.map((entry) => (
                <button
                  key={entry.id}
                  className={`kb-entry-btn${entryId === entry.id ? ' kb-entry-btn--active' : ''}`}
                  onClick={() => navigate(`/baza-wiedzy/${base.id}/${entry.id}`)}
                >
                  <span className="kb-entry-btn__num">{numbers.get(entry.id)}</span>
                  <span>
                    <span className="kb-entry-btn__title">{entry.title}</span>
                    <span className="kb-entry-btn__short">{entry.short}</span>
                  </span>
                </button>
              ))}
              <button
                className="btn btn--inline"
                onClick={() => setEntryDialog({ categoryId: category.id })}
              >
                + Dodaj wpis
              </button>
            </div>
          </div>
        ))}

        <button className="btn kb-add-cat" onClick={() => setCatDialog({})}>
          + Nowa kategoria
        </button>
      </aside>

      <main className="kb__content">
        {scanResult && (
          <div className="kb-scan-banner">
            <span>{scanResult}</span>
            <button onClick={() => setScanResult(null)} aria-label="Zamknij">
              ✕
            </button>
          </div>
        )}

        {current ? (
          <article className="kb-article">
            <header className="kb-article__head">
              <div>
                <span className="kb-badge">{current.entry.status}</span>
                <h2>{current.entry.title}</h2>
                <p className="kb-article__meta">
                  {current.category.title} — {current.category.description}
                </p>
                {linkedNode && (
                  <p className="kb-article__meta kb-article__linked">
                    Powiązane z mapą: <span className="tag">{linkedNode.label}</span>
                  </p>
                )}
              </div>
              <div className="kb-article__actions">
                <button
                  className="icon-btn"
                  onClick={() =>
                    setEntryDialog({ categoryId: current.category.id, entry: current.entry })
                  }
                >
                  ✎ Edytuj
                </button>
                <button
                  className="icon-btn icon-btn--danger"
                  onClick={() => handleDeleteEntry(current.category, current.entry)}
                >
                  ✕ Usuń
                </button>
              </div>
            </header>

            {current.entry.summary.length > 0 && (
              <div className="kb-summary">
                {current.entry.summary.map((item, i) => (
                  <div className="kb-sum-card" key={i}>
                    {item}
                  </div>
                ))}
              </div>
            )}

            {current.entry.note.trim() ? (
              <MarkdownLite text={current.entry.note} />
            ) : (
              <p className="section__empty">
                Brak pełnej notatki — dodaj treść przyciskiem „Edytuj”.
              </p>
            )}
          </article>
        ) : (
          <>
            <section className="kb-hero">
              <p className="kb__kicker">Panel bazy wiedzy</p>
              <h2>{base.name}</h2>
              <p>{base.description}</p>
            </section>
            <section className="kb-stats">
              <div className="kb-stat">
                <strong>{base.categories.length}</strong>
                <span>kategorie</span>
              </div>
              <div className="kb-stat">
                <strong>{entryCount}</strong>
                <span>wpisy</span>
              </div>
              <div className="kb-stat">
                <strong>{noteCount}</strong>
                <span>pełne notatki</span>
              </div>
              <div className="kb-stat">
                <strong>{linkedCount}</strong>
                <span>powiązane z mapą</span>
              </div>
            </section>
            {base.categories.map((category) => (
              <section className="section" key={category.id}>
                <h3 className="kb-index-cat">{category.title}</h3>
                <p className="section__intro">{category.description}</p>
                {category.entries.length > 0 ? (
                  <div className="card-grid">
                    {category.entries.map((entry) => (
                      <Link
                        className="card card--link"
                        to={`/baza-wiedzy/${base.id}/${entry.id}`}
                        key={entry.id}
                      >
                        <h4 className="card__title">
                          {numbers.get(entry.id)}. {entry.title}
                        </h4>
                        <p className="card__summary">{entry.short}</p>
                        <span className="kb-badge kb-badge--small">{entry.status}</span>
                      </Link>
                    ))}
                  </div>
                ) : (
                  <p className="section__empty">Brak wpisów w tej kategorii.</p>
                )}
              </section>
            ))}
          </>
        )}
      </main>

      {catDialog && (
        <CategoryDialog
          category={catDialog.category}
          orgNodes={org.nodes}
          onSubmit={submitCategory}
          onClose={() => setCatDialog(null)}
        />
      )}
      {entryDialog && (
        <EntryDialog
          entry={entryDialog.entry}
          orgNodes={org.nodes}
          onSubmit={submitEntry}
          onClose={() => setEntryDialog(null)}
        />
      )}
    </div>
  );
}
