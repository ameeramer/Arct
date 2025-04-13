// src/services/upload.ts
import { ref, uploadBytes, getDownloadURL } from 'firebase/storage';
import { storage } from './firebase';

export async function uploadImage(file: File, filename: string): Promise<string> {
  const storageRef = ref(storage, `images/${filename}`);
  await uploadBytes(storageRef, file);
  return await getDownloadURL(storageRef);
}