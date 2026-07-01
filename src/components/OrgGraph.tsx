import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import ForceGraph2D from 'react-force-graph-2d';
import { CATEGORY_MAP, type CategoryId } from '../data/categories';
import { LINKS, NODES, type OrgLink, type OrgNode } from '../data/organization';
import { useMeasure } from '../hooks/useMeasure';

type GraphNode = OrgNode & { x?: number; y?: number };

interface Props {
  activeCategories: Set<CategoryId>;
  selectedId: string | null;
  onSelect: (id: string | null) => void;
  /** Sygnał z zewnątrz (np. przycisk „Dopasuj widok”). */
  fitSignal: number;
}

function radiusFor(level: number): number {
  return level >= 3 ? 7 : level >= 2 ? 5 : 3.4;
}

export default function OrgGraph({ activeCategories, selectedId, onSelect, fitSignal }: Props) {
  const { ref, width, height } = useMeasure<HTMLDivElement>();
  const fgRef = useRef<any>(null);
  const [hoverId, setHoverId] = useState<string | null>(null);
  const needFit = useRef(true);

  // Dane grafu przefiltrowane po aktywnych kategoriach.
  const graphData = useMemo(() => {
    const visible = NODES.filter((n) => activeCategories.has(n.category));
    const ids = new Set(visible.map((n) => n.id));
    const links = LINKS.filter((l) => ids.has(l.source) && ids.has(l.target)).map((l) => ({
      ...l,
    }));
    // Kopie węzłów, aby symulacja nie mutowała współdzielonych obiektów.
    return { nodes: visible.map((n) => ({ ...n })) as GraphNode[], links };
  }, [activeCategories]);

  // Mapa sąsiedztwa do podświetlania powiązań.
  const adjacency = useMemo(() => {
    const map = new Map<string, Set<string>>();
    for (const n of NODES) map.set(n.id, new Set());
    for (const l of LINKS) {
      map.get(l.source)?.add(l.target);
      map.get(l.target)?.add(l.source);
    }
    return map;
  }, []);

  const focusId = hoverId ?? selectedId;
  const highlightNodes = useMemo(() => {
    if (!focusId) return null;
    const set = new Set<string>([focusId]);
    adjacency.get(focusId)?.forEach((id) => set.add(id));
    return set;
  }, [focusId, adjacency]);

  const isLinkActive = useCallback(
    (l: OrgLink) => {
      if (!highlightNodes) return false;
      const s = typeof l.source === 'object' ? (l.source as any).id : l.source;
      const t = typeof l.target === 'object' ? (l.target as any).id : l.target;
      return highlightNodes.has(s) && highlightNodes.has(t);
    },
    [highlightNodes],
  );

  // Konfiguracja sił — układ zbliżony do grafu Obsidian.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg) return;
    fg.d3Force('charge')?.strength(-160).distanceMax(320);
    fg.d3Force('link')?.distance((l: OrgLink) => (l.kind === 'ai' ? 70 : 52));
  }, []);

  // Po każdej zmianie danych — dopasuj widok przy kolejnym zatrzymaniu silnika.
  useEffect(() => {
    needFit.current = true;
  }, [graphData]);

  // Zewnętrzny sygnał „Dopasuj widok”.
  useEffect(() => {
    if (fitSignal === 0) return;
    fgRef.current?.zoomToFit(500, 70);
  }, [fitSignal]);

  // Delikatne odświeżenie płótna, gdy zmienia się podświetlenie sterowane z Reacta.
  useEffect(() => {
    const fg = fgRef.current;
    if (!fg || typeof fg.zoom !== 'function') return;
    try {
      fg.zoom(fg.zoom(), 0);
    } catch {
      /* no-op */
    }
  }, [selectedId]);

  const paintNode = useCallback(
    (node: GraphNode, ctx: CanvasRenderingContext2D, globalScale: number) => {
      const meta = CATEGORY_MAP[node.category];
      const r = radiusFor(node.level);
      const isSelected = node.id === selectedId;
      const dim = highlightNodes ? !highlightNodes.has(node.id) : false;
      const x = node.x ?? 0;
      const y = node.y ?? 0;

      ctx.globalAlpha = dim ? 0.18 : 1;

      // Poświata
      ctx.shadowColor = meta.color;
      ctx.shadowBlur = isSelected ? 22 : node.id === focusId ? 16 : 7;

      ctx.beginPath();
      ctx.arc(x, y, r, 0, 2 * Math.PI);
      ctx.fillStyle = meta.color;
      ctx.fill();
      ctx.shadowBlur = 0;

      // Pierścień zaznaczenia
      if (isSelected) {
        ctx.beginPath();
        ctx.arc(x, y, r + 2.6, 0, 2 * Math.PI);
        ctx.strokeStyle = '#ffffff';
        ctx.lineWidth = 1.2;
        ctx.stroke();
      }

      // Etykieta
      const showLabel =
        node.level >= 3 ||
        node.id === focusId ||
        isSelected ||
        (highlightNodes?.has(node.id) ?? false) ||
        (node.level >= 2 && globalScale > 1.6) ||
        globalScale > 3.2;

      if (showLabel) {
        const fontSize = Math.max(11 / globalScale, 2.6);
        ctx.font = `${node.level >= 3 ? 700 : 600} ${fontSize}px Inter, system-ui, sans-serif`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'top';
        ctx.fillStyle = dim ? 'rgba(231,233,240,0.35)' : '#e7e9f0';
        ctx.shadowColor = 'rgba(0,0,0,0.9)';
        ctx.shadowBlur = 4;
        ctx.fillText(node.label, x, y + r + 1.5);
        ctx.shadowBlur = 0;
      }

      ctx.globalAlpha = 1;
    },
    [selectedId, highlightNodes, focusId],
  );

  const paintPointerArea = useCallback(
    (node: GraphNode, color: string, ctx: CanvasRenderingContext2D) => {
      const r = radiusFor(node.level) + 3;
      ctx.beginPath();
      ctx.arc(node.x ?? 0, node.y ?? 0, r, 0, 2 * Math.PI);
      ctx.fillStyle = color;
      ctx.fill();
    },
    [],
  );

  return (
    <div
      ref={ref}
      className="map__canvas"
      style={{ cursor: hoverId ? 'pointer' : 'grab' }}
    >
      {width > 0 && height > 0 && (
        <ForceGraph2D
          ref={fgRef}
          width={width}
          height={height}
          graphData={graphData}
          backgroundColor="rgba(0,0,0,0)"
          nodeId="id"
          nodeRelSize={5}
          nodeVal={(n: GraphNode) => n.level * n.level}
          cooldownTicks={120}
          d3VelocityDecay={0.28}
          warmupTicks={40}
          onEngineStop={() => {
            if (needFit.current) {
              fgRef.current?.zoomToFit(500, 70);
              needFit.current = false;
            }
          }}
          nodeCanvasObject={paintNode}
          nodePointerAreaPaint={paintPointerArea}
          linkColor={(l: OrgLink) =>
            isLinkActive(l)
              ? l.kind === 'ai'
                ? 'rgba(94,234,212,0.85)'
                : 'rgba(255,255,255,0.75)'
              : highlightNodes
                ? 'rgba(255,255,255,0.05)'
                : 'rgba(255,255,255,0.14)'
          }
          linkWidth={(l: OrgLink) => (isLinkActive(l) ? 1.8 : 0.7)}
          linkLineDash={(l: OrgLink) => (l.kind === 'ai' ? [3, 3] : null)}
          linkDirectionalParticles={(l: OrgLink) => (isLinkActive(l) && l.kind === 'ai' ? 3 : 0)}
          linkDirectionalParticleWidth={2}
          linkDirectionalParticleSpeed={0.007}
          onNodeHover={(n: GraphNode | null) => setHoverId(n ? n.id : null)}
          onNodeClick={(n: GraphNode) => {
            onSelect(n.id);
            const fg = fgRef.current;
            if (fg && n.x != null && n.y != null) fg.centerAt(n.x, n.y, 500);
          }}
          onBackgroundClick={() => onSelect(null)}
        />
      )}
    </div>
  );
}
