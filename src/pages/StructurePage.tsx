import { CATEGORY_MAP } from '../data/categories';
import { NODE_MAP, structuralChildren, type OrgNode } from '../data/organization';

interface SectionDef {
  heading: string;
  intro: string;
  nodeIds: string[];
}

const SECTIONS: SectionDef[] = [
  {
    heading: 'Rdzeń',
    intro: 'Centralny CRM spinający wszystkie konta, działy i warstwę AI w jedną platformę.',
    nodeIds: ['crm'],
  },
  {
    heading: 'Warstwa AI',
    intro:
      'Cała organizacja działa w modelu AI-first. Najwyższy Master Agent CRM administruje master agentami poszczególnych typów kont, a każdy użytkownik i dział ma własnego asystenta AI.',
    nodeIds: [
      'agent-master-crm',
      'agent-master-prac',
      'agent-master-uzyt',
      'agent-master-firma',
      'agent-master-partner',
    ],
  },
  {
    heading: 'Organizacja (nasz zespół)',
    intro: 'Sześć obszarów prowadzących projekt. Każdy dział ma indywidualnego asystenta AI.',
    nodeIds: ['dz-it', 'dz-sprzedaz', 'dz-marketing', 'dz-hr', 'dz-finanse', 'dz-zarzad'],
  },
  {
    heading: 'Konta użytkowników',
    intro:
      'Typy kont dostępne na platformie wraz z ich wariantami. Każde konto ma indywidualnego asystenta AI łączącego się z master agentem swojego typu.',
    nodeIds: ['konto-prac', 'konto-uzyt', 'konto-firma', 'konto-partner'],
  },
];

function Card({ node }: { node: OrgNode }) {
  const meta = CATEGORY_MAP[node.category];
  const children = structuralChildren(node.id);
  return (
    <div className="card" style={{ borderLeftColor: meta.color }}>
      <h3 className="card__title">{node.label}</h3>
      <p className="card__summary">{node.summary}</p>
      {children.length > 0 && (
        <div className="card__children">
          {children.map((c) => (
            <span key={c.id} className="tag">
              {c.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

export default function StructurePage() {
  return (
    <div className="structure">
      <div className="structure__inner">
        <p className="structure__lead">
          Model organizacji Grantland w formie czytelnego konspektu. Ten sam zestaw danych zasila
          interaktywną <strong>Mapę</strong> — dzięki temu wizualizację łatwo rozbudowywać i
          reużywać w innych repozytoriach.
        </p>
        {SECTIONS.map((section) => (
          <section key={section.heading} className="section">
            <h2 className="section__heading">{section.heading}</h2>
            <p className="section__intro">{section.intro}</p>
            <div className="card-grid">
              {section.nodeIds
                .map((id) => NODE_MAP[id])
                .filter(Boolean)
                .map((node) => (
                  <Card key={node.id} node={node} />
                ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}
