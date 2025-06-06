import type { BPMNDiagram, BPMNProcess, BPMNElement, BPMNSequenceFlow, BPMNPosition, BPMNDimensions } from './types/bpmnTypes';

const parseXMLToBPMN = (xmlText: string): BPMNDiagram => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  // Check for parsing errors
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('Invalid XML: ' + parseError.textContent);
  }

  const processes: BPMNProcess[] = [];
  const processElements = xmlDoc.querySelectorAll('process');
  
  processElements.forEach(processEl => {
    const processId = processEl.getAttribute('id') || '';
    const processName = processEl.getAttribute('name') || '';
    
    const elements: BPMNElement[] = [];
    const sequenceFlows: BPMNSequenceFlow[] = [];
    
    // Parse elements
    const elementSelectors = [
      'startEvent', 'endEvent', 'task', 'userTask', 'serviceTask',
      'exclusiveGateway', 'parallelGateway', 'inclusiveGateway'
    ];
    
    elementSelectors.forEach(selector => {
      processEl.querySelectorAll(selector).forEach(el => {
        const id = el.getAttribute('id') || '';
        const name = el.getAttribute('name') || '';
        
        // Get diagram info
        const bpmnShape = xmlDoc.querySelector(`BPMNShape[bpmnElement="${id}"]`);
        const bounds = bpmnShape?.querySelector('Bounds');
        
        const position: BPMNPosition = {
          x: parseFloat(bounds?.getAttribute('x') || '0'),
          y: parseFloat(bounds?.getAttribute('y') || '0')
        };
        
        const dimensions: BPMNDimensions = {
          width: parseFloat(bounds?.getAttribute('width') || '100'),
          height: parseFloat(bounds?.getAttribute('height') || '80')
        };
        
        elements.push({
          id,
          name,
          type: selector as BPMNElement['type'],
          position,
          dimensions,
          incoming: Array.from(el.querySelectorAll('incoming')).map(inc => inc.textContent || ''),
          outgoing: Array.from(el.querySelectorAll('outgoing')).map(out => out.textContent || '')
        });
      });
    });
    
    // Parse sequence flows
    processEl.querySelectorAll('sequenceFlow').forEach(flow => {
      const id = flow.getAttribute('id') || '';
      const name = flow.getAttribute('name') || '';
      const sourceRef = flow.getAttribute('sourceRef') || '';
      const targetRef = flow.getAttribute('targetRef') || '';
      
      // Get waypoints from diagram
      const bpmnEdge = xmlDoc.querySelector(`BPMNEdge[bpmnElement="${id}"]`);
      const waypoints: BPMNPosition[] = [];
      
      bpmnEdge?.querySelectorAll('waypoint').forEach(wp => {
        waypoints.push({
          x: parseFloat(wp.getAttribute('x') || '0'),
          y: parseFloat(wp.getAttribute('y') || '0')
        });
      });
      
      sequenceFlows.push({
        id,
        name,
        sourceRef,
        targetRef,
        waypoints
      });
    });
    
    processes.push({
      id: processId,
      name: processName,
      elements,
      sequenceFlows
    });
  });
  
  return { processes };
};

export default parseXMLToBPMN;