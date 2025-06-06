import { useState, useCallback, useRef, useEffect, useMemo } from 'react';
import { 
    Upload, 
    Download, 
    ZoomIn, 
    ZoomOut, 
    RotateCcw, 
    Play, 
    Square, 
    Circle, 
    Diamond, 
    ArrowRight, 
    Save, 
    FileText, 
    AlertTriangle, 
    CheckCircle 
} from 'lucide-react';
import BPMNStartEvent from './BPMNStartEvent';
import BPMNEndEvent from './BPMNEndEvent';
import BPMNTask from './BPMNTask';
import BPMNGateway from './BPMNGateway';
import BPMNSequenceFlowComponent from './BPMNSequenceFlowComponent';
import parseXMLToBPMN from './ParseXmlToBpmn';
import type { BPMNDiagram, BPMNElement } from './types/bpmnTypes';

const BPMNEditor: React.FC = () => {
  const [diagram, setDiagram] = useState<BPMNDiagram | null>(null);
  const [selectedElement, setSelectedElement] = useState<string | null>(null);
  const [zoom, setZoom] = useState(1);
  const [pan, setPan] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const svgRef = useRef<SVGSVGElement>(null);
  
  const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    
    // Validate file type
    if (!file.name.toLowerCase().endsWith('.bpmn') && !file.name.toLowerCase().endsWith('.xml')) {
      setError('Please upload a .bpmn or .xml file');
      return;
    }
    
    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      setError('File size must be less than 10MB');
      return;
    }
    
    const reader = new FileReader();
    reader.onload = (e) => {
      try {
        const xmlText = e.target?.result as string;
        if (!xmlText) throw new Error('Failed to read file');
        
        const parsedDiagram = parseXMLToBPMN(xmlText);
        setDiagram(parsedDiagram);
        setError(null);
        setSuccess('BPMN diagram loaded successfully!');
        
        // Auto-fit diagram
        setTimeout(() => {
          handleFitToView();
        }, 100);
        
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to parse BPMN file');
        setDiagram(null);
      }
    };
    
    reader.onerror = () => {
      setError('Failed to read file');
    };
    
    reader.readAsText(file);
  }, []);
  
  const handleFitToView = useCallback(() => {
    if (!diagram || !svgRef.current) return;
    
    const allElements = diagram.processes.flatMap(p => p.elements);
    if (allElements.length === 0) return;
    
    const minX = Math.min(...allElements.map(el => el.position.x));
    const minY = Math.min(...allElements.map(el => el.position.y));
    const maxX = Math.max(...allElements.map(el => el.position.x + el.dimensions.width));
    const maxY = Math.max(...allElements.map(el => el.position.y + el.dimensions.height));
    
    const diagramWidth = maxX - minX + 100;
    const diagramHeight = maxY - minY + 100;
    
    const svgRect = svgRef.current.getBoundingClientRect();
    const scaleX = svgRect.width / diagramWidth;
    const scaleY = svgRect.height / diagramHeight;
    const newZoom = Math.min(scaleX, scaleY, 1);
    
    setZoom(newZoom);
    setPan({
      x: (svgRect.width - diagramWidth * newZoom) / 2 - minX * newZoom,
      y: (svgRect.height - diagramHeight * newZoom) / 2 - minY * newZoom
    });
  }, [diagram]);
  
  const handleMouseDown = useCallback((e: React.MouseEvent) => {
    if (e.target === svgRef.current) {
      setIsDragging(true);
      setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y });
      setSelectedElement(null);
    }
  }, [pan]);
  
  const handleMouseMove = useCallback((e: React.MouseEvent) => {
    if (isDragging) {
      setPan({
        x: e.clientX - dragStart.x,
        y: e.clientY - dragStart.y
      });
    }
  }, [isDragging, dragStart]);
  
  const handleMouseUp = useCallback(() => {
    setIsDragging(false);
  }, []);
  
  const handleZoomIn = useCallback(() => {
    setZoom(prev => Math.min(prev * 1.2, 3));
  }, []);
  
  const handleZoomOut = useCallback(() => {
    setZoom(prev => Math.max(prev / 1.2, 0.1));
  }, []);
  
  const handleReset = useCallback(() => {
    setZoom(1);
    setPan({ x: 0, y: 0 });
    setSelectedElement(null);
  }, []);
  
  const renderElement = useCallback((element: BPMNElement) => {
    const onClick = () => setSelectedElement(element.id);
    const selected = selectedElement === element.id;
    
    switch (element.type) {
      case 'startEvent':
        return <BPMNStartEvent key={element.id} element={element} onClick={onClick} selected={selected} />;
      case 'endEvent':
        return <BPMNEndEvent key={element.id} element={element} onClick={onClick} selected={selected} />;
      case 'task':
      case 'userTask':
      case 'serviceTask':
        return <BPMNTask key={element.id} element={element} onClick={onClick} selected={selected} />;
      case 'exclusiveGateway':
      case 'parallelGateway':
      case 'inclusiveGateway':
        return <BPMNGateway key={element.id} element={element} onClick={onClick} selected={selected} />;
      default:
        return null;
    }
  }, [selectedElement]);
  
  const processStats = useMemo(() => {
    if (!diagram) return null;
    
    const totalElements = diagram.processes.reduce((sum, p) => sum + p.elements.length, 0);
    const totalFlows = diagram.processes.reduce((sum, p) => sum + p.sequenceFlows.length, 0);
    const processCount = diagram.processes.length;
    
    return { totalElements, totalFlows, processCount };
  }, [diagram]);
  
  // Clear messages after delay
  useEffect(() => {
    if (error) {
      const timer = setTimeout(() => setError(null), 5000);
      return () => clearTimeout(timer);
    }
  }, [error]);
  
  useEffect(() => {
    if (success) {
      const timer = setTimeout(() => setSuccess(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [success]);
  
  return (
    <div className="w-full h-screen flex flex-col bg-gray-50">
      {/* Header */}
      <div className="bg-white shadow-sm border-b px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <h1 className="text-2xl font-bold text-gray-900">BPMN 2.0 Process Editor</h1>
            {processStats && (
              <div className="flex items-center space-x-4 text-sm text-gray-600">
                <span className="flex items-center"><FileText className="w-4 h-4 mr-1" />{processStats.processCount} Process{processStats.processCount !== 1 ? 'es' : ''}</span>
                <span className="flex items-center"><Square className="w-4 h-4 mr-1" />{processStats.totalElements} Element{processStats.totalElements !== 1 ? 's' : ''}</span>
                <span className="flex items-center"><ArrowRight className="w-4 h-4 mr-1" />{processStats.totalFlows} Flow{processStats.totalFlows !== 1 ? 's' : ''}</span>
              </div>
            )}
          </div>
          
          <div className="flex items-center space-x-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Upload className="w-4 h-4 mr-2" />
              Upload BPMN
            </button>
            
            <div className="flex items-center space-x-1 bg-gray-100 rounded-lg p-1">
              <button
                onClick={handleZoomOut}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Zoom Out"
              >
                <ZoomOut className="w-4 h-4" />
              </button>
              <span className="px-3 py-1 text-sm font-medium min-w-[60px] text-center">
                {Math.round(zoom * 100)}%
              </span>
              <button
                onClick={handleZoomIn}
                className="p-2 hover:bg-white rounded transition-colors"
                title="Zoom In"
              >
                <ZoomIn className="w-4 h-4" />
              </button>
            </div>
            
            <button
              onClick={handleFitToView}
              className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              title="Fit to View"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
      
      {/* Messages */}
      {error && (
        <div className="bg-red-50 border-l-4 border-red-400 p-4 mx-6 mt-4">
          <div className="flex">
            <AlertTriangle className="h-5 w-5 text-red-400" />
            <div className="ml-3">
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </div>
        </div>
      )}
      
      {success && (
        <div className="bg-green-50 border-l-4 border-green-400 p-4 mx-6 mt-4">
          <div className="flex">
            <CheckCircle className="h-5 w-5 text-green-400" />
            <div className="ml-3">
              <p className="text-sm text-green-700">{success}</p>
            </div>
          </div>
        </div>
      )}
      
      {/* Canvas */}
      <div className="flex-1 relative overflow-hidden">
        {!diagram ? (
          <div className="absolute inset-0 flex items-center justify-center">
            <div className="text-center">
              <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No BPMN Diagram Loaded</h3>
              <p className="text-gray-600 mb-4">Upload a .bpmn or .xml file to get started</p>
              <button
                onClick={() => fileInputRef.current?.click()}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors mx-auto"
              >
                <Upload className="w-4 h-4 mr-2" />
                Upload BPMN File
              </button>
            </div>
          </div>
        ) : (
          <svg
            ref={svgRef}
            className="w-full h-full cursor-grab active:cursor-grabbing"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <defs>
              <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="#e5e7eb" strokeWidth="1"/>
              </pattern>
              <marker id="arrowhead" markerWidth="10" markerHeight="7" 
                      refX="9" refY="3.5" orient="auto">
                <polygon points="0 0, 10 3.5, 0 7" fill="#666" />
              </marker>
            </defs>
            
            <rect width="100%" height="100%" fill="url(#grid)" />
            
            <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
              {diagram.processes.map(process => (
                <g key={process.id}>
                  {/* Render sequence flows first (behind elements) */}
                  {process.sequenceFlows.map(flow => (
                    <BPMNSequenceFlowComponent
                      key={flow.id}
                      flow={flow}
                      elements={process.elements}
                    />
                  ))}
                  
                  {/* Render elements */}
                  {process.elements.map(renderElement)}
                </g>
              ))}
            </g>
          </svg>
        )}
      </div>
      
      {/* Selected Element Details */}
      {selectedElement && diagram && (
        <div className="bg-white border-t p-4">
          {(() => {
            const element = diagram.processes
              .flatMap(p => p.elements)
              .find(el => el.id === selectedElement);
            
            if (!element) return null;
            
            return (
              <div className="flex items-center justify-between">
                <div>
                  <h4 className="font-medium text-gray-900">{element.name || element.id}</h4>
                  <p className="text-sm text-gray-600">Type: {element.type}</p>
                </div>
                <div className="text-sm text-gray-500">
                  Position: ({Math.round(element.position.x)}, {Math.round(element.position.y)}) | 
                  Size: {Math.round(element.dimensions.width)}×{Math.round(element.dimensions.height)}
                </div>
              </div>
            );
          })()}
        </div>
      )}
      
      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept=".bpmn,.xml"
        onChange={handleFileUpload}
        className="hidden"
      />
    </div>
  );
};

export default BPMNEditor;