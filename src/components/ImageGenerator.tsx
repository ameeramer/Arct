import { useState, useRef } from 'react';
import { generateControlledImage, processAndSaveGeneratedImage } from '../services/stability';

type ImageGeneratorProps = {
  projectId: string;
  onImageGenerated: (imageUrl: string) => void;
};

export default function ImageGenerator({ projectId, onImageGenerated }: ImageGeneratorProps) {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [negativePrompt, setNegativePrompt] = useState('');
  const [controlType, setControlType] = useState<'sketch' | 'structure'>('structure');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

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

  // טיפול בגרירת קובץ
  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    
    const file = e.dataTransfer.files?.[0];
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

  // מניעת התנהגות ברירת מחדל של גרירה
  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  // פתיחת חלון בחירת קבצים
  const triggerFileInput = () => {
    fileInputRef.current?.click();
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
      const imageBlob = await generateControlledImage(
        controlType,
        uploadedImage,
        {
          prompt,
          negative_prompt: negativePrompt || undefined,
          output_format: 'png',
        }
      );

      // שמירת התמונה בפרויקט
      const imageUrl = await processAndSaveGeneratedImage(imageBlob, projectId);
      
      // עדכון הקומפוננטה האב
      onImageGenerated(imageUrl);
      
      // איפוס הטופס
      setPrompt('');
      setNegativePrompt('');
      setUploadedImage(null);
      setPreviewUrl(null);
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="bg-white rounded-xl p-6 shadow-sm">
      <h2 className="text-xl font-semibold mb-4">Generate Design</h2>
      
      {/* תיבת העלאת תמונה */}
      <div 
        className={`border-2 border-dashed rounded-lg p-4 mb-4 text-center cursor-pointer ${
          previewUrl ? 'border-indigo-300 bg-indigo-50' : 'border-gray-300 hover:border-indigo-500'
        }`}
        onClick={triggerFileInput}
        onDrop={handleDrop}
        onDragOver={handleDragOver}
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
                setUploadedImage(null);
                setPreviewUrl(null);
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
          ref={fileInputRef}
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
        <div className="flex gap-4">
          <label className="flex items-center">
            <input
              type="radio"
              value="structure"
              checked={controlType === 'structure'}
              onChange={() => setControlType('structure')}
              className="mr-2"
            />
            <span>Structure (Maintain layout)</span>
          </label>
          <label className="flex items-center">
            <input
              type="radio"
              value="sketch"
              checked={controlType === 'sketch'}
              onChange={() => setControlType('sketch')}
              className="mr-2"
            />
            <span>Sketch (Enhance details)</span>
          </label>
        </div>
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
  );
} 