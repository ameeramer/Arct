import { arrayUnion, arrayRemove, doc, getDoc, setDoc, updateDoc, collection, getDocs } from 'firebase/firestore';
import { db } from './firebase';
import { deleteImage } from './storage';

export interface UserProfile {
  id: string;
  name?: string;
  avatar?: string;
  roles?: string[];
  projects?: string[];
  phoneNumber?: string;
  yearsOfExperience?: number;
  workRegions?: Array<{ name: string; place_id?: string }>;
  galleryUrls?: string[];
  aboutMe?: string;
}

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.id);
  await setDoc(ref, {
    name: profile.name,
    avatar: profile.avatar,
    roles: profile.roles,
    projects: [],
    phoneNumber: profile.phoneNumber,
    yearsOfExperience: profile.yearsOfExperience,
    workRegions: profile.workRegions || [],
    galleryUrls: profile.galleryUrls || [],
    aboutMe: profile.aboutMe || '',
  });
}

export async function addProjectToUser(userId: string, projectId: string): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    projects: arrayUnion(projectId),
  });
}

export async function getUserProjectsByReference(userId: string): Promise<string[]> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    return snap.data().projects || [];
  }
  return [];
}

export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  const ref = doc(db, 'users', userId);
  const snap = await getDoc(ref);
  if (snap.exists()) {
    const profile = snap.data() as UserProfile;
    profile.id = userId;
    return profile;
  }
  return null;
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.id);
  
  // Create an object with only the fields we want to update
  const updateData: Partial<UserProfile> = {
    name: profile.name,
    phoneNumber: profile.phoneNumber,
    yearsOfExperience: profile.yearsOfExperience,
    aboutMe: profile.aboutMe,
    roles: profile.roles,
    workRegions: profile.workRegions,
    // Add other fields as needed when expanding functionality
  };
  
  // Remove any undefined fields to prevent errors
  Object.keys(updateData).forEach(key => {
    if (updateData[key as keyof Partial<UserProfile>] === undefined) {
      delete updateData[key as keyof Partial<UserProfile>];
    }
  });
  
  await updateDoc(ref, updateData);
}

export async function addImageToGallery(userId: string, imageUrl: string): Promise<void> {
  const ref = doc(db, 'users', userId);
  await updateDoc(ref, {
    galleryUrls: arrayUnion(imageUrl),
  });
}

export async function removeImageFromGallery(userId: string, imageUrl: string): Promise<void> {
  const ref = doc(db, 'users', userId);
  
  // Remove from Firestore
  await updateDoc(ref, {
    galleryUrls: arrayRemove(imageUrl),
  });
  
  // Delete the image from storage
  try {
    await deleteImage(imageUrl);
  } catch (error) {
    console.error('Error deleting image from storage:', error);
    // Continue even if storage deletion fails
  }
}

/**
 * מחזיר את כל פרופילי המשתמשים במערכת
 * @returns הבטחה שמחזירה מערך של פרופילי משתמשים
 */
export const getAllUserProfiles = async (): Promise<UserProfile[]> => {
  try {
    const usersCollection = collection(db, 'users');
    const usersSnapshot = await getDocs(usersCollection);
    
    const userProfiles: UserProfile[] = [];
    usersSnapshot.forEach((doc) => {
      userProfiles.push({
        id: doc.id,
        ...doc.data()
      } as UserProfile);
    });
    
    return userProfiles;
  } catch (error) {
    console.error('Error fetching all user profiles:', error);
    throw error;
  }
};
