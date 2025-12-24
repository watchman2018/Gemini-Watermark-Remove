
import React, { useState, useRef, useEffect, useCallback } from 'react';
import { Point, Rect, ProcessingStatus } from '../types';
import Button from './Button';
import { removeWatermarkWithGemini } from '../services/geminiService';

interface ImageEditorProps {
  imageSrc: string;
  onResult: (processedImage: string) => void;
  onReset: () => void;
}

const ImageEditor: React.FC<ImageEditorProps> = ({ imageSrc, onResult, onReset }) => {
  const [status, setStatus] = useState<ProcessingStatus>(ProcessingStatus.IDLE);
  const [error, setError] = useState<string | null>(null);
  const [selection, setSelection] = useState<Rect | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  
  const containerRef = useRef<HTMLDivElement>(null);
  const imgRef = useRef<HTMLImageElement>(null);

  const handleMouseDown = (e: React.MouseEvent) => {
    if (status === ProcessingStatus.PROCESSING) return;
    const rect = containerRef.current?.getBoundingClientRect();
    if (!rect) return;
    
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;
    
    setStartPoint({ x, y });
    setSelection({ x, y, width: 0, height: 0 });
    setIsDrawing(true);
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (!isDrawing || !startPoint || !containerRef.current) return;
    
    const rect = containerRef.current.getBoundingClientRect();
    const currentX = e.clientX - rect.left;
    const currentY = e.clientY - rect.top;
    
    const width = currentX - startPoint.x;
    const height = currentY - startPoint.y;
    
    setSelection({
      x: width < 0 ? currentX : startPoint.x,
      y: height < 0 ? currentY : startPoint.y,
      width: Math.abs(width),
      height: Math.abs(height)
    });
  };

  const handleMouseUp = () => {
    setIsDrawing(false);
  };

  const handleProcess = async () => {
    if (!selection || !containerRef.current) return;
    
    setStatus(ProcessingStatus.PROCESSING);
    setError(null);
    
    try {
      const containerRect = containerRef.current.getBoundingClientRect();
      const result = await removeWatermarkWithGemini(imageSrc, {
        ...selection,
        containerWidth: containerRect.width,
        containerHeight: containerRect.height
      });
      onResult(result);
      setStatus(ProcessingStatus.COMPLETED);
    } catch (err: any) {
      setError(err.message || "Failed to process image. Please try again.");
      setStatus(ProcessingStatus.ERROR);
    }
  };

  const handlePreset = (type: 'br' | 'tr' | 'bl' | 'tl') => {
    if (!containerRef.current) return;
    const { width, height } = containerRef.current.getBoundingClientRect();
    const boxSize = 100;
    const margin = 20;

    switch (type) {
      case 'br': setSelection({ x: width - boxSize - margin, y: height - boxSize - margin, width: boxSize, height: boxSize }); break;
      case 'tr': setSelection({ x: width - boxSize - margin, y: margin, width: boxSize, height: boxSize }); break;
      case 'bl': setSelection({ x: margin, y: height - boxSize - margin, width: boxSize, height: boxSize }); break;
      case 'tl': setSelection({ x: margin, y: margin, width: boxSize, height: boxSize }); break;
    }
  };

  return (
    <div className="flex flex-col lg:flex-row gap-8 w-full max-w-6xl">
      <div className="flex-1 flex flex-col gap-4">
        <div className="bg-slate-900 rounded-xl p-4 border border-slate-800 shadow-2xl relative overflow-hidden flex items-center justify-center min-h-[400px]">
          <div 
            ref={containerRef}
            className="canvas-container inline-block"
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            onMouseLeave={handleMouseUp}
          >
            <img 
              ref={imgRef}
              src={imageSrc} 
              alt="Source" 
              className="max-w-full max-h-[70vh] rounded select-none pointer-events-none" 
            />
            {selection && (
              <div 
                className="selection-overlay shadow-[0_0_0_9999px_rgba(0,0,0,0.4)]"
                style={{
                  left: selection.x,
                  top: selection.y,
                  width: selection.width,
                  height: selection.height
                }}
              />
            )}
            
            {status === ProcessingStatus.PROCESSING && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center z-50">
                <div className="w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                <p className="text-blue-400 font-semibold animate-pulse">Gemini is healing the image...</p>
                <p className="text-slate-400 text-sm mt-2">Analyzing texture and matching pixels</p>
              </div>
            )}
          </div>
        </div>
        
        <div className="flex flex-wrap gap-2 justify-center">
            <span className="text-sm text-slate-500 w-full text-center mb-1">Common Presets:</span>
            <Button variant="secondary" onClick={() => handlePreset('tl')}>Top-Left</Button>
            <Button variant="secondary" onClick={() => handlePreset('tr')}>Top-Right</Button>
            <Button variant="secondary" onClick={() => handlePreset('bl')}>Bottom-Left</Button>
            <Button variant="secondary" onClick={() => handlePreset('br')}>Bottom-Right</Button>
        </div>
      </div>

      <div className="w-full lg:w-80 flex flex-col gap-6">
        <div className="bg-slate-800/50 p-6 rounded-xl border border-slate-700">
          <h3 className="text-xl font-bold mb-4 text-white">Instructions</h3>
          <ul className="space-y-3 text-slate-400 text-sm">
            <li className="flex gap-2">
              <span className="bg-blue-500/20 text-blue-400 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold">1</span>
              Drag your mouse over the watermark area on the image.
            </li>
            <li className="flex gap-2">
              <span className="bg-blue-500/20 text-blue-400 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold">2</span>
              Ensure the box completely covers the AI identifier or logo.
            </li>
            <li className="flex gap-2">
              <span className="bg-blue-500/20 text-blue-400 w-5 h-5 flex items-center justify-center rounded-full flex-shrink-0 text-xs font-bold">3</span>
              Click "Vanish Mark" to let Gemini process it.
            </li>
          </ul>
        </div>

        {error && (
          <div className="p-4 bg-red-900/20 border border-red-500/50 text-red-200 rounded-lg text-sm">
            {error}
          </div>
        )}

        <div className="flex flex-col gap-3">
          <Button 
            className="w-full py-4 text-lg"
            onClick={handleProcess}
            disabled={!selection || selection.width < 5}
            isLoading={status === ProcessingStatus.PROCESSING}
          >
            Vanish Mark
          </Button>
          <Button 
            variant="ghost" 
            className="w-full"
            onClick={onReset}
          >
            Cancel & New Upload
          </Button>
        </div>

        <div className="mt-auto pt-4 border-t border-slate-800">
          <div className="flex items-center gap-3 text-slate-500 text-xs">
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z" />
            </svg>
            <span>Powered by Gemini 2.5 Flash Image Model for state-of-the-art inpainting.</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageEditor;
