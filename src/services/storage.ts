// src/services/upload.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

// Check if we're in a development environment
const isDevelopment = window.location.hostname === 'localhost' || window.location.hostname === '127.0.0.1';

// Option to use local data URLs instead of Firebase for development
const USE_LOCAL_URLS_IN_DEV = true;

export async function uploadImage(file: File, filename: string): Promise<string> {
  try {
    // Make sure the path is clean and standardized
    const fullPath = `images/${filename}`.replace(/\/+/g, '/');
    console.log('Uploading to path:', fullPath);

    // Process the image before uploading to ensure consistent format
    const processedFile = await processImageBeforeUpload(file);
    
    // For development environment, optionally use data URLs to avoid CORS issues
    if (isDevelopment && USE_LOCAL_URLS_IN_DEV) {
      console.log('Development mode: Using local data URL instead of Firebase Storage');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            throw new Error('Failed to convert to data URL');
          }
        };
        reader.readAsDataURL(processedFile);
      });
    }
    
    // Create storage reference
    const storageRef = ref(storage, fullPath);
    
    // Set metadata to help with CORS issues
    const metadata = {
      contentType: processedFile.type,
      customMetadata: {
        'uploaded-by': 'chat-app',
        'original-filename': file.name
      }
    };
    
    // Upload the file with metadata
    const snapshot = await uploadBytes(storageRef, processedFile, metadata);
    console.log('Upload successful:', snapshot.metadata.name);
    
    // Get download URL
    const downloadURL = await getDownloadURL(storageRef);
    console.log('Download URL generated:', downloadURL);
    
    return downloadURL;
  } catch (error) {
    console.error('Error uploading image:', error);
    
    // In case of error in dev mode, fallback to data URL
    if (isDevelopment) {
      console.log('Upload failed, falling back to data URL');
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = () => {
          if (typeof reader.result === 'string') {
            resolve(reader.result);
          } else {
            throw new Error('Failed to convert to data URL');
          }
        };
        reader.readAsDataURL(file);
      });
    }
    
    throw error;
  }
}

// Helper function to process image before upload
async function processImageBeforeUpload(file: File): Promise<File> {
  return new Promise((resolve, reject) => {
    // Create a new Image object
    const img = new Image();
    const reader = new FileReader();

    reader.onload = (e) => {
      img.onload = () => {
        // Get dimensions while preserving aspect ratio
        let width = img.width;
        let height = img.height;
        const maxDimension = 1200; // Max size to prevent overly large uploads
        
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
          const newFile = new File([blob], file.name.replace(/\.[^/.]+$/, '.png'), {
            type: 'image/png',
            lastModified: Date.now()
          });
          
          resolve(newFile);
        }, 'image/png', 0.85); // Use 0.85 quality for good balance
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
}

export async function downloadImageFromStorage(path: string): Promise<Blob> {
  // If the path is already a data URL (used in development mode)
  if (path.startsWith('data:')) {
    return fetch(path).then(res => res.blob());
  }

  try {
    const storageRef = ref(storage, path);
    const downloadURL = await getDownloadURL(storageRef);
    const response = await fetch(downloadURL);
    if (!response.ok) {
      throw new Error('Failed to download image from storage');
    }
    return await response.blob();
  } catch (error) {
    console.error('Error downloading from Firebase Storage:', error);
    
    // Create a placeholder image as fallback
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 512;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = '#f5f5f5';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.font = '20px Arial';
      ctx.fillStyle = '#333';
      ctx.textAlign = 'center';
      ctx.fillText('שגיאה בטעינת התמונה', canvas.width/2, canvas.height/2);
    }
    
    return new Promise<Blob>((resolve, reject) => {
      canvas.toBlob((blob) => {
        if (blob) {
          resolve(blob);
        } else {
          reject(new Error('Failed to create placeholder image'));
        }
      }, 'image/png');
    });
  }
}

export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract the path from the URL
  try {
    // Firebase storage URLs contain a token after the path, so we need to extract just the path
    
    // The path starts after "o/" and ends before "?"
    const pathStart = imageUrl.indexOf('/o/') + 3;
    const pathEnd = imageUrl.indexOf('?');
    
    if (pathStart <= 2 || pathEnd <= pathStart) {
      throw new Error('Invalid Firebase Storage URL format');
    }
    
    let path = imageUrl.substring(pathStart, pathEnd);
    
    // Decode the URL-encoded path
    path = decodeURIComponent(path);
    console.log('Deleting storage path:', path);
    
    // Create a reference to the file
    const imageRef = ref(storage, path);
    
    // Delete the file
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error parsing image URL or deleting image:', error);
    throw error;
  }
}