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

type EditorMode = 'select' | 'pan' | 'connect' | 'startEvent' | 'endEvent' | 'task' | 'userTask' | 'serviceTask' | 'exclusiveGateway' | 'parallelGateway' | 'inclusiveGateway';

type ToolbarButtonProps = {
  icon: React.ReactNode;
  label: string;
  onClick: () => void;
  active?: boolean;
  disabled?: boolean;
};

interface BPMNEditorState {
  mode: EditorMode;
  selectedElementId?: string;
  elements: BPMNElement[];
  sequenceFlows: BPMNSequenceFlow[];
  process: BPMNProcess;
  collaboration?: {
    participants: Array<{
      id: string;
      name: string;
      processRef: string;
    }>;
  };
}

interface BPMNEditorContext {
  state: BPMNEditorState;
  dispatch: React.Dispatch<any>;
}

interface BPMNEditorProps {
  initialState?: BPMNEditorState;
  onChange?: (state: BPMNEditorState) => void;
}

interface BPMNEditorAction {
  type: string;
  payload?: any;
}

// Action Types
const BPMN_EDITOR_ACTIONS = {
  SET_MODE: 'SET_MODE',
  SELECT_ELEMENT: 'SELECT_ELEMENT',
  ADD_ELEMENT: 'ADD_ELEMENT',
  UPDATE_ELEMENT: 'UPDATE_ELEMENT',
  DELETE_ELEMENT: 'DELETE_ELEMENT',
  ADD_SEQUENCE_FLOW: 'ADD_SEQUENCE_FLOW',
  UPDATE_SEQUENCE_FLOW: 'UPDATE_SEQUENCE_FLOW',
  DELETE_SEQUENCE_FLOW: 'DELETE_SEQUENCE_FLOW',
  SET_PROCESS: 'SET_PROCESS',
  SET_COLLABORATION: 'SET_COLLABORATION',
  RESET: 'RESET',
};

// Utility Types
type BPMNElementType = BPMNElement['type'];
type BPMNElementWithId = BPMNElement & { id: string };
type BPMNSequenceFlowWithId = BPMNSequenceFlow & { id: string };
type BPMNProcessWithId = BPMNProcess & { id: string };
type BPMNDiagramWithId = BPMNDiagram & { id: string };


// Exporting the types for use in other components
export type {
  BPMNElement,
  BPMNSequenceFlow,
  BPMNProcess,
  BPMNDiagram,
  BPMNPosition,
  BPMNDimensions,
  EditorMode,
  BPMNEditorState,
  BPMNEditorContext,
  BPMNEditorProps,
  BPMNEditorAction,
  ToolbarButtonProps,
  BPMN_EDITOR_ACTIONS,
  BPMNElementType,
  BPMNElementWithId,
  BPMNSequenceFlowWithId,
  BPMNProcessWithId,
  BPMNDiagramWithId,
};
