import { doc, setDoc } from 'firebase/firestore';
import { db } from './firebase';

type UserProfile = {
  id: string;
  name: string;
  avatar: string;
  role: string;
};

export async function createUserProfile(profile: UserProfile): Promise<void> {
  const ref = doc(db, 'users', profile.id);
  await setDoc(ref, {
    name: profile.name,
    avatar: profile.avatar,
    role: profile.role,
  });
}
