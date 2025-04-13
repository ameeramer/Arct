import { collection, getDocs, query, where, addDoc, getDoc, doc, setDoc, deleteDoc } from 'firebase/firestore';
import { db } from './firebase';

export type Design = {
  id: string;
  url: string;
  type: 'ai' | 'user' | 'mockAI';
};

export type Update = {
  id: string;
  timestamp: number;
  message: string;
  type?: 'image' | 'text' | 'system';
};

export type Project = {
  id: string;
  title: string;
  updates: Update[];
  designs: Design[];
};

export async function getUserProjects(userId: string): Promise<Project[]> {
  const q = query(collection(db, 'projects'), where('userId', '==', userId));
  const snapshot = await getDocs(q);
  return snapshot.docs.map(doc => ({
    id: doc.id,
    ...doc.data(),
  })) as Project[];
}

export async function createProject(project: Omit<Project, 'id'>): Promise<string> {
  const docRef = await addDoc(collection(db, 'projects'), project);
  return docRef.id;
}

export async function getProject(projectId: string): Promise<Project | null> {
  const docRef = doc(collection(db, 'projects'), projectId);
  const docSnap = await getDoc(docRef);
  return docSnap.exists() ? ({ id: docSnap.id, ...docSnap.data() }) as Project : null;
}

export async function updateProject(project: Project): Promise<void> {
  const docRef = doc(collection(db, 'projects'), project.id);
  await setDoc(docRef, project);
}

export async function deleteProject(projectId: string): Promise<void> {
  const docRef = doc(collection(db, 'projects'), projectId);
  await deleteDoc(docRef);
}

export async function addUpdateToProject(projectId: string, update: Update): Promise<void> {
  const docRef = doc(collection(db, 'projects'), projectId);
  const docSnap = await getDoc(docRef);
  if (!docSnap.exists()) return;

  const projectData = docSnap.data() as Project;
  const updatedProject: Project = {
    ...projectData,
    id: projectId,
    updates: [...projectData.updates, update],
  };

  await setDoc(docRef, updatedProject);
}
