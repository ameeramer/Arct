import { useState, useEffect } from 'react';

interface ProfileGalleryProps {
  galleryUrls: string[];
  t: {
    noGallery: string;
  };
}

export default function ProfileGallery({ galleryUrls, t }: ProfileGalleryProps) {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const [currentIndex, setCurrentIndex] = useState<number>(0);

  // Handle keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (!selectedImage) return;
      
      if (e.key === 'Escape') {
        setSelectedImage(null);
      } else if (e.key === 'ArrowRight') {
        showNextImage();
      } else if (e.key === 'ArrowLeft') {
        showPrevImage();
      }
    };
    
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [selectedImage, currentIndex, galleryUrls]);

  // Open image modal
  const openImageModal = (url: string, index: number) => {
    setSelectedImage(url);
    setCurrentIndex(index);
  };

  // Show next image
  const showNextImage = () => {
    if (galleryUrls.length <= 1) return;
    const nextIndex = (currentIndex + 1) % galleryUrls.length;
    setCurrentIndex(nextIndex);
    setSelectedImage(galleryUrls[nextIndex]);
  };

  // Show previous image
  const showPrevImage = () => {
    if (galleryUrls.length <= 1) return;
    const prevIndex = (currentIndex - 1 + galleryUrls.length) % galleryUrls.length;
    setCurrentIndex(prevIndex);
    setSelectedImage(galleryUrls[prevIndex]);
  };

  if (!galleryUrls || galleryUrls.length === 0) {
    return <p className="text-gray-500 text-sm">{t.noGallery}</p>;
  }

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-4">
        {galleryUrls.map((url, index) => (
          <div 
            key={index} 
            className="cursor-pointer"
            onClick={() => openImageModal(url, index)}
          >
            <img 
              src={url} 
              alt={`Gallery image ${index + 1}`} 
              className="w-full h-40 object-cover rounded-lg hover:opacity-90 transition"
            />
          </div>
        ))}
      </div>

      {/* Image Modal */}
      {selectedImage && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-80 flex items-center justify-center z-50"
          onClick={() => setSelectedImage(null)}
        >
          <div 
            className="relative max-w-4xl max-h-[90vh] mx-4"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Navigation arrows */}
            {galleryUrls.length > 1 && (
              <>
                <button 
                  className="absolute left-10 top-1/2 transform -translate-y-1/2 -translate-x-12 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                  onClick={showPrevImage}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" />
                  </svg>
                </button>
                <button 
                  className="absolute right-10 top-1/2 transform -translate-y-1/2 translate-x-12 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
                  onClick={showNextImage}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                  </svg>
                </button>
              </>
            )}
            
            {/* Close button */}
            <button 
              className="absolute top-0 right-0 -translate-y-12 bg-black bg-opacity-50 text-white p-2 rounded-full hover:bg-opacity-70 focus:outline-none"
              onClick={() => setSelectedImage(null)}
            >
              <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
            
            {/* Image */}
            <img 
              src={selectedImage} 
              alt="Gallery image" 
              className="max-h-[90vh] max-w-full object-contain rounded-lg"
            />
            
            {/* Image counter */}
            <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 -translate-y-8 bg-black bg-opacity-50 text-white px-3 py-1 rounded-full text-sm">
              {currentIndex + 1} / {galleryUrls.length}
            </div>
          </div>
        </div>
      )}
    </div>
  );
} 