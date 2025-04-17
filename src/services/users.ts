import { arrayUnion, doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { db } from './firebase';

export type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  roles: string[];
  projects: string[];
  phoneNumber: string;
  yearsOfExperience: number;
  workRegions: string[];
  galleryUrls?: string[];
  aboutMe?: string;
};

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.id);
  await setDoc(ref, {
    name: profile.name,
    avatar: profile.avatar,
    roles: profile.roles,
    projects: [],
    phoneNumber: profile.phoneNumber,
    yearsOfExperience: profile.yearsOfExperience,
    workRegions: profile.workRegions,
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
    return snap.data() as UserProfile;
  }
  return null;
}

export async function updateUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.id);
  await updateDoc(ref, {
    name: profile.name,
    phoneNumber: profile.phoneNumber,
    // Add other fields as needed when expanding functionality
  });
}
