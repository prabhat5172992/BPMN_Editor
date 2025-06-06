import type { BPMNDiagram, BPMNProcess, BPMNElement, BPMNSequenceFlow, BPMNPosition, BPMNDimensions } from './bpmnTypes/types';
import { generateId, getDefaultDimensions } from '../utils';

const parseXMLToBPMN = (xmlText: string): BPMNDiagram => {
  const parser = new DOMParser();
  const xmlDoc = parser.parseFromString(xmlText, 'text/xml');
  
  const parseError = xmlDoc.querySelector('parsererror');
  if (parseError) {
    throw new Error('XML Parsing Error: ' + parseError.textContent);
  }

  const processes: BPMNProcess[] = [];
  const processElements = Array.from(xmlDoc.getElementsByTagNameNS('*', 'process'));
  
  if (processElements.length === 0) {
      throw new Error("No <process> element found in the BPMN file.");
  }
  
  processElements.forEach(processEl => {
    const processId = processEl.getAttribute('id') || generateId();
    const processName = processEl.getAttribute('name') || '';
    
    const elements: BPMNElement[] = [];
    const sequenceFlows: BPMNSequenceFlow[] = [];
    
    const elementSelectors = [
      'startEvent', 'endEvent', 'task', 'userTask', 'serviceTask',
      'exclusiveGateway', 'parallelGateway', 'inclusiveGateway'
    ];
    
    elementSelectors.forEach(selector => {
      Array.from(processEl.getElementsByTagNameNS('*', selector)).forEach(el => {
        const id = el.getAttribute('id');
        if (!id) return; // Skip elements without an ID

        const name = el.getAttribute('name') || '';
        
        const bpmnShape = xmlDoc.querySelector(`[bpmnElement="${id}"]`);
        const bounds = bpmnShape?.getElementsByTagNameNS('*','Bounds')[0];
        
        const position: BPMNPosition = {
          x: parseFloat(bounds?.getAttribute('x') || '100'),
          y: parseFloat(bounds?.getAttribute('y') || '100')
        };
        
        const dimensions: BPMNDimensions = {
          width: parseFloat(bounds?.getAttribute('width') || getDefaultDimensions(selector as BPMNElement['type']).width.toString()),
          height: parseFloat(bounds?.getAttribute('height') || getDefaultDimensions(selector as BPMNElement['type']).height.toString())
        };
        
        elements.push({
          id,
          name,
          type: selector as BPMNElement['type'],
          position,
          dimensions,
          incoming: Array.from(el.getElementsByTagNameNS('*','incoming')).map(inc => inc.textContent || '').filter(Boolean),
          outgoing: Array.from(el.getElementsByTagNameNS('*','outgoing')).map(out => out.textContent || '').filter(Boolean)
        });
      });
    });
    
    Array.from(processEl.getElementsByTagNameNS('*','sequenceFlow')).forEach(flow => {
      const id = flow.getAttribute('id');
      if (!id) return;

      const name = flow.getAttribute('name') || '';
      const sourceRef = flow.getAttribute('sourceRef') || '';
      const targetRef = flow.getAttribute('targetRef') || '';
      
      if (!sourceRef || !targetRef) return; // A flow must have a source and target

      sequenceFlows.push({
        id,
        name,
        sourceRef,
        targetRef,
      });
    });
    
    processes.push({
      id: processId,
      name: processName,
      elements,
      sequenceFlows
    });
  });
  
  return { processes: processes.length > 0 ? processes : [{ id: generateId(), name: 'New Process', elements: [], sequenceFlows: [] }] };
};

export default parseXMLToBPMN;