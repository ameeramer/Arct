import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { uploadImage } from '../services/storage';
import { createUserProfile } from '../services/users';
import { auth } from '../services/firebase';

export default function CompleteSignupPage() {
  const [name, setName] = useState('');
  const [role, setRole] = useState('client');
  const [file, setFile] = useState<File | null>(null);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async () => {
    if (!name || !file || !auth.currentUser) {
      setError('Please fill all fields and upload a profile image.');
      return;
    }

    const imageUrl = await uploadImage(file, `avatars/${auth.currentUser.uid}`);
    await createUserProfile({
      id: auth.currentUser.uid,
      name,
      avatar: imageUrl,
      role,
    });

    navigate('/');
  };

  return (
    <div className="p-6 max-w-md mx-auto">
      <h1 className="text-2xl font-bold mb-4">Complete Your Profile</h1>

      <label className="block mb-2 font-medium">Your Name</label>
      <input
        type="text"
        className="w-full border px-4 py-2 rounded mb-4"
        value={name}
        onChange={(e) => setName(e.target.value)}
      />

      <label className="block mb-2 font-medium">Select Role</label>
      <select
        className="w-full border px-4 py-2 rounded mb-4"
        value={role}
        onChange={(e) => setRole(e.target.value)}
      >
        <option value="client">Client</option>
        <option value="architect">Architect</option>
        <option value="designer">Designer</option>
        <option value="contractor">Contractor</option>
      </select>

      <label className="block mb-2 font-medium">Profile Image</label>
      <input
        type="file"
        accept="image/*"
        onChange={(e) => setFile(e.target.files?.[0] || null)}
        className="mb-4"
      />

      {error && <p className="text-red-500 text-sm mb-4">{error}</p>}

      <button
        onClick={handleSubmit}
        className="w-full bg-black text-white py-2 rounded"
      >
        Continue
      </button>
    </div>
  );
}
