import { memo } from 'react';
import type { BPMNSequenceFlow, BPMNElement } from './bpmnTypes/types';

const BPMNSequenceFlowComponent = memo(function BPMNSequenceFlowComponent({ 
  flow, elements, selected, onClick 
}: { 
  flow: BPMNSequenceFlow; 
  elements: BPMNElement[];
  selected: boolean;
  onClick: () => void;
}) {
  const sourceElement = elements.find(el => el.id === flow.sourceRef);
  const targetElement = elements.find(el => el.id === flow.targetRef);
  
  if (!sourceElement || !targetElement) return null;
  
  const getEdgePoint = (from: BPMNElement, to: BPMNElement) => {
    const fromX = from.position.x + from.dimensions.width / 2;
    const fromY = from.position.y + from.dimensions.height / 2;
    const toX = to.position.x + to.dimensions.width / 2;
    const toY = to.position.y + to.dimensions.height / 2;

    const dx = toX - fromX;
    const dy = toY - fromY;
    
    const w = from.dimensions.width / 2;
    const h = from.dimensions.height / 2;

    if (dx === 0 && dy === 0) return { x: fromX, y: fromY };

    const slope = dy / dx;
    
    if (Math.abs(slope) * w < h) {
      return {
        x: fromX + (dx > 0 ? w : -w),
        y: fromY + (dx > 0 ? w : -w) * slope
      };
    } else {
      return {
        x: fromX + (dy > 0 ? h : -h) / slope,
        y: fromY + (dy > 0 ? h : -h)
      };
    }
  };
  
  const start = getEdgePoint(sourceElement, targetElement);
  const end = getEdgePoint(targetElement, sourceElement);

  const angle = Math.atan2(end.y - start.y, end.x - start.x);
  const arrowLength = 10;
  const arrowAngle = Math.PI / 6;
  
  const arrowP1 = { x: end.x - arrowLength * Math.cos(angle - arrowAngle), y: end.y - arrowLength * Math.sin(angle - arrowAngle) };
  const arrowP2 = { x: end.x - arrowLength * Math.cos(angle + arrowAngle), y: end.y - arrowLength * Math.sin(angle + arrowAngle) };
  
  const pathData = `M${start.x},${start.y} L${end.x},${end.y}`;

  return (
    <g onClick={onClick} style={{ cursor: 'pointer' }}>
      <path d={pathData} stroke={selected ? "#2196f3" : "#333"} strokeWidth={selected ? 2.5 : 1.5} fill="none" />
      <polygon points={`${end.x},${end.y} ${arrowP1.x},${arrowP1.y} ${arrowP2.x},${arrowP2.y}`} fill={selected ? "#2196f3" : "#333"} />
      {flow.name && (
        <text x={(start.x + end.x) / 2} y={(start.y + end.y) / 2 - 10} textAnchor="middle" fontSize="11" fill="#444" style={{userSelect: 'none'}}>
          {flow.name}
        </text>
      )}
    </g>
  );
});

export default BPMNSequenceFlowComponent;