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
  imageUrl: string;
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