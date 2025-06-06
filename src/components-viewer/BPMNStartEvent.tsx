import type { BPMNElement } from './types/bpmnTypes';

const BPMNStartEvent: React.FC<{ element: BPMNElement; onClick: () => void; selected: boolean }> = ({ element, onClick, selected }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <circle
      cx={element.position.x + element.dimensions.width / 2}
      cy={element.position.y + element.dimensions.height / 2}
      r={element.dimensions.width / 2}
      fill="#e8f5e8"
      stroke={selected ? "#4CAF50" : "#2E7D32"}
      strokeWidth={selected ? 3 : 2}
    />
    <text
      x={element.position.x + element.dimensions.width / 2}
      y={element.position.y + element.dimensions.height + 20}
      textAnchor="middle"
      fontSize="12"
      fill="#333"
    >
      {element.name || element.id}
    </text>
  </g>
);

export default BPMNStartEvent;