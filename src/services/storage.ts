// src/services/upload.ts
import { ref, uploadBytes, getDownloadURL, deleteObject } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(file: File, filename: string): Promise<string> {
  const storageRef = ref(storage, `images/${filename}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}

export async function deleteImage(imageUrl: string): Promise<void> {
  // Extract the path from the URL
  try {
    // Firebase storage URLs contain a token after the path, so we need to extract just the path
    
    // The path starts after "o/" and ends before "?"
    const pathStart = imageUrl.indexOf('/o/') + 3;
    const pathEnd = imageUrl.indexOf('?');
    let path = imageUrl.substring(pathStart, pathEnd);
    
    // Decode the URL-encoded path
    path = decodeURIComponent(path);
    
    // Create a reference to the file
    const imageRef = ref(storage, path);
    
    // Delete the file
    await deleteObject(imageRef);
  } catch (error) {
    console.error('Error parsing image URL or deleting image:', error);
    throw error;
  }
}