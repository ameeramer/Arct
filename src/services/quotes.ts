import { db } from './firebase';
import {
  collection,
  addDoc,
  doc,
  getDocs,
  query,
  where,
  updateDoc,
} from 'firebase/firestore';

export type Quote = {
  projectId: string;
  tag: string;
  priceRange: string;
  createdAt: Date;
};


export type QuoteWithId = {
    id: string;
    projectId: string;
    tag: string;
    priceRange: string;
    createdAt: Date;
};

export async function submitQuote(quote: Quote): Promise<void> {
  const q = query(
    collection(db, 'quotes'),
    where('projectId', '==', quote.projectId),
    where('tag', '==', quote.tag)
  );
  const snapshot = await getDocs(q);

  if (!snapshot.empty) {
    const docRef = doc(db, 'quotes', snapshot.docs[0].id);
    await updateDoc(docRef, {
      priceRange: quote.priceRange,
      createdAt: quote.createdAt,
    });
  } else {
    await addDoc(collection(db, 'quotes'), quote);
  }
}
