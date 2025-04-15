import { useEffect, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { auth, db } from '../services/firebase';
import {
  collection,
  query,
  orderBy,
  onSnapshot,
  addDoc,
  serverTimestamp,
  getDoc,
  doc,
} from 'firebase/firestore';

export default function ChatPage() {
  const { chatId } = useParams();
  const [messages, setMessages] = useState<any[]>([]);
  const [text, setText] = useState('');
  const [chatParticipants, setChatParticipants] = useState<{ [key: string]: any }>({});
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!chatId) return;

    const [id1, id2] = chatId.split('_');
    const fetchUsers = async () => {
      const snap1 = await getDoc(doc(db, 'users', id1));
      const snap2 = await getDoc(doc(db, 'users', id2));
      const data: { [key: string]: any } = {};
      if (snap1.exists()) data[id1] = snap1.data();
      if (snap2.exists()) data[id2] = snap2.data();
      setChatParticipants(data);
    };

    fetchUsers();
    
    const q = query(
      collection(db, 'chats', chatId, 'messages'),
      orderBy('createdAt')
    );
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }));
      setMessages(msgs);
      console.log(msgs);
      setTimeout(() => scrollRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
    });

    return () => unsubscribe();
  }, [chatId]);

  const sendMessage = async () => {
    const user = auth.currentUser;
    if (!user || !text.trim()) return;

    await addDoc(collection(db, 'chats', chatId!, 'messages'), {
      senderId: user.uid,
      text: text.trim(),
      createdAt: serverTimestamp(),
    });

    setText('');
  };

  return (
    <div className="flex flex-col h-screen p-4 pb-24">
      <h1 className="text-xl font-bold mb-4">Chat</h1>
      <div className="flex-1 overflow-y-auto space-y-2 mb-4">
        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex items-end gap-2 max-w-xs ${
              msg.senderId === auth.currentUser?.uid ? 'self-end flex-row-reverse' : 'self-start'
            }`}
          >
            <img
              src={chatParticipants[msg.senderId]?.avatar || '/placeholder.jpg'}
              alt="avatar"
              className="w-6 h-6 rounded-full"
            />
            <div
              className={`p-2 rounded ${
                msg.senderId === auth.currentUser?.uid ? 'bg-green-100' : 'bg-gray-100'
              }`}
            >
              {msg.text}
            </div>
          </div>
        ))}
        <div ref={scrollRef} />
      </div>
      <div className="flex gap-2">
        <input
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Type a message..."
          className="flex-1 border p-2 rounded"
        />
        <button onClick={sendMessage} className="bg-black text-white px-4 rounded">
          Send
        </button>
      </div>
    </div>
  );
}
