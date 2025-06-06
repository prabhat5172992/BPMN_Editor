import type { BPMNDiagram } from './bpmnTypes/types';
import { generateId } from '../utils';

const generateBPMNXML = (diagram: BPMNDiagram): string => {
  const process = diagram.processes[0];
  if (!process) return '';
  
  let xml = `<?xml version="1.0" encoding="UTF-8"?>
<bpmn:definitions xmlns:bpmn="http://www.omg.org/spec/BPMN/20100524/MODEL" 
                  xmlns:bpmndi="http://www.omg.org/spec/BPMN/20100524/DI" 
                  xmlns:dc="http://www.omg.org/spec/DD/20100524/DC" 
                  xmlns:di="http://www.omg.org/spec/DD/20100524/DI" 
                  id="Definitions_${generateId()}" 
                  targetNamespace="http://bpmn.io/schema/bpmn">
  <bpmn:process id="${process.id}" name="${process.name || ''}" isExecutable="true">`;
  
  process.elements.forEach(element => {
    const nameAttr = element.name ? ` name="${element.name}"` : '';
    xml += `
    <bpmn:${element.type} id="${element.id}"${nameAttr}>`;
    
    const incomings = process.sequenceFlows.filter(sf => sf.targetRef === element.id);
    const outgoings = process.sequenceFlows.filter(sf => sf.sourceRef === element.id);

    incomings.forEach(inc => { xml += `<bpmn:incoming>${inc.id}</bpmn:incoming>`; });
    outgoings.forEach(out => { xml += `<bpmn:outgoing>${out.id}</bpmn:outgoing>`; });
    
    xml += `
    </bpmn:${element.type}>`;
  });
  
  process.sequenceFlows.forEach(flow => {
    const nameAttr = flow.name ? ` name="${flow.name}"` : '';
    xml += `
    <bpmn:sequenceFlow id="${flow.id}"${nameAttr} sourceRef="${flow.sourceRef}" targetRef="${flow.targetRef}" />`;
  });
  
  xml += `
  </bpmn:process>
  <bpmndi:BPMNDiagram id="BPMNDiagram_${generateId()}">
    <bpmndi:BPMNPlane id="BPMNPlane_${generateId()}" bpmnElement="${process.id}">`;
  
  process.elements.forEach(element => {
    xml += `
      <bpmndi:BPMNShape id="BPMNShape_${element.id}" bpmnElement="${element.id}">
        <dc:Bounds x="${element.position.x}" y="${element.position.y}" width="${element.dimensions.width}" height="${element.dimensions.height}" />
      </bpmndi:BPMNShape>`;
  });
  
  process.sequenceFlows.forEach(flow => {
    const sourceEl = process.elements.find(el => el.id === flow.sourceRef);
    const targetEl = process.elements.find(el => el.id === flow.targetRef);
    
    if (sourceEl && targetEl) {
      const sourceX = sourceEl.position.x + sourceEl.dimensions.width / 2;
      const sourceY = sourceEl.position.y + sourceEl.dimensions.height / 2;
      const targetX = targetEl.position.x;
      const targetY = targetEl.position.y + targetEl.dimensions.height / 2;
      
      xml += `
      <bpmndi:BPMNEdge id="BPMNEdge_${flow.id}" bpmnElement="${flow.id}">
        <di:waypoint x="${sourceX}" y="${sourceY}" />
        <di:waypoint x="${targetX}" y="${targetY}" />
      </bpmndi:BPMNEdge>`;
    }
  });
  
  xml += `
    </bpmndi:BPMNPlane>
  </bpmndi:BPMNDiagram>
</bpmn:definitions>`;
  
  return new DOMParser().parseFromString(xml, "application/xml").documentElement.outerHTML; // Basic XML validation
};

export default generateBPMNXML;