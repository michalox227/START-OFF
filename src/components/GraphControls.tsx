interface Props {
  distanceLevel: number;
  labelLevel: number;
  onDistanceChange: (level: number) => void;
  onLabelChange: (level: number) => void;
}

export default function GraphControls({ distanceLevel, labelLevel, onDistanceChange, onLabelChange }: Props) {
  return (
    <div className="graph-controls">
      <p className="graph-controls__title">Widok grafu</p>

      <label className="graph-controls__row">
        <span className="graph-controls__label">
          Odległość między obiektami
          <span className="graph-controls__value">{distanceLevel}/5</span>
        </span>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          list="graph-controls-scale"
          value={distanceLevel}
          onChange={(e) => onDistanceChange(Number(e.target.value))}
        />
      </label>

      <label className="graph-controls__row">
        <span className="graph-controls__label">
          Rozmiar napisów
          <span className="graph-controls__value">{labelLevel}/5</span>
        </span>
        <input
          type="range"
          min={1}
          max={5}
          step={1}
          list="graph-controls-scale"
          value={labelLevel}
          onChange={(e) => onLabelChange(Number(e.target.value))}
        />
      </label>

      <datalist id="graph-controls-scale">
        <option value="1" />
        <option value="2" />
        <option value="3" />
        <option value="4" />
        <option value="5" />
      </datalist>
    </div>
  );
}
