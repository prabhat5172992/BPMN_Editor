import React, { memo } from 'react';
import type { BPMNElement } from './bpmnTypes/types';

// BPMN Element Components (Memoized for performance)
// BPMN Element Components (Memoized for performance)
const BPMNElementComponent = memo(function BPMNElementComponent({ 
  element, onClick, selected, onDragStart 
}: { 
  element: BPMNElement; 
  onClick: (e: React.MouseEvent) => void; 
  selected: boolean;
  onDragStart: (e: React.MouseEvent) => void;
}) {

  const renderElement = () => {
    const commonProps = {
      onMouseDown: onDragStart,
      onClick: onClick,
      style: { cursor: selected ? 'move' : 'pointer' }
    };
    
    switch (element.type) {
      case 'startEvent':
        return (
          <g {...commonProps}>
            <circle cx={element.position.x + element.dimensions.width / 2} cy={element.position.y + element.dimensions.height / 2} r={element.dimensions.width / 2} fill="#e8f5e9" stroke="#388e3c" strokeWidth={2} />
          </g>
        );
      case 'endEvent':
        return (
          <g {...commonProps}>
            <circle cx={element.position.x + element.dimensions.width / 2} cy={element.position.y + element.dimensions.height / 2} r={element.dimensions.width / 2} fill="#ffebee" stroke="#c62828" strokeWidth={4} />
          </g>
        );
      case 'task': case 'userTask': case 'serviceTask':
        // Simple word wrapping logic for task names
        const words = (element.name || '').split(' ');
        const lines: string[] = [];
        let currentLine = '';
        const maxWidth = element.dimensions.width - 20; // Padding inside the box

        words.forEach(word => {
            const testLine = currentLine ? `${currentLine} ${word}` : word;
            // This is a rough estimation of text width. For perfect accuracy, canvas measurement would be needed.
            if ((testLine.length * 7) > maxWidth && currentLine) {
                lines.push(currentLine);
                currentLine = word;
            } else {
                currentLine = testLine;
            }
        });
        lines.push(currentLine);

        const centerX = element.position.x + element.dimensions.width / 2;
        const centerY = element.position.y + element.dimensions.height / 2;
        const lineHeight = 14;
        const totalTextHeight = lines.length * lineHeight;
        const startY = centerY - totalTextHeight / 2 + lineHeight / 1.5;

        return (
          <g {...commonProps}>
            <rect x={element.position.x} y={element.position.y} width={element.dimensions.width} height={element.dimensions.height} rx={10} fill="#e3f2fd" stroke="#1976d2" strokeWidth={2} />
            {element.type === 'userTask' && <path d={`M${element.position.x+8},${element.position.y+18} a6,6 0 1,0 12,0 a6,6 0 1,0 -12,0 M${element.position.x+14},${element.position.y+14} a4,4 0 1,1 0,-8 a4,4 0 0,1 0,8`} fill="none" stroke="#1976d2" strokeWidth={1.5} />}
            {element.type === 'serviceTask' && <path d={`M${element.position.x+8},${element.position.y+10} l4,0 a3,3 0 0,1 0,6 l-4,0 M${element.position.x+14},${element.position.y+10} a3,3 0 0,1 3,3 a3,3 0 0,1 -3,3`} fill="none" stroke="#1976d2" strokeWidth={1.5} />}
            
            <text
                x={centerX}
                y={startY}
                textAnchor="middle"
                fontSize="12"
                fill="#333"
                pointerEvents="none"
                style={{ userSelect: 'none' }}
            >
              {lines.map((line, index) => (
                <tspan key={index} x={centerX} dy={index > 0 ? lineHeight : 0}>
                  {line}
                </tspan>
              ))}
            </text>
          </g>
        );
      case 'exclusiveGateway': case 'parallelGateway': case 'inclusiveGateway':
        const gatewayCenterX = element.position.x + element.dimensions.width / 2;
        const gatewayCenterY = element.position.y + element.dimensions.height / 2;
        const size = element.dimensions.width / 2;
        const points = [`${gatewayCenterX},${gatewayCenterY - size}`, `${gatewayCenterX + size},${gatewayCenterY}`, `${gatewayCenterX},${gatewayCenterY + size}`, `${gatewayCenterX - size},${gatewayCenterY}`].join(' ');
        
        const symbol = { exclusiveGateway: '×', parallelGateway: '+', inclusiveGateway: '○' }[element.type];
        
        return (
          <g {...commonProps}>
            <polygon points={points} fill="#fff3e0" stroke="#f57c00" strokeWidth={2} />
            <text x={gatewayCenterX} y={gatewayCenterY} textAnchor="middle" dominantBaseline="central" fontSize="24" fill="#f57c00" pointerEvents="none" style={{userSelect: 'none'}}>{symbol}</text>
          </g>
        );
      default: return null;
    }
  };
  
  const isTask = ['task', 'userTask', 'serviceTask'].includes(element.type);

  return (
    <g>
      {renderElement()}
      {/* Only render the name underneath if it is NOT a task-type element */}
      {!isTask && (
        <text 
          x={element.position.x + element.dimensions.width / 2} 
          y={element.position.y + element.dimensions.height + 15} 
          textAnchor="middle" 
          fontSize="12" 
          fill="#333" 
          pointerEvents="none" 
          style={{userSelect: 'none'}} 
        >
          {element.name}
        </text>
      )}
      {selected && <rect x={element.position.x - 5} y={element.position.y - 5} width={element.dimensions.width + 10} height={element.dimensions.height + 10} fill="none" stroke="#2196f3" strokeWidth={1} strokeDasharray="4,4" pointerEvents="none" />}
    </g>
  );
});

export default BPMNElementComponent;