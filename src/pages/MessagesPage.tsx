import { useEffect, useState } from 'react';
import { getUnifiedInboxForUser } from '../services/messages';
import { auth, db } from '../services/firebase';
import { useNavigate } from 'react-router-dom';
import { doc, getDoc } from 'firebase/firestore';

export default function MessagesPage() {
  const [messages, setMessages] = useState<any[]>([]);
  const [users, setUsers] = useState<{ [id: string]: any }>({});
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMessages = async () => {
      const user = auth.currentUser;
      if (!user) return;

      const inbox = await getUnifiedInboxForUser(user.uid);
      console.log(inbox);
      setMessages(inbox);

      const userIds = Array.from(
        new Set(inbox.map((m) =>
          m.fromUserId === auth.currentUser?.uid ? m.toUserId : m.fromUserId
        ))
      );

      const usersMap: { [id: string]: any } = {};
      for (const id of userIds) {
        const snap = await getDoc(doc(db, 'users', id));
        if (snap.exists()) usersMap[id] = snap.data();
      }
      setUsers(usersMap);
    };

    fetchMessages();
  }, []);

  return (
    <div className="p-4 pb-24">
      <h1 className="text-2xl font-bold mb-4">Messages</h1>

      <div className="space-y-3">
        {messages.map((msg) => {
          const userId =
            msg.fromUserId === auth.currentUser?.uid ? msg.toUserId : msg.fromUserId;
          const user = users[userId];

          return (
            <div
              key={msg.id}
              onClick={async () => {
                const from = msg.fromUserId;
                const to = msg.toUserId;
                const currentId = auth.currentUser?.uid;
                if (!currentId) return;
                const otherId = from === currentId ? to : from;

                const projectSnap = await getDoc(doc(db, 'projects', msg.projectId));
                const projectName = projectSnap.exists() ? projectSnap.data().title : 'Unknown Project';

                const quoteSnap = await getDoc(doc(db, 'quotes', msg.quoteId));
                const quoteRole = quoteSnap.exists() ? quoteSnap.data().tag : 'Unknown Quote';

                const { openOrCreateChat } = await import('../services/chats');

                const chatId = await openOrCreateChat(currentId, otherId, {
                  senderId: msg.fromUserId,
                  text: msg.type === 'message' ? msg.message : user?.name + ' has requested to join project ' + projectName + ' as ' + quoteRole + ' with message: ' + msg.message,
                  createdAt: msg.createdAt,
                });

                navigate(`/chat/${chatId}`);
              }}
              className="flex items-center justify-between bg-white rounded-lg shadow px-3 py-2"
            >
              <div className="flex items-center gap-3">
                <img
                  src={user?.avatar || '/placeholder.jpg'}
                  className="w-10 h-10 rounded-full object-cover"
                />
                <div>
                  <div className="font-medium text-sm">{user?.name || '...'}</div>
                  <div className="text-xs text-gray-600 truncate w-48">
                    {msg.type === 'joinRequest'
                      ? 'Sent a join request'
                      : msg.text}
                  </div>
                </div>
              </div>
              <div className="text-xs text-gray-400">
                {msg.createdAt?.toDate?.().toLocaleTimeString?.([], {
                  hour: '2-digit',
                  minute: '2-digit',
                })}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
