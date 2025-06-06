import type { BPMNElement } from './types/bpmnTypes';

const BPMNTask: React.FC<{ element: BPMNElement; onClick: () => void; selected: boolean }> = ({ element, onClick, selected }) => (
  <g onClick={onClick} style={{ cursor: 'pointer' }}>
    <rect
      x={element.position.x}
      y={element.position.y}
      width={element.dimensions.width}
      height={element.dimensions.height}
      rx={10}
      fill="#e3f2fd"
      stroke={selected ? "#2196f3" : "#1976d2"}
      strokeWidth={selected ? 3 : 2}
    />
    <text
      x={element.position.x + element.dimensions.width / 2}
      y={element.position.y + element.dimensions.height / 2}
      textAnchor="middle"
      dominantBaseline="middle"
      fontSize="12"
      fill="#333"
    >
      {element.name || element.id}
    </text>
    {element.type === 'userTask' && (
      <circle
        cx={element.position.x + 15}
        cy={element.position.y + 15}
        r={8}
        fill="#fff"
        stroke="#1976d2"
        strokeWidth={2}
      />
    )}
  </g>
);

export default BPMNTask;