
import React, { useState, useEffect } from 'react';
import ImageEditor from './components/ImageEditor';
import Button from './components/Button';
import { HistoryItem } from './types';

const App: React.FC = () => {
  const [originalImage, setOriginalImage] = useState<string | null>(null);
  const [processedImage, setProcessedImage] = useState<string | null>(null);
  const [history, setHistory] = useState<HistoryItem[]>([]);

  useEffect(() => {
    const saved = localStorage.getItem('vanish-history');
    if (saved) {
      try {
        setHistory(JSON.parse(saved));
      } catch (e) {
        console.error("Failed to parse history");
      }
    }
  }, []);

  const saveToHistory = (original: string, processed: string) => {
    const newItem: HistoryItem = {
      id: Math.random().toString(36).substr(2, 9),
      originalImage: original,
      processedImage: processed,
      timestamp: Date.now()
    };
    const newHistory = [newItem, ...history].slice(0, 5); // Keep last 5
    setHistory(newHistory);
    localStorage.setItem('vanish-history', JSON.stringify(newHistory));
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        setOriginalImage(event.target?.result as string);
        setProcessedImage(null);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleResult = (processed: string) => {
    setProcessedImage(processed);
    if (originalImage) {
      saveToHistory(originalImage, processed);
    }
  };

  const handleReset = () => {
    setOriginalImage(null);
    setProcessedImage(null);
  };

  const downloadResult = () => {
    if (!processedImage) return;
    const link = document.createElement('a');
    link.href = processedImage;
    link.download = `vanished-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-200">
      {/* Navigation */}
      <nav className="border-b border-slate-800 bg-slate-900/50 backdrop-blur-md sticky top-0 z-[100]">
        <div className="max-w-7xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2 cursor-pointer" onClick={handleReset}>
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <svg className="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
              </svg>
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-400 to-indigo-500 bg-clip-text text-transparent">AI Mark Vanish</h1>
          </div>
          <div className="flex gap-4">
             <a href="https://ai.google.dev" target="_blank" className="text-xs text-slate-500 hover:text-blue-400 transition-colors hidden sm:block">Powered by Gemini</a>
          </div>
        </div>
      </nav>

      <main className="max-w-7xl mx-auto px-4 py-8">
        {!originalImage && (
          <div className="flex flex-col items-center justify-center min-h-[70vh] text-center">
            <div className="mb-8 max-w-2xl">
              <h2 className="text-4xl md:text-6xl font-extrabold text-white mb-6">
                Make AI Watermarks <span className="text-blue-500">Disappear</span>
              </h2>
              <p className="text-slate-400 text-lg md:text-xl">
                The ultimate tool for cleaning AI identifiers. Select any fixed region and let Gemini seamlessly fill it using context-aware inpainting.
              </p>
            </div>

            <div className="w-full max-w-xl group">
              <label className="relative flex flex-col items-center justify-center w-full h-64 border-2 border-slate-800 border-dashed rounded-2xl cursor-pointer bg-slate-900/40 hover:bg-slate-900/60 hover:border-blue-500/50 transition-all duration-300 shadow-xl group-hover:shadow-blue-500/10">
                <div className="flex flex-col items-center justify-center pt-5 pb-6">
                  <div className="w-16 h-16 bg-blue-600/10 text-blue-500 rounded-full flex items-center justify-center mb-4 group-hover:scale-110 transition-transform duration-300">
                    <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  <p className="mb-2 text-lg text-slate-200 font-medium">Click to upload image</p>
                  <p className="text-xs text-slate-500 uppercase tracking-widest">PNG, JPG, WEBP (Max 10MB)</p>
                </div>
                <input type="file" className="hidden" accept="image/*" onChange={handleFileChange} />
              </label>
            </div>

            <div className="mt-16 grid grid-cols-1 md:grid-cols-3 gap-8 w-full max-w-4xl text-left">
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-500">01.</span> Precision Tool
                </h4>
                <p className="text-sm text-slate-400">Target specific corners or areas where logos are typically hard-coded.</p>
              </div>
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-500">02.</span> Context Aware
                </h4>
                <p className="text-sm text-slate-400">Gemini analyzes surrounding pixels to regenerate textures realistically.</p>
              </div>
              <div className="p-6 bg-slate-900/40 border border-slate-800 rounded-xl">
                <h4 className="font-bold text-white mb-2 flex items-center gap-2">
                  <span className="text-blue-500">03.</span> Non-Destructive
                </h4>
                <p className="text-sm text-slate-400">Only the selected pixels change. The rest of your image stays 100% original.</p>
              </div>
            </div>
          </div>
        )}

        {originalImage && !processedImage && (
          <ImageEditor 
            imageSrc={originalImage} 
            onResult={handleResult} 
            onReset={handleReset} 
          />
        )}

        {processedImage && (
          <div className="flex flex-col items-center gap-8 max-w-4xl mx-auto">
            <div className="w-full flex justify-between items-center">
              <h2 className="text-2xl font-bold text-white">Result Ready</h2>
              <div className="flex gap-3">
                <Button variant="secondary" onClick={() => setProcessedImage(null)}>Try Again</Button>
                <Button onClick={downloadResult}>Download Image</Button>
              </div>
            </div>
            
            <div className="grid md:grid-cols-2 gap-6 w-full">
              <div className="flex flex-col gap-2">
                <span className="text-xs text-slate-500 font-bold uppercase tracking-wider">Original</span>
                <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-slate-800">
                  <img src={originalImage || ''} alt="Original" className="max-w-full max-h-full object-contain rounded" />
                </div>
              </div>
              <div className="flex flex-col gap-2">
                <span className="text-xs text-blue-500 font-bold uppercase tracking-wider">Processed</span>
                <div className="aspect-square bg-slate-900 rounded-xl overflow-hidden flex items-center justify-center p-2 border border-blue-900/30">
                  <img src={processedImage} alt="Result" className="max-w-full max-h-full object-contain rounded" />
                </div>
              </div>
            </div>
            
            <Button variant="ghost" className="mt-8" onClick={handleReset}>Upload Another Image</Button>
          </div>
        )}

        {history.length > 0 && !originalImage && (
          <section className="mt-20 w-full max-w-4xl mx-auto">
            <h3 className="text-xl font-bold text-white mb-6">Recent Edits</h3>
            <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
              {history.map(item => (
                <div key={item.id} className="group relative aspect-square bg-slate-900 rounded-lg overflow-hidden border border-slate-800 hover:border-blue-500/50 transition-all">
                  <img src={item.processedImage} className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity" alt="History" />
                  <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/40">
                    <button 
                      onClick={() => {setOriginalImage(item.originalImage); setProcessedImage(item.processedImage)}}
                      className="bg-white text-black p-2 rounded-full transform scale-75 group-hover:scale-100 transition-transform"
                    >
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                      </svg>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </main>

      <footer className="mt-auto py-12 border-t border-slate-900 text-center">
        <p className="text-slate-500 text-sm">© 2024 AI Mark Vanish • Advanced Pixel Reconstruction</p>
      </footer>
    </div>
  );
};

export default App;
