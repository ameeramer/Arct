import { useState, useRef } from 'react';
import { uploadImage } from '../../services/storage';
import { addImageToGallery, removeImageFromGallery } from '../../services/users';
import { processProfileImage } from '../../utils/imageProcessing';

interface ProfileGalleryManagerProps {
  userId: string;
  galleryUrls: string[];
  language: 'he' | 'ar' | 'en';
  onUpdate: (updatedGallery: string[]) => void;
}

// Translation data
const translations = {
  he: {
    title: "גלריית עבודות",
    upload: "העלה תמונה",
    delete: "מחק",
    confirm: "האם אתה בטוח שברצונך למחוק תמונה זו?",
    yes: "כן",
    no: "לא",
    uploading: "מעלה...",
    dragDrop: "גרור ושחרר תמונה כאן או לחץ לבחירה",
    imageType: "ניתן להעלות תמונות בפורמט JPG, PNG או GIF",
    maxSize: "גודל מקסימלי: 5MB",
    error: "שגיאה בהעלאת התמונה. אנא נסה שוב."
  },
  ar: {
    title: "معرض الأعمال",
    upload: "تحميل صورة",
    delete: "حذف",
    confirm: "هل أنت متأكد أنك تريد حذف هذه الصورة؟",
    yes: "نعم",
    no: "لا",
    uploading: "جاري التحميل...",
    dragDrop: "اسحب وأفلت الصورة هنا أو انقر للاختيار",
    imageType: "يمكنك تحميل صور بتنسيق JPG أو PNG أو GIF",
    maxSize: "الحجم الأقصى: 5 ميجابايت",
    error: "خطأ في تحميل الصورة. يرجى المحاولة مرة أخرى."
  },
  en: {
    title: "Work Gallery",
    upload: "Upload Image",
    delete: "Delete",
    confirm: "Are you sure you want to delete this image?",
    yes: "Yes",
    no: "No",
    uploading: "Uploading...",
    dragDrop: "Drag and drop an image here or click to select",
    imageType: "You can upload JPG, PNG, or GIF images",
    maxSize: "Maximum size: 5MB",
    error: "Error uploading image. Please try again."
  }
};

export default function ProfileGalleryManager({ userId, galleryUrls, language, onUpdate }: ProfileGalleryManagerProps) {
  const [isUploading, setIsUploading] = useState(false);
  const [error, setError] = useState('');
  const [imageToDelete, setImageToDelete] = useState<string | null>(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  // Get translations based on selected language
  const t = translations[language];
  
  const handleFileSelect = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;
    
    await uploadImageFile(files[0]);
    
    // Clear the input so the same file can be selected again
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };
  
  const handleDrop = async (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    
    const files = e.dataTransfer.files;
    if (!files || files.length === 0) return;
    
    await uploadImageFile(files[0]);
  };
  
  const uploadImageFile = async (file: File) => {
    // Check file type
    if (!file.type.match('image.*')) {
      setError(t.imageType);
      return;
    }
    
    // Check file size (5MB max)
    if (file.size > 5 * 1024 * 1024) {
      setError(t.maxSize);
      return;
    }
    
    try {
      setIsUploading(true);
      setError('');
      
      // Process image before uploading
      const processedFile = await processProfileImage(file);
      
      // Upload image to storage
      const path = `gallery/${userId}/${Date.now()}_${file.name.replace(/\.[^/.]+$/, '.png')}`;
      const imageUrl = await uploadImage(processedFile, path);
      
      // Add image URL to user's gallery
      await addImageToGallery(userId, imageUrl);
      
      // Update local state
      const updatedGallery = [...galleryUrls, imageUrl];
      onUpdate(updatedGallery);
    } catch (err) {
      console.error('Error uploading image:', err);
      setError(t.error);
    } finally {
      setIsUploading(false);
    }
  };
  
  const handleDeleteImage = async () => {
    if (!imageToDelete) return;
    
    try {
      // Remove image from gallery
      await removeImageFromGallery(userId, imageToDelete);
      
      // Update local state
      const updatedGallery = galleryUrls.filter(url => url !== imageToDelete);
      onUpdate(updatedGallery);
      
      // Close confirmation dialog
      setImageToDelete(null);
    } catch (err) {
      console.error('Error deleting image:', err);
      setError(t.error);
    }
  };
  
  return (
    <div className="space-y-6" dir={language === 'en' ? 'ltr' : 'rtl'}>
      <h2 className="text-xl font-semibold text-gray-800">{t.title}</h2>
      
      {/* Upload area */}
      <div 
        className={`border-2 border-dashed rounded-lg p-6 text-center ${
          isDragging ? 'border-indigo-500 bg-indigo-50' : 'border-gray-300 hover:border-indigo-400'
        } transition-colors cursor-pointer`}
        onClick={() => fileInputRef.current?.click()}
        onDragOver={(e) => {
          e.preventDefault();
          setIsDragging(true);
        }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isUploading ? (
          <div className="text-center">
            <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600 mx-auto"></div>
            <p className="mt-2 text-sm text-gray-600">{t.uploading}</p>
          </div>
        ) : (
          <>
            <svg className="mx-auto h-12 w-12 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
            </svg>
            <p className="mt-2 text-sm text-gray-600">{t.dragDrop}</p>
            <p className="mt-1 text-xs text-gray-500">{t.imageType}</p>
            <p className="text-xs text-gray-500">{t.maxSize}</p>
          </>
        )}
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isUploading}
        />
      </div>
      
      {error && (
        <div className="text-red-500 text-sm">{error}</div>
      )}
      
      {/* Gallery grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {galleryUrls.map((url, index) => (
          <div key={index} className="relative group">
            <img 
              src={url} 
              alt={`Gallery image ${index + 1}`} 
              className="w-full h-40 object-cover rounded-lg"
            />
            <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-opacity flex items-center justify-center">
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setImageToDelete(url);
                }}
                className="opacity-0 group-hover:opacity-100 bg-red-600 text-white px-3 py-1 rounded-md hover:bg-red-700 transition"
              >
                {t.delete}
              </button>
            </div>
          </div>
        ))}
      </div>
      
      {/* Delete confirmation dialog */}
      {imageToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 max-w-sm mx-auto">
            <h3 className="text-lg font-medium text-gray-900 mb-4">{t.confirm}</h3>
            <div className="mt-4 flex justify-end space-x-3">
              <button
                onClick={() => setImageToDelete(null)}
                className="px-4 py-2 bg-gray-200 text-gray-800 rounded-md hover:bg-gray-300 transition"
              >
                {t.no}
              </button>
              <button
                onClick={handleDeleteImage}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition"
              >
                {t.yes}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 