import type { BPMNElement } from './types/bpmnTypes';

const BPMNGateway: React.FC<{ element: BPMNElement; onClick: () => void; selected: boolean }> = ({ element, onClick, selected }) => {
  const centerX = element.position.x + element.dimensions.width / 2;
  const centerY = element.position.y + element.dimensions.height / 2;
  const size = Math.min(element.dimensions.width, element.dimensions.height) / 2;
  
  const points = [
    `${centerX},${centerY - size}`,
    `${centerX + size},${centerY}`,
    `${centerX},${centerY + size}`,
    `${centerX - size},${centerY}`
  ].join(' ');
  
  let fillColor = '#fff3e0';
  let strokeColor = '#f57c00';
  
  if (element.type === 'parallelGateway') {
    fillColor = '#f3e5f5';
    strokeColor = '#7b1fa2';
  } else if (element.type === 'inclusiveGateway') {
    fillColor = '#e8f5e8';
    strokeColor = '#388e3c';
  }
  
  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <polygon
        points={points}
        fill={fillColor}
        stroke={selected ? strokeColor : strokeColor}
        strokeWidth={selected ? 3 : 2}
      />
      {element.type === 'exclusiveGateway' && (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fill={strokeColor}
        >
          ×
        </text>
      )}
      {element.type === 'parallelGateway' && (
        <text
          x={centerX}
          y={centerY}
          textAnchor="middle"
          dominantBaseline="middle"
          fontSize="20"
          fill={strokeColor}
        >
          +
        </text>
      )}
      {element.type === 'inclusiveGateway' && (
        <circle
          cx={centerX}
          cy={centerY}
          r={8}
          fill="none"
          stroke={strokeColor}
          strokeWidth={3}
        />
      )}
      <text
        x={centerX}
        y={centerY + size + 20}
        textAnchor="middle"
        fontSize="12"
        fill="#333"
      >
        {element.name || element.id}
      </text>
    </g>
  );
};

export default BPMNGateway;