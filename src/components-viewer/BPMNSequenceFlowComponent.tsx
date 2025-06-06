import type { BPMNElement, BPMNSequenceFlow } from './types/bpmnTypes';

const BPMNSequenceFlowComponent: React.FC<{ flow: BPMNSequenceFlow; elements: BPMNElement[] }> = ({ flow, elements }) => {
  const sourceElement = elements.find(el => el.id === flow.sourceRef);
  const targetElement = elements.find(el => el.id === flow.targetRef);
  
  if (!sourceElement || !targetElement) return null;
  
  const startX = sourceElement.position.x + sourceElement.dimensions.width / 2;
  const startY = sourceElement.position.y + sourceElement.dimensions.height / 2;
  const endX = targetElement.position.x + targetElement.dimensions.width / 2;
  const endY = targetElement.position.y + targetElement.dimensions.height / 2;
  
  // Calculate arrow head
  const angle = Math.atan2(endY - startY, endX - startX);
  const arrowLength = 15;
  const arrowAngle = Math.PI / 6;
  
  const arrowX1 = endX - arrowLength * Math.cos(angle - arrowAngle);
  const arrowY1 = endY - arrowLength * Math.sin(angle - arrowAngle);
  const arrowX2 = endX - arrowLength * Math.cos(angle + arrowAngle);
  const arrowY2 = endY - arrowLength * Math.sin(angle + arrowAngle);
  
  return (
    <g>
      <line
        x1={startX}
        y1={startY}
        x2={endX}
        y2={endY}
        stroke="#666"
        strokeWidth={2}
        markerEnd="url(#arrowhead)"
      />
      <polygon
        points={`${endX},${endY} ${arrowX1},${arrowY1} ${arrowX2},${arrowY2}`}
        fill="#666"
      />
      {flow.name && (
        <text
          x={(startX + endX) / 2}
          y={(startY + endY) / 2 - 10}
          textAnchor="middle"
          fontSize="10"
          fill="#666"
        >
          {flow.name}
        </text>
      )}
    </g>
  );
};

export default BPMNSequenceFlowComponent;