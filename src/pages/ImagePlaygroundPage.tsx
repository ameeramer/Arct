import { useState } from 'react';
import { generateImage, editImage } from '../services/openai';
import { uploadImage } from '../services/storage';

export default function ImagePlaygroundPage() {
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [generatedImageUrl, setGeneratedImageUrl] = useState<string | null>(null);
  const [prompt, setPrompt] = useState('');
  const [imageAction, setImageAction] = useState<'generate' | 'edit'>('generate');
  const [isGenerating, setIsGenerating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [generationHistory, setGenerationHistory] = useState<Array<{url: string, prompt: string}>>([]);
  
  // הגדרות מתקדמות
  const [showAdvancedSettings, setShowAdvancedSettings] = useState(false);
  const [imageSize, setImageSize] = useState<'1024x1024' | '1536x1024' | '1024x1536' | 'auto'>('1024x1024');
  const [imageQuality, setImageQuality] = useState<'low' | 'medium' | 'high' | 'auto'>('auto');
  const [imageFormat, setImageFormat] = useState<'png' | 'jpeg' | 'webp'>('png');
  const [transparentBackground, setTransparentBackground] = useState(false);

  // טיפול בהעלאת קובץ תמונה
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

  // יצירת תמונה חדשה באמצעות OpenAI
  const handleGenerate = async () => {
    if (imageAction === 'edit' && !uploadedImage) {
      setError('Please upload an image to edit');
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
      
      if (imageAction === 'generate') {
        // יצירת תמונה חדשה
        imageBlob = await generateImage(prompt, {
          size: imageSize,
          quality: imageQuality,
          format: imageFormat,
          background: transparentBackground ? 'transparent' : 'opaque',
        });
      } else {
        // עריכת תמונה קיימת
        if (!uploadedImage) {
          throw new Error('No image to edit');
        }
        
        imageBlob = await editImage(
          uploadedImage,
          prompt,
          {
            size: imageSize,
            quality: imageQuality,
            format: imageFormat,
            background: transparentBackground ? 'transparent' : 'opaque',
          }
        );
      }

      // יצירת קובץ מה-Blob
      const filename = `playground-${Date.now()}.${imageFormat}`;
      
      // יצירת URL זמני לתצוגה
      const url = URL.createObjectURL(imageBlob);
      setGeneratedImageUrl(url);
      
      // העלאת התמונה לאחסון
      const storageUrl = await uploadImage(new File([imageBlob], filename, { type: `image/${imageFormat}` }), filename);
      
      // הוספה להיסטוריה
      setGenerationHistory(prev => [...prev, { url: storageUrl, prompt }]);
      
    } catch (err) {
      console.error('Error generating image:', err);
      setError(err instanceof Error ? err.message : 'Failed to generate image');
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-center mb-8">AI Image Playground</h1>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* טופס יצירת תמונה */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <div className="mb-6">
              <div className="flex border border-gray-300 rounded-md overflow-hidden">
                <button
                  onClick={() => setImageAction('generate')}
                  className={`flex-1 py-2 px-4 ${
                    imageAction === 'generate'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Generate
                </button>
                <button
                  onClick={() => setImageAction('edit')}
                  className={`flex-1 py-2 px-4 ${
                    imageAction === 'edit'
                      ? 'bg-indigo-600 text-white'
                      : 'bg-gray-100 text-gray-700'
                  }`}
                >
                  Edit
                </button>
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
                placeholder="Describe the image you want to create..."
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                rows={4}
              />
            </div>

            {/* העלאת תמונה (רק במצב עריכה) */}
            {imageAction === 'edit' && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Upload Image to Edit
                </label>
                <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-md">
                  <div className="space-y-1 text-center">
                    {previewUrl ? (
                      <div>
                        <img
                          src={previewUrl}
                          alt="Preview"
                          className="mx-auto h-32 w-auto"
                        />
                        <button
                          onClick={() => {
                            setUploadedImage(null);
                            setPreviewUrl(null);
                          }}
                          className="mt-2 text-sm text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ) : (
                      <>
                        <svg
                          className="mx-auto h-12 w-12 text-gray-400"
                          stroke="currentColor"
                          fill="none"
                          viewBox="0 0 48 48"
                        >
                          <path
                            d="M28 8H12a4 4 0 00-4 4v20m32-12v8m0 0v8a4 4 0 01-4 4H12a4 4 0 01-4-4v-4m32-4l-3.172-3.172a4 4 0 00-5.656 0L28 28M8 32l9.172-9.172a4 4 0 015.656 0L28 28m0 0l4 4m4-24h8m-4-4v8m-12 4h.02"
                            strokeWidth={2}
                            strokeLinecap="round"
                            strokeLinejoin="round"
                          />
                        </svg>
                        <div className="flex text-sm text-gray-600">
                          <label className="relative cursor-pointer bg-white rounded-md font-medium text-indigo-600 hover:text-indigo-500 focus-within:outline-none">
                            <span>Upload a file</span>
                            <input
                              id="file-upload"
                              name="file-upload"
                              type="file"
                              className="sr-only"
                              accept="image/*"
                              onChange={handleFileChange}
                            />
                          </label>
                          <p className="pl-1">or drag and drop</p>
                        </div>
                        <p className="text-xs text-gray-500">PNG, JPG, GIF up to 25MB</p>
                      </>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* הגדרות מתקדמות */}
            <div className="mb-4">
              <button
                type="button"
                onClick={() => setShowAdvancedSettings(!showAdvancedSettings)}
                className="text-sm text-indigo-600 hover:text-indigo-800 flex items-center"
              >
                {showAdvancedSettings ? 'Hide' : 'Show'} Advanced Settings
                <svg
                  className={`ml-1 h-4 w-4 transform ${showAdvancedSettings ? 'rotate-180' : ''}`}
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                </svg>
              </button>

              {showAdvancedSettings && (
                <div className="mt-3 p-3 bg-gray-50 rounded-md">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Size
                      </label>
                      <select
                        value={imageSize}
                        onChange={(e) => setImageSize(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="1024x1024">Square (1024x1024)</option>
                        <option value="1536x1024">Landscape (1536x1024)</option>
                        <option value="1024x1536">Portrait (1024x1536)</option>
                        <option value="auto">Auto</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Quality
                      </label>
                      <select
                        value={imageQuality}
                        onChange={(e) => setImageQuality(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="auto">Auto</option>
                        <option value="low">Low (Faster)</option>
                        <option value="medium">Medium</option>
                        <option value="high">High (Best Quality)</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Format
                      </label>
                      <select
                        value={imageFormat}
                        onChange={(e) => setImageFormat(e.target.value as any)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      >
                        <option value="png">PNG</option>
                        <option value="jpeg">JPEG</option>
                        <option value="webp">WebP</option>
                      </select>
                    </div>

                    <div className="flex items-center">
                      <input
                        id="transparent-bg"
                        type="checkbox"
                        checked={transparentBackground}
                        onChange={(e) => setTransparentBackground(e.target.checked)}
                        className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300 rounded"
                        disabled={imageFormat === 'jpeg'}
                      />
                      <label htmlFor="transparent-bg" className="ml-2 block text-sm text-gray-700">
                        Transparent Background
                        {imageFormat === 'jpeg' && (
                          <span className="text-xs text-red-500 ml-1">(Not available with JPEG)</span>
                        )}
                      </label>
                    </div>
                  </div>
                </div>
              )}
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
              disabled={isGenerating || (imageAction === 'edit' && !uploadedImage) || !prompt.trim()}
              className={`w-full py-2 px-4 rounded-md text-white font-medium ${
                isGenerating || (imageAction === 'edit' && !uploadedImage) || !prompt.trim()
                  ? 'bg-gray-400 cursor-not-allowed'
                  : 'bg-indigo-600 hover:bg-indigo-700'
              }`}
            >
              {isGenerating ? 'Generating...' : imageAction === 'generate' ? 'Generate Image' : 'Edit Image'}
            </button>
          </div>

          {/* תצוגת התמונה שנוצרה */}
          <div className="bg-white rounded-xl p-6 shadow-sm">
            <h2 className="text-xl font-semibold mb-4">Generated Image</h2>
            
            {generatedImageUrl ? (
              <div className="text-center">
                <img 
                  src={generatedImageUrl} 
                  alt="Generated image" 
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
                      if (imageAction === 'edit') {
                        setUploadedImage(null);
                        setPreviewUrl(null);
                      }
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
                <p className="mt-2">Your generated image will appear here</p>
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
                    alt={`Generated image ${index + 1}`} 
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
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Generate Images</h3>
              <p className="text-gray-600 text-sm">
                Create brand new images from text descriptions. The more detailed your prompt, the better the results.
                Try to be specific about style, colors, lighting, and composition.
              </p>
            </div>
            <div className="border border-gray-200 rounded-lg p-4">
              <h3 className="font-medium text-lg mb-2">Edit Images</h3>
              <p className="text-gray-600 text-sm">
                Transform existing images using text prompts. Upload an image and describe how you want to modify it.
              </p>
            </div>
          </div>
          <div className="mt-4 text-sm text-gray-500">
            <p>Powered by OpenAI's GPT Image model. Images are generated using advanced AI technology.</p>
            <p className="mt-1">Tip: For best results with image editing, use clear images and detailed prompts that describe what you want to change.</p>
          </div>
        </div>
      </div>
    </div>
  );
}