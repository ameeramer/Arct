/**
 * מעבד תמונה: ממיר ל-PNG ומשנה גודל אם צריך
 * @param file קובץ התמונה המקורי
 * @param maxDimension הגודל המקסימלי (פיקסלים) של המימד הגדול ביותר
 * @returns הבטחה שמחזירה את הקובץ המעובד
 */
export const processProfileImage = (file: File, maxDimension: number = 1024): Promise<File> => {
  return new Promise((resolve, reject) => {
    // יצירת אובייקט תמונה חדש
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        // בדיקה אם צריך לשנות גודל
        let width = img.width;
        let height = img.height;
        let needsResize = width > maxDimension || height > maxDimension;

        // חישוב הגודל החדש תוך שמירה על יחס הצדדים
        if (needsResize) {
          if (width > height) {
            height = Math.round((height * maxDimension) / width);
            width = maxDimension;
          } else {
            width = Math.round((width * maxDimension) / height);
            height = maxDimension;
          }
        }

        // יצירת קנבס לציור התמונה המעובדת
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const ctx = canvas.getContext('2d');
        
        if (!ctx) {
          reject(new Error('Failed to get canvas context'));
          return;
        }
        
        // ציור התמונה על הקנבס
        ctx.drawImage(img, 0, 0, width, height);
        
        // המרה ל-PNG
        canvas.toBlob((blob) => {
          if (!blob) {
            reject(new Error('Failed to convert image to PNG'));
            return;
          }
          
          // יצירת קובץ חדש מה-blob
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
            type: 'image/png',
            lastModified: Date.now()
          });
          
          resolve(newFile);
        }, 'image/png');
      };
      
      img.onerror = () => {
        reject(new Error('Failed to load image'));
      };
      
      img.src = e.target?.result as string;
    };
    
    reader.onerror = () => {
      reject(new Error('Failed to read file'));
    };
    
    reader.readAsDataURL(file);
  });
}; 