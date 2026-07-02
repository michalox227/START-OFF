import { useState, type FormEvent } from 'react';
import { Link } from 'react-router-dom';
import type { KbBase } from '../data/knowledgeBase';
import { useKnowledgeBase, type KbBaseInput } from '../state/KnowledgeBaseContext';

interface BaseDialogProps {
  base?: KbBase;
  onSubmit: (input: KbBaseInput) => void;
  onClose: () => void;
}

function BaseDialog({ base, onSubmit, onClose }: BaseDialogProps) {
  const [name, setName] = useState(base?.name ?? '');
  const [description, setDescription] = useState(base?.description ?? '');

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    if (!name.trim()) return;
    onSubmit({ name: name.trim(), description: description.trim() });
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal" onClick={(e) => e.stopPropagation()} onSubmit={handleSubmit}>
        <h2 className="modal__title">{base ? 'Edytuj bazę wiedzy' : 'Nowa baza wiedzy'}</h2>
        <label className="form-field">
          <span>Nazwa</span>
          <input value={name} onChange={(e) => setName(e.target.value)} required autoFocus />
        </label>
        <label className="form-field">
          <span>Opis</span>
          <textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={3} />
        </label>
        <div className="form-actions">
          <button type="button" className="btn" onClick={onClose}>
            Anuluj
          </button>
          <button type="submit" className="btn btn--primary">
            {base ? 'Zapisz' : 'Dodaj'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function KnowledgeBasePage() {
  const { bases, addBase, updateBase, deleteBase, resetToDefault } = useKnowledgeBase();
  const [dialog, setDialog] = useState<{ base?: KbBase } | null>(null);

  function handleSubmit(input: KbBaseInput) {
    if (dialog?.base) updateBase(dialog.base.id, input);
    else addBase(input);
    setDialog(null);
  }

  function handleDelete(base: KbBase) {
    const entryCount = base.categories.reduce((n, c) => n + c.entries.length, 0);
    if (
      window.confirm(
        `Usunąć bazę wiedzy „${base.name}” (${base.categories.length} kategorii, ${entryCount} wpisów)?`,
      )
    ) {
      deleteBase(base.id);
    }
  }

  function handleReset() {
    if (window.confirm('Przywrócić domyślne bazy wiedzy? Wszystkie Twoje zmiany zostaną utracone.')) {
      resetToDefault();
    }
  }

  return (
    <div className="kb-list-page">
      <div className="kb-list-page__inner">
        <section className="kb-hero">
          <p className="kb__kicker">Baza wiedzy</p>
          <h2>Bazy wiedzy platformy</h2>
          <p>
            Pełne opisy funkcjonalne zasilające platformę. Każda kategoria ma podstronę z pełnym
            zakresem informacji, a narzędzie „Skanuj” zczytuje dane i uzupełnia je w całej
            platformie — na mapie i w strukturze.
          </p>
          <div className="kb-hero__actions">
            <button className="btn" onClick={() => setDialog({})}>
              + Nowa baza wiedzy
            </button>
            <button className="btn" onClick={handleReset}>
              Przywróć domyślne
            </button>
          </div>
        </section>

        <div className="card-grid">
          {bases.map((base) => {
            const entryCount = base.categories.reduce((n, c) => n + c.entries.length, 0);
            return (
              <div className="card kb-base-card" key={base.id}>
                <div className="card__head">
                  <h3 className="card__title">{base.name}</h3>
                  <div className="card__actions">
                    <button className="icon-btn" onClick={() => setDialog({ base })} title="Edytuj bazę">
                      ✎
                    </button>
                    <button
                      className="icon-btn icon-btn--danger"
                      onClick={() => handleDelete(base)}
                      title="Usuń bazę"
                    >
                      ✕
                    </button>
                  </div>
                </div>
                <p className="card__summary">{base.description}</p>
                <div className="card__children">
                  <span className="tag">{base.categories.length} kategorie</span>
                  <span className="tag">{entryCount} wpisów</span>
                </div>
                <Link className="btn btn--inline kb-base-card__open" to={`/baza-wiedzy/${base.id}`}>
                  Otwórz bazę →
                </Link>
              </div>
            );
          })}
        </div>

        {bases.length === 0 && (
          <p className="section__empty">Brak baz wiedzy — dodaj pierwszą przyciskiem powyżej.</p>
        )}
      </div>

      {dialog && <BaseDialog base={dialog.base} onSubmit={handleSubmit} onClose={() => setDialog(null)} />}
    </div>
  );
}
