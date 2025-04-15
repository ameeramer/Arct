import { useState } from 'react';

type Props = {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (message: string) => void;
};

export default function JoinRequestModal({ isOpen, onClose, onSubmit }: Props) {
  const [message, setMessage] = useState('');

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 bg-black bg-opacity-30 flex justify-center items-center">
      <div className="bg-white w-full max-w-md rounded-2xl p-6 shadow-xl">
        <h2 className="text-lg font-semibold mb-4">Request to Join Project</h2>
        <textarea
          className="w-full p-3 border rounded resize-none text-sm mb-4"
          rows={4}
          placeholder="Write a message to the project owner..."
          value={message}
          onChange={(e) => setMessage(e.target.value)}
        />
        <div className="flex justify-end gap-2">
          <button
            onClick={onClose}
            className="px-4 py-2 text-sm text-gray-700 bg-gray-100 rounded"
          >
            Cancel
          </button>
          <button
            onClick={() => {
              onSubmit(message);
              setMessage('');
              onClose();
            }}
            className="px-4 py-2 text-sm text-white bg-black rounded"
          >
            Request
          </button>
        </div>
      </div>
    </div>
  );
}
