interface ProfileGalleryProps {
  galleryUrls: string[];
  t: any;
}

export default function ProfileGallery({ galleryUrls, t }: ProfileGalleryProps) {
  if (!galleryUrls || galleryUrls.length === 0) {
    return (
      <div className="py-8 text-center">
        <p className="text-gray-500">{t.noGallery}</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
      {galleryUrls.map((url, index) => (
        <div key={index} className="relative group overflow-hidden rounded-lg">
          <img 
            src={url} 
            alt={`Gallery image ${index + 1}`} 
            className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
          />
          <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-opacity duration-300 flex items-center justify-center">
            <button 
              onClick={() => window.open(url, '_blank')}
              className="opacity-0 group-hover:opacity-100 transition-opacity duration-300 bg-white text-gray-800 px-3 py-1 rounded-md text-sm font-medium"
            >
              View
            </button>
          </div>
        </div>
      ))}
    </div>
  );
} 