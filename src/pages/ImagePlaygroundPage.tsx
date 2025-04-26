import { useState } from 'react';
import { generateControlledImage, generateStyledImage } from '../services/stability';
import { uploadImage } from '../services/storage';

export default function ImagePlaygroundPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [controlType, setControlType] = useState<'sketch' | 'structure' | 'style'>('structure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{url: string, prompt: string}>>([]);

  // טיפול בהעלאת קובץ
  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // בדיקת סוג הקובץ
    if (!file.type.startsWith('image/')) {
      setError('Please upload an image file');
      return;
    }

    setUploadedImage(file);
    setPreviewUrl(URL.createObjectURL(file));
    setError(null);
  };

  // יצירת תמונה חדשה באמצעות Stability AI
  const handleGenerate = async () => {
    if (!uploadedImage) {
      setError('Please upload an image first');
      return;
    }

    if (!prompt.trim()) {
      setError('Please enter a prompt');
      return;
    }

    try {
      setIsGenerating(true);
      setError(null);

      // יצירת תמונה באמצעות API
      let imageBlob;
      
      if (controlType === 'style') {
        imageBlob = await generateStyledImage(
          uploadedImage,
          {
            prompt,
            negative_prompt: negativePrompt || undefined,
            output_format: 'png',
          }
        );
      } else {
        imageBlob = await generateControlledImage(
          controlType,
          uploadedImage,
          {
            prompt,
            negative_prompt: negativePrompt || undefined,
            output_format: 'png',
          }
        );
      }

      // יצירת קובץ מה-Blob
      const filename = `playground-${Date.now()}.png`;
      const file = new File([imageBlob], filename, { type: 'image/png' });
      
      // העלאת התמונה לאחסון
      const imageUrl = await uploadImage(file, filename);
      
      // עדכון התמונה שנוצרה
      setGeneratedImageUrl(imageUrl);
      
      // הוספה להיסטוריה
      setGenerationHistory(prev => [
        { url: imageUrl, prompt }, 
        ...prev.slice(0, 9)  // שמירת 10 תמונות אחרונות בלבד
      ]);
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  // ניקוי התמונה שהועלתה
  const clearUploadedImage = () => {
    if (previewUrl) {
      URL.revokeObjectURL(previewUrl);
    }
    setUploadedImage(null);
    setPreviewUrl(null);
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-3xl font-bold mb-8 text-center">Image Playground</h1>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* טופס יצירת תמונה */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Create New Design</h2>
            
            {/* תיבת העלאת תמונה */}
            <div 
              className={`border-2 border-dashed rounded-lg p-4 mb-4 text-center cursor-pointer ${
                previewUrl ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
              }`}
              onClick={() => document.getElementById('file-upload')?.click()}
            >
              {previewUrl ? (
                <div className="relative">
                  <img 
                    src={previewUrl} 
                    alt="Preview" 
                    className="max-h-64 mx-auto rounded"
                  />
                  <button 
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1"
                    onClick={(e) => {
                      e.stopPropagation();
                      clearUploadedImage();
                    }}
                  >
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                    </svg>
                  </button>
                </div>
              ) : (
                <div className="py-4">
                  <svg
                    className="mx-auto h-12 w-12 text-gray-400"
                    stroke="currentColor"
                    fill="none"
                    viewBox="0 0 48 48"
                  >
                    <path
                      d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  <p className="mt-2 text-sm text-gray-600">
                    Drag and drop an image, or click to select
                  </p>
                </div>
              )}
              <input
                id="file-upload"
                type="file"
                accept="image/*"
                className="hidden"
                onChange={handleFileChange}
              />
            </div>

            {/* בחירת סוג בקרה */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Control Type
              </label>
              <div className="grid grid-cols-3 gap-2">
                <label className={`flex items-center justify-center p-2 rounded ${
                  controlType === 'structure' ? 'bg-indigo-100 border border-indigo-300' : 'bg-gray-100 border border-gray-200'
                }`}>
                  <input
                    type="radio"
                    value="structure"
                    checked={controlType === 'structure'}
                    onChange={() => setControlType('structure')}
                    className="sr-only"
                  />
                  <span>Structure</span>
                </label>
                <label className={`flex items-center justify-center p-2 rounded ${
                  controlType === 'sketch' ? 'bg-indigo-100 border border-indigo-300' : 'bg-gray-100 border border-gray-200'
                }`}>
                  <input
                    type="radio"
                    value="sketch"
                    checked={controlType === 'sketch'}
                    onChange={() => setControlType('sketch')}
                    className="sr-only"
                  />
                  <span>Sketch</span>
                </label>
                <label className={`flex items-center justify-center p-2 rounded ${
                  controlType === 'style' ? 'bg-indigo-100 border border-indigo-300' : 'bg-gray-100 border border-gray-200'
                }`}>
                  <input
                    type="radio"
                    value="style"
                    checked={controlType === 'style'}
                    onChange={() => setControlType('style')}
                    className="sr-only"
                  />
                  <span>Style</span>
                </label>
              </div>
              <p className="mt-1 text-xs text-gray-500">
                {controlType === 'structure' && 'Maintains the structure of your image while changing its appearance.'}
                {controlType === 'sketch' && 'Enhances sketches or uses contour lines to guide the generation.'}
                {controlType === 'style' && 'Extracts stylistic elements from your image to guide the creation.'}
              </p>
            </div>

            {/* תיבת טקסט לתיאור */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Prompt
              </label>
              <textarea
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                placeholder="Describe what you want to see in the image..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={3}
              />
            </div>

            {/* תיבת טקסט לתיאור שלילי */}
            <div className="mb-4">
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Negative Prompt (Optional)
              </label>
              <textarea
                value={negativePrompt}
                onChange={(e) => setNegativePrompt(e.target.value)}
                placeholder="Describe what you don't want to see..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={2}
              />
            </div>

            {/* הודעת שגיאה */}
            {error && (
              <div className="mb-4 p-3 bg-red-100 text-red-700 rounded-md">
                {error}
              </div>
            )}

            {/* כפתור יצירה */}
            <button
              onClick={handleGenerate}
              disabled={isGenerating || !uploadedImage || !prompt.trim()}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isGenerating || !uploadedImage || !prompt.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? 'Generating...' : 'Generate Design'}
            </button>
          </div>

          {/* תצוגת התמונה שנוצרה */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Generated Design</h2>
            
            {generatedImageUrl ? (
              <div className="text-center">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated design" 
                  className="max-h-96 mx-auto rounded-lg shadow-md"
                />
                <p className="mt-4 text-sm text-gray-600 italic">"{prompt}"</p>
                <div className="mt-4 flex justify-center space-x-2">
                  <a 
                    href={generatedImageUrl} 
                    download 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                  >
                    Download
                  </a>
                  <button 
                    onClick={() => {
                      setUploadedImage(null);
                      setPreviewUrl(null);
                      setGeneratedImageUrl(null);
                    }}
                    className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300"
                  >
                    Clear
                  </button>
                </div>
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center h-64 text-gray-400">
                <svg className="h-16 w-16" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
                </svg>
                <p className="mt-2">Your generated design will appear here</p>
              </div>
            )}
          </div>
        </div>

        {/* היסטוריית יצירות */}
        {generationHistory.length > 0 && (
          <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Generation History</h2>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
              {generationHistory.map((item, index) => (
                <div key={index} className="relative group">
                  <img 
                    src={item.url} 
                    alt={`Generated design ${index + 1}`} 
                    className="w-full h-40 object-cover rounded-lg"
                  />
                  <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                    <div className="opacity-0 group-hover:opacity-100 transition-opacity duration-200 text-white text-center p-2">
                      <p className="text-xs line-clamp-3">{item.prompt}</p>
                      <a 
                        href={item.url} 
                        download 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="mt-2 inline-block px-2 py-1 bg-white text-gray-800 rounded-full text-xs font-medium"
                      >
                        Download
                      </a>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* מידע על השירות */}
        <div className="mt-8 bg-white rounded-xl p-6 shadow-sm">
          <h2 className="text-xl font-semibold mb-4">About This Tool</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Structure</h3>
              <p className="text-gray-600 text-sm">
                This mode maintains the structure of your input image while changing its appearance. 
                Perfect for transforming real photos into different styles while keeping the layout intact.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Sketch</h3>
              <p className="text-gray-600 text-sm">
                This mode upgrades sketches to refined outputs with precise control. 
                For non-sketch images, it uses contour lines and edges to guide the generation.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Style</h3>
              <p className="text-gray-600 text-sm">
                This mode extracts stylistic elements from your input image and uses them to guide the creation
                of a new image based on your prompt.
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Powered by Stability AI. Images are generated using advanced AI models.</p>
            <p className="mt-1">Tip: For best results, use clear images and detailed prompts.</p>
          </div>
        </div>
      </div>
    </div>
  );
}