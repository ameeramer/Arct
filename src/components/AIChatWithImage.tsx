import { useState, useRef, useEffect } from 'react';
import { PaperAirplaneIcon, PhotoIcon } from '@heroicons/react/24/outline';
import { 
  ChatMessage, 
  ChatContent, 
  processWithAgent
} from '../services/ai';

interface Message {
  id: number;
  role: 'user' | 'assistant';
  content: string;
  image?: string;
}

export default function AIChatWithImage() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadedImage, setUploadedImage] = useState<File | null>(null);
  const [uploadedImagePreview, setUploadedImagePreview] = useState<string | null>(null);
  const [imageCaption, setImageCaption] = useState('');
  const fileInputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom of chat
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Convert our UI messages to the format expected by the OpenAI API
  const formatMessagesForAPI = (): ChatMessage[] => {
    return messages.map(msg => ({
      role: msg.role === 'user' ? 'user' : 'assistant',
      content: msg.image 
        ? [
            { type: 'text', text: msg.content } as ChatContent,
            { 
              type: 'image_url', 
              image_url: { url: msg.image } 
            } as ChatContent
          ]
        : msg.content
    }));
  };

  // Handle file upload
  const handleFileUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setError(null);
      
      // Preprocess the image to ensure consistent format and size
      // Using the canvas approach as in CompleteSignupPage
      const processedFile = await processImageLocally(file);
      setUploadedImage(processedFile);
      
      // Create a preview URL
      const previewUrl = URL.createObjectURL(processedFile);
      setUploadedImagePreview(previewUrl);
      
    } catch (err) {
      console.error('Error handling file upload:', err);
      setError(err instanceof Error ? err.message : 'Failed to upload image');
    } finally {
      // Clear the file input
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  // Process image locally before uploading
  const processImageLocally = (file: File): Promise<File> => {
    return new Promise((resolve, reject) => {
      const img = new Image();
      const reader = new FileReader();

      reader.onload = (e) => {
        img.onload = () => {
          // Get dimensions while preserving aspect ratio
          let width = img.width;
          let height = img.height;
          const maxDimension = 1200; // Max size for upload
          
          // Calculate new dimensions if image is too large
          if (width > maxDimension || height > maxDimension) {
            if (width > height) {
              height = Math.round((height * maxDimension) / width);
              width = maxDimension;
            } else {
              width = Math.round((width * maxDimension) / height);
              height = maxDimension;
            }
          }

          // Create canvas for drawing the resized image
          const canvas = document.createElement('canvas');
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          
          if (!ctx) {
            reject(new Error('Failed to get canvas context'));
            return;
          }
          
          // Draw image to canvas
          ctx.drawImage(img, 0, 0, width, height);
          
          // Convert to PNG format
          canvas.toBlob((blob) => {
            if (!blob) {
              reject(new Error('Failed to convert image'));
              return;
            }
            
            // Create new file from the blob
            const newFile = new File([blob], file.name, {
              type: 'image/png',
              lastModified: Date.now()
            });
            
            resolve(newFile);
          }, 'image/png', 0.85);
        };
        
        img.onerror = () => {
          reject(new Error('Failed to load image'));
        };
        
        // Set image source from file reader result
        img.src = e.target?.result as string;
      };
      
      reader.onerror = () => {
        reject(new Error('Failed to read file'));
      };
      
      // Read file as data URL
      reader.readAsDataURL(file);
    });
  };

  // Cancel uploading image
  const handleCancelImage = () => {
    setUploadedImage(null);
    setUploadedImagePreview(null);
    setImageCaption('');
  };

  // Handle sending a message with the uploaded image
  const handleSendWithImage = async () => {
    if (!uploadedImage) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Use the local data URL directly instead of uploading to Firebase
      const imageUrl = uploadedImagePreview || '';
      
      // Add user message with image immediately
      const userMessage: Message = {
        id: messages.length + 1,
        role: 'user',
        content: imageCaption || 'Here is an image:',
        image: imageUrl
      };
      
      // Show user message immediately
      setMessages([...messages, userMessage]);
      
      // Reset upload state
      setUploadedImage(null);
      setUploadedImagePreview(null);
      
      // Use agent to get response - pass the actual File object directly
      const apiMessages = formatMessagesForAPI();
      const { responseText, imageBlob } = await processWithAgent(apiMessages, imageCaption || 'Analyze this image', uploadedImage);
      
      // Add AI response
      if (imageBlob) {
        // If there's an edited image, create a local data URL
        const imageFile = new File([imageBlob], `edited-${Date.now()}.png`, { type: 'image/png' });
        
        // Create a data URL for the edited image
        const editedImageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              resolve('');
            }
          };
          reader.readAsDataURL(imageFile);
        });
        
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            role: 'assistant',
            content: responseText,
            image: editedImageUrl
          }
        ]);
      } else {
        // Just text response
        setMessages(prev => [
          ...prev,
          {
            id: prev.length + 1,
            role: 'assistant',
            content: responseText
          }
        ]);
      }
      
      // Reset caption
      setImageCaption('');
      
    } catch (err) {
      console.error('Error processing image:', err);
      setError(err instanceof Error ? err.message : 'Failed to process image');
    } finally {
      setLoading(false);
    }
  };

  // Handle sending a text message
  const handleSendMessage = async () => {
    if (!input.trim()) return;
    
    try {
      setLoading(true);
      setError(null);
      
      // Add user message to chat
      const userMessage: Message = {
        id: messages.length + 1,
        role: 'user',
        content: input
      };
      
      // Show user message immediately
      setMessages([...messages, userMessage]);
      const userInput = input;
      setInput('');
      
      // Use the agent to process the message and decide the appropriate action
      const apiMessages = formatMessagesForAPI();
      const { responseText, imageBlob } = await processWithAgent(apiMessages, userInput);
      
      if (imageBlob) {
        // AI generated an image in response - create a data URL
        const imageFile = new File([imageBlob], `generated-${Date.now()}.png`, { type: 'image/png' });
        
        // Create a data URL for the generated image
        const imageUrl = await new Promise<string>((resolve) => {
          const reader = new FileReader();
          reader.onload = () => {
            if (typeof reader.result === 'string') {
              resolve(reader.result);
            } else {
              resolve('');
            }
          };
          reader.readAsDataURL(imageFile);
        });
        
        // Add the response with the image
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            role: 'assistant',
            content: responseText,
            image: imageUrl
          }
        ]);
      } else {
        // Text-only response
        setMessages(prevMessages => [
          ...prevMessages,
          {
            id: prevMessages.length + 1,
            role: 'assistant',
            content: responseText
          }
        ]);
      }
    } catch (err) {
      console.error('Error sending message:', err);
      setError(err instanceof Error ? err.message : 'Failed to send message');
      
      // Add error message to chat for user visibility
      setMessages(prevMessages => [
        ...prevMessages,
        {
          id: prevMessages.length + 1,
          role: 'assistant',
          content: 'אירעה שגיאה בעיבוד הבקשה שלך. אנא נסה שוב.'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="pb-20 flex flex-col h-full max-w-3xl mx-auto">
      {/* Chat messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.map((message) => (
          <div
            key={message.id}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs md:max-w-md rounded-lg p-3 ${
                message.role === 'user' ? 'bg-black text-white' : 'bg-gray-100'
              }`}
            >
              <div className="whitespace-pre-wrap">{message.content}</div>
              {message.image && (
                <div className="mt-2">
                  <img
                    src={message.image}
                    alt="Chat image"
                    className="max-w-full rounded"
                  />
                </div>
              )}
            </div>
          </div>
        ))}
        <div ref={messagesEndRef} />
        
        {/* Loading indicator */}
        {loading && (
          <div className="flex justify-center py-2">
            <div className="animate-pulse text-gray-500">המערכת מעבדת את הבקשה...</div>
          </div>
        )}
        
        {/* Error message */}
        {error && (
          <div className="flex justify-center py-2">
            <div className="text-red-500">{error}</div>
          </div>
        )}
      </div>
      
      {/* Uploaded image preview and caption controls */}
      {uploadedImagePreview && (
        <div className="border-t p-4 bg-gray-50">
          <div className="flex flex-col space-y-3">
            <div className="text-sm font-medium">תמונה שהועלתה:</div>
            <div className="flex justify-center">
              <img 
                src={uploadedImagePreview} 
                alt="Uploaded preview" 
                className="max-h-48 rounded-lg shadow-sm" 
              />
            </div>
            
            <div>
              <input
                type="text"
                value={imageCaption}
                onChange={(e) => setImageCaption(e.target.value)}
                placeholder="תאר או שאל שאלה על התמונה..."
                className="w-full p-2 border rounded-lg"
              />
            </div>
            
            <div className="flex justify-between">
              <button
                onClick={handleCancelImage}
                className="px-3 py-1 text-sm text-gray-600 hover:text-gray-800"
              >
                ביטול
              </button>
              
              <button
                onClick={handleSendWithImage}
                className="px-3 py-1 bg-black text-white text-sm rounded-md"
              >
                שלח
              </button>
            </div>
          </div>
        </div>
      )}
      
      {/* Chat input */}
      {!uploadedImagePreview && (
        <div className="p-4 border-t">
          <div className="flex items-center gap-2">
            <button
              onClick={() => fileInputRef.current?.click()}
              className="p-2 text-gray-500 hover:text-gray-700"
              title="Upload image"
            >
              <PhotoIcon className="h-5 w-5" />
            </button>
            
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileUpload}
              accept="image/*"
              className="hidden"
            />
            
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="הקלד הודעה..."
              className="flex-1 p-2 border rounded-full"
              onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
            />
            
            <button
              onClick={handleSendMessage}
              disabled={loading || !input.trim()}
              className={`p-2 bg-black text-white rounded-full ${
                loading || !input.trim() ? 'opacity-50' : ''
              }`}
            >
              <PaperAirplaneIcon className="h-5 w-5 rotate-45" />
            </button>
          </div>
        </div>
      )}
    </div>
  );
} 