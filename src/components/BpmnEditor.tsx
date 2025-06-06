import React, { useState, useEffect, useCallback, useRef, useMemo } from 'react';
import { generateId } from '../utils';
import parseXMLToBPMN from './parseXmlToBpmn';
import generateBPMNXML from './generateBpmn';
import type { BPMNDiagram, BPMNElement, BPMNSequenceFlow, EditorMode, ToolbarButtonProps } from './bpmnTypes/types';
import BPMNElementComponent from './BpmnElementComponent';
import BPMNSequenceFlowComponent from './sequenceFlowDiagram';
import {
    MousePointer,
    Move,
    GitCommitHorizontal,
    Circle,
    Square,
    Diamond,
    Upload,
    Download,
    RotateCcw,
    ZoomIn,
    ZoomOut,
    Edit3,
    Trash2,
    AlertTriangle,
    CheckCircle
} from 'lucide-react';
import { getDefaultDimensions } from '../utils';

const BPMNEditor: React.FC = () => {
    const [diagram, setDiagram] = useState<BPMNDiagram>({ processes: [{ id: generateId(), name: 'New Process', elements: [], sequenceFlows: [] }] });
    const [selectedItem, setSelectedItem] = useState<{ id: string, type: 'element' | 'flow' } | null>(null);
    const [editorMode, setEditorMode] = useState<EditorMode>('select');
    const [zoom, setZoom] = useState(1);
    const [pan, setPan] = useState({ x: 50, y: 50 });
    const [isDragging, setIsDragging] = useState<string | 'pan' | null>(null); // elementId, 'pan', or null
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, elementX: 0, elementY: 0 });
    const [error, setError] = useState<string | null>(null);
    const [success, setSuccess] = useState<string | null>(null);
    const [connectingFrom, setConnectingFrom] = useState<string | null>(null);
    const [editingName, setEditingName] = useState<{ id: string; name: string } | null>(null);

    const fileInputRef = useRef<HTMLInputElement>(null);
    const svgRef = useRef<SVGSVGElement>(null);
    const currentProcess = diagram.processes[0];

    // Flash notifications
    useEffect(() => {
        if (error) setTimeout(() => setError(null), 5000);
        if (success) setTimeout(() => setSuccess(null), 3000);
    }, [error, success]);

    const handleFileUpload = useCallback((event: React.ChangeEvent<HTMLInputElement>) => {
        const file = event.target.files?.[0];
        if (!file) return;

        if (!file.name.toLowerCase().endsWith('.bpmn') && !file.name.toLowerCase().endsWith('.xml')) {
            setError('Invalid file type. Please upload a .bpmn or .xml file.');
            return;
        }
        if (file.size > 10 * 1024 * 1024) { // 10MB limit
            setError('File is too large. Maximum size is 10MB.');
            return;
        }

        const reader = new FileReader();
        reader.onload = (e) => {
            try {
                const xmlText = e.target?.result as string;
                if (!xmlText) throw new Error('File could not be read.');

                // Sanitize input before parsing
                const sanitizedXml = xmlText.replace(/<!DOCTYPE[^>]*>/g, '');
                const parsedDiagram = parseXMLToBPMN(sanitizedXml);
                setDiagram(parsedDiagram);
                setSelectedItem(null);
                setSuccess('Diagram loaded successfully!');
                setTimeout(() => handleFitToView(), 100);
            } catch (err) {
                setError(err instanceof Error ? err.message : 'Failed to parse BPMN file.');
            }
        };
        reader.onerror = () => setError('Failed to read the file.');
        reader.readAsText(file);
        event.target.value = ''; // Reset file input
    }, []);

    const handleDownload = useCallback(() => {
        try {
            const xml = generateBPMNXML(diagram);
            const blob = new Blob([xml], { type: 'application/xml;charset=utf-8' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `${currentProcess.name?.replace(/\s/g, '_') || 'process'}.bpmn`;
            a.click();
            URL.revokeObjectURL(url);
            setSuccess('BPMN file downloaded!');
        } catch (err) {
            setError('Failed to generate BPMN XML.');
        }
    }, [diagram, currentProcess.name]);

    const handleCanvasClick = useCallback((e: React.MouseEvent) => {
        if (e.target !== svgRef.current) return;

        if (editorMode === 'select') {
            setSelectedItem(null);
            setConnectingFrom(null);
            return;
        }
        if (['pan', 'connect'].includes(editorMode)) return;

        const svgRect = svgRef.current?.getBoundingClientRect();
        if (!svgRect) return;

        const x = (e.clientX - svgRect.left - pan.x) / zoom;
        const y = (e.clientY - svgRect.top - pan.y) / zoom;
        const dimensions = getDefaultDimensions(editorMode as BPMNElement['type']);

        const newElement: BPMNElement = {
            id: generateId(),
            name: editorMode.charAt(0).toUpperCase() + editorMode.slice(1),
            type: editorMode as BPMNElement['type'],
            position: { x: x - dimensions.width / 2, y: y - dimensions.height / 2 },
            dimensions
        };

        setDiagram(prev => ({
            ...prev,
            processes: [{ ...currentProcess, elements: [...currentProcess.elements, newElement] }]
        }));
        setSelectedItem({ id: newElement.id, type: 'element' });
        setEditorMode('select');
    }, [editorMode, zoom, pan, currentProcess]);

    const handleElementClick = useCallback((e: React.MouseEvent, elementId: string) => {
        e.stopPropagation();
        if (editorMode === 'connect') {
            if (connectingFrom && connectingFrom !== elementId) {
                const newFlow: BPMNSequenceFlow = { id: generateId(), sourceRef: connectingFrom, targetRef: elementId };
                setDiagram(prev => ({ ...prev, processes: [{ ...currentProcess, sequenceFlows: [...currentProcess.sequenceFlows, newFlow] }] }));
                setConnectingFrom(null);
                setEditorMode('select');
                setSuccess('Connection created.');
            } else {
                setConnectingFrom(elementId);
                setSuccess('Select a target element to connect.');
            }
        } else {
            setSelectedItem({ id: elementId, type: 'element' });
        }
    }, [editorMode, connectingFrom, currentProcess]);

    const handleElementDragStart = useCallback((e: React.MouseEvent, elementId: string) => {
        e.stopPropagation();
        if (editorMode !== 'select') return;

        const element = currentProcess.elements.find(el => el.id === elementId);
        if (!element) return;

        setIsDragging(elementId);
        setDragStart({
            x: e.clientX / zoom,
            y: e.clientY / zoom,
            elementX: element.position.x,
            elementY: element.position.y
        });
    }, [editorMode, currentProcess.elements, zoom]);

    const handleCanvasDragStart = useCallback((e: React.MouseEvent) => {
        if ((editorMode === 'pan' || e.button === 1) && e.target === svgRef.current) {
            setIsDragging('pan');
            setDragStart({ x: e.clientX - pan.x, y: e.clientY - pan.y, elementX: 0, elementY: 0 });
        }
    }, [editorMode, pan]);

    const handleMouseMove = useCallback((e: React.MouseEvent) => {
        if (!isDragging) return;

        if (isDragging === 'pan') {
            setPan({ x: e.clientX - dragStart.x, y: e.clientY - dragStart.y });
        } else { // Dragging an element
            const dx = e.clientX / zoom - dragStart.x;
            const dy = e.clientY / zoom - dragStart.y;

            setDiagram(prev => ({
                ...prev,
                processes: [{
                    ...currentProcess,
                    elements: currentProcess.elements.map(el =>
                        el.id === isDragging ? { ...el, position: { x: dragStart.elementX + dx, y: dragStart.elementY + dy } } : el
                    )
                }]
            }));
        }
    }, [isDragging, dragStart, zoom, currentProcess]);

    const handleMouseUp = useCallback(() => {
        setIsDragging(null);
    }, []);

    const handleKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.target instanceof HTMLInputElement || e.target instanceof HTMLTextAreaElement) return;

        if ((e.key === 'Delete' || e.key === 'Backspace') && selectedItem) {
            e.preventDefault();
            if (selectedItem.type === 'element') {
                setDiagram(prev => ({
                    ...prev, processes: [{
                        ...currentProcess,
                        elements: currentProcess.elements.filter(el => el.id !== selectedItem.id),
                        sequenceFlows: currentProcess.sequenceFlows.filter(f => f.sourceRef !== selectedItem.id && f.targetRef !== selectedItem.id)
                    }]
                }));
            } else { // flow
                setDiagram(prev => ({
                    ...prev, processes: [{
                        ...currentProcess,
                        sequenceFlows: currentProcess.sequenceFlows.filter(f => f.id !== selectedItem.id)
                    }]
                }));
            }
            setSelectedItem(null);
            setSuccess('Item deleted.');
        }
    }, [selectedItem, currentProcess]);

    useEffect(() => {
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [handleKeyDown]);

    const handleStartEditingName = useCallback(() => {
        if (!selectedItem) return;
        const item = selectedItem.type === 'element'
            ? currentProcess.elements.find(e => e.id === selectedItem.id)
            : currentProcess.sequenceFlows.find(f => f.id === selectedItem.id);
        if (item) setEditingName({ id: item.id, name: item.name || '' });
    }, [selectedItem, currentProcess]);

    const handleSaveName = useCallback(() => {
        if (!editingName) return;

        setDiagram(prev => ({
            ...prev,
            processes: [{
                ...currentProcess,
                elements: currentProcess.elements.map(el => el.id === editingName.id ? { ...el, name: editingName.name } : el),
                sequenceFlows: currentProcess.sequenceFlows.map(f => f.id === editingName.id ? { ...f, name: editingName.name } : f)
            }]
        }));
        setEditingName(null);
        setSuccess('Name updated.');
    }, [editingName, currentProcess]);

    const handleFitToView = useCallback(() => {
        if (!currentProcess.elements.length || !svgRef.current) return;

        const PADDING = 100;
        const minX = Math.min(...currentProcess.elements.map(el => el.position.x));
        const minY = Math.min(...currentProcess.elements.map(el => el.position.y));
        const maxX = Math.max(...currentProcess.elements.map(el => el.position.x + el.dimensions.width));
        const maxY = Math.max(...currentProcess.elements.map(el => el.position.y + el.dimensions.height));

        const diagramWidth = maxX - minX;
        const diagramHeight = maxY - minY;

        const { width: svgWidth, height: svgHeight } = svgRef.current.getBoundingClientRect();
        const newZoom = Math.min((svgWidth - PADDING) / diagramWidth, (svgHeight - PADDING) / diagramHeight, 2);

        setZoom(newZoom);
        setPan({
            x: (svgWidth - diagramWidth * newZoom) / 2 - minX * newZoom,
            y: (svgHeight - diagramHeight * newZoom) / 2 - minY * newZoom
        });
    }, [currentProcess.elements]);

    const ToolbarButton: React.FC<ToolbarButtonProps> = ({ icon, label, onClick, active = false, disabled = false }) => (
        <button onClick={onClick} disabled={disabled} className={`flex flex-col items-center justify-center p-2 rounded-md transition-all duration-150 ease-in-out ${active ? 'bg-blue-100 text-blue-700' : 'hover:bg-gray-200'} ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}`} title={label}>
            {icon}
            <span className="text-xs mt-1">{label}</span>
        </button>
    );

    const tools = useMemo(() => [
        { mode: 'select', icon: <MousePointer size={20} />, label: 'Select' },
        { mode: 'pan', icon: <Move size={20} />, label: 'Pan' },
        { mode: 'connect', icon: <GitCommitHorizontal size={20} />, label: 'Connect' },
        { type: 'divider' },
        { mode: 'startEvent', icon: <Circle size={20} />, label: 'Start' },
        { mode: 'endEvent', icon: <Circle size={20} strokeWidth={4} />, label: 'End' },
        { mode: 'task', icon: <Square size={20} />, label: 'Task' },
        { mode: 'exclusiveGateway', icon: <Diamond size={20} />, label: 'Gateway' },
    ], []);

    function handleZoomOut(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        event.preventDefault();
        setZoom(prev => Math.max(0.2, prev * 0.8));
    }
    function handleZoomIn(event: React.MouseEvent<HTMLButtonElement, MouseEvent>): void {
        event.preventDefault();
        setZoom(prev => Math.min(2, prev * 1.25));
    }
    return (
        <div className="w-full h-screen bg-gray-100 flex flex-col font-sans">
            {/* Header Toolbar */}
            <header className="flex items-center justify-between p-2 bg-white shadow-md z-10">
                <div className="flex items-center gap-4">
                    <h1 className="text-xl font-bold text-gray-700">BPMN Editor</h1>
                    <div className="flex items-center gap-2 border-l pl-4">
                        <button onClick={() => fileInputRef.current?.click()} className="toolbar-btn"><Upload size={18} /> Upload</button>
                        <input type="file" ref={fileInputRef} onChange={handleFileUpload} accept=".bpmn,.xml" style={{ display: 'none' }} />
                        <button onClick={handleDownload} className="toolbar-btn"><Download size={18} /> Download</button>
                    </div>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleZoomOut} className="toolbar-icon-btn"><ZoomOut size={18} /></button>
                    <span className="text-sm text-gray-600 w-12 text-center">{(zoom * 100).toFixed(0)}%</span>
                    <button onClick={handleZoomIn} className="toolbar-icon-btn"><ZoomIn size={18} /></button>
                    <button onClick={handleFitToView} className="toolbar-icon-btn"><RotateCcw size={18} /></button>
                </div>
                <div className="flex items-center gap-2">
                    <button onClick={handleStartEditingName} disabled={!selectedItem} className="toolbar-btn disabled:opacity-50"><Edit3 size={18} /> Rename</button>
                    <button onClick={() => handleKeyDown({ key: 'Delete' } as KeyboardEvent)} disabled={!selectedItem} className="toolbar-btn text-red-600 disabled:opacity-50"><Trash2 size={18} /> Delete</button>
                </div>
            </header>

            <div className="flex flex-grow overflow-hidden">
                {/* Left Toolbar */}
                <aside className="flex flex-col gap-2 p-2 bg-white shadow">
                    {tools.map((tool, index) => tool.type === 'divider'
                        ? <hr key={index} className="my-2" />
                        : <ToolbarButton key={tool.mode as string} icon={tool.icon} label={tool.label ?? ''} onClick={() => setEditorMode(tool.mode as EditorMode)} active={editorMode === tool.mode} />
                    )}
                </aside>

                {/* Main Canvas */}
                <main className="flex-grow relative bg-gray-50" onMouseMove={handleMouseMove} onMouseUp={handleMouseUp} onMouseLeave={handleMouseUp}>
                    <svg
                        ref={svgRef}
                        width="100%"
                        height="100%"
                        onClick={handleCanvasClick}
                        onMouseDown={handleCanvasDragStart}
                        style={{ cursor: editorMode === 'pan' || isDragging === 'pan' ? 'grabbing' : 'default' }}
                    >
                        <defs>
                            <pattern id="grid" width="20" height="20" patternUnits="userSpaceOnUse">
                                <path d="M 20 0 L 0 0 0 20" fill="none" stroke="rgba(200,200,200,0.5)" strokeWidth="0.5" />
                            </pattern>
                        </defs>
                        <rect width="100%" height="100%" fill="url(#grid)" />
                        <g transform={`translate(${pan.x}, ${pan.y}) scale(${zoom})`}>
                            {currentProcess.sequenceFlows.map(flow => (
                                <BPMNSequenceFlowComponent key={flow.id} flow={flow} elements={currentProcess.elements} selected={selectedItem?.id === flow.id} onClick={() => setSelectedItem({ id: flow.id, type: 'flow' })} />
                            ))}
                            {currentProcess.elements.map(element => (
                                <BPMNElementComponent key={element.id} element={element} selected={selectedItem?.id === element.id} onClick={(e) => handleElementClick(e, element.id)} onDragStart={(e) => handleElementDragStart(e, element.id)} />
                            ))}
                        </g>
                    </svg>
                </main>
            </div>

            {/* Notifications */}
            {error && <div className="notification bg-red-500"><AlertTriangle size={20} /> {error}</div>}
            {success && <div className="notification bg-green-500"><CheckCircle size={20} /> {success}</div>}

            {/* Rename Dialog */}
            {editingName && (
                <div className="absolute inset-0 bg-black bg-opacity-40 flex items-center justify-center z-20">
                    <div className="bg-white p-6 rounded-lg shadow-xl">
                        <h3 className="text-lg font-semibold mb-4">Rename Item</h3>
                        <input type="text" value={editingName.name} onChange={(e) => setEditingName({ ...editingName, name: e.target.value })} className="w-full p-2 border rounded-md" autoFocus onKeyDown={e => e.key === 'Enter' && handleSaveName()} />
                        <div className="flex justify-end gap-3 mt-4">
                            <button onClick={() => setEditingName(null)} className="px-4 py-2 rounded-md bg-gray-200 hover:bg-gray-300">Cancel</button>
                            <button onClick={handleSaveName} className="px-4 py-2 rounded-md bg-blue-600 text-white hover:bg-blue-700">Save</button>
                        </div>
                    </div>
                </div>
            )}

            <style>{`
        .toolbar-btn { display: flex; align-items: center; gap: 8px; padding: 6px 12px; border-radius: 6px; font-size: 14px; background-color: #f3f4f6; transition: background-color 0.2s; }
        .toolbar-btn:hover:not(:disabled) { background-color: #e5e7eb; }
        .toolbar-icon-btn { padding: 6px; border-radius: 6px; background-color: #f3f4f6; transition: background-color 0.2s; }
        .toolbar-icon-btn:hover:not(:disabled) { background-color: #e5e7eb; }
        .notification { position: absolute; top: 80px; left: 50%; transform: translateX(-50%); color: white; padding: 12px 20px; border-radius: 8px; display: flex; align-items: center; gap: 10px; z-index: 100; font-size: 14px; box-shadow: 0 4px 15px rgba(0,0,0,0.2); }
      `}</style>
        </div>
    );
};

export default BPMNEditor;