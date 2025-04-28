import AIChatWithImage from '../components/AIChatWithImage';

export default function AIChatPage() {
  return (
    <div className="flex flex-col h-screen">
      <header className="px-4 py-3 bg-gray-100 border-b">
        <h1 className="text-xl font-semibold">AI Chat with Images</h1>
      </header>
      
      <main className="flex-1 overflow-hidden">
        <AIChatWithImage />
      </main>
    </div>
  );
} 