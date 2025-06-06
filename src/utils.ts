import type { BPMNElement, BPMNDimensions, BPMNPosition } from "./components/bpmnTypes/types";

const generateId = () => `id_${Date.now()}_${Math.random().toString(36).substring(2, 11)}`;

const getDefaultDimensions = (type: BPMNElement['type']): BPMNDimensions => {
  switch (type) {
    case 'startEvent':
    case 'endEvent':
      return { width: 36, height: 36 };
    case 'exclusiveGateway':
    case 'parallelGateway':
    case 'inclusiveGateway':
      return { width: 50, height: 50 };
    default:
      return { width: 100, height: 80 };
  }
};

const getDefaultPosition = (type: BPMNElement['type']): BPMNPosition => {
  switch (type) {
    case 'startEvent':
      return { x: 100, y: 100 };
    case 'endEvent':
      return { x: 400, y: 100 };
    case 'exclusiveGateway':
    case 'parallelGateway':
    case 'inclusiveGateway':
      return { x: 250, y: 100 };
    default:
      return { x: 200, y: 100 };
  }
};

const createElement = (type: BPMNElement['type'], name?: string): BPMNElement => {
  return {
    id: generateId(),
    type,
    name,
    position: getDefaultPosition(type),
    dimensions: getDefaultDimensions(type),
    incoming: [],
    outgoing: []
  };
};

export {
    generateId,
    getDefaultDimensions,
    getDefaultPosition,
    createElement
}