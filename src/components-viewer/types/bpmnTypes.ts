// BPMN Element Types
interface BPMNPosition {
  x: number;
  y: number;
}

interface BPMNDimensions {
  width: number;
  height: number;
}

interface BPMNElement {
  id: string;
  name?: string;
  type: 'startEvent' | 'endEvent' | 'task' | 'userTask' | 'serviceTask' | 'exclusiveGateway' | 'parallelGateway' | 'inclusiveGateway';
  position: BPMNPosition;
  dimensions: BPMNDimensions;
  incoming?: string[];
  outgoing?: string[];
}

interface BPMNSequenceFlow {
  id: string;
  name?: string;
  sourceRef: string;
  targetRef: string;
  waypoints?: BPMNPosition[];
}

interface BPMNProcess {
  id: string;
  name?: string;
  elements: BPMNElement[];
  sequenceFlows: BPMNSequenceFlow[];
}

interface BPMNDiagram {
  processes: BPMNProcess[];
  collaboration?: {
    id: string;
    participants: Array<{
      id: string;
      name: string;
      processRef: string;
    }>;
  };
}

export type { BPMNPosition, BPMNDimensions, BPMNElement, BPMNSequenceFlow, BPMNProcess, BPMNDiagram };