import React, { useState } from "react";
import { useProject } from "../context/ProjectContext"; // ← Add this line
import { v4 as uuidv4 } from "uuid"; // at the top

const AiChat: React.FC = () => {
  const { data, setData, addDesignOption } = useProject(); // ← Use project data

  const [messages, setMessages] = useState([
    {
      sender: "ai",
      text: `הכנתי עבורך טיוטה לעיצוב ראשוני בהתבסס על הפרטים שמסרת:
- גודל השטח: ${data.size} מ״ר
- מיקום: ${data.location}
- שימוש מיועד: ${data.purpose}
- תיאור: ${data.description}

מה אתה חושב עליה? האם יש משהו שתרצה לשנות?`,
    },
  ]);
  const [input, setInput] = useState("");

  const handleSend = () => {
    if (input.trim() === "") return;

    const userMessage = { sender: "user", text: input };
    setMessages((prev) => [...prev, userMessage]);

    if (input.includes("הוסף לי עצים אדומים")) {
      addDesignOption({
        id: uuidv4(),
        image2d: "/example-2d-red-trees.jpeg",
        image3d: "/example-3d-red-trees.jpeg",
      });

      setMessages((prev) => [
        ...prev,
        {
          sender: "ai",
          text: "הוספתי עיצוב חדש עם עצים אדומים. תוכל לראות אותו למעלה ולעבור בין העיצובים עם החצים.",
        },
      ]);
    } else {
      // Simולציית תגובת AI (כאן תוכל לחבר ל-API בעתיד)
      setTimeout(() => {
        const aiResponse = {
          sender: "ai",
          text: "תודה על ההערה! אני מעדכן את העיצוב בהתאם.",
        };
        setMessages((prev) => [...prev, aiResponse]);
      }, 1000);
    }

    setInput("");
  };

  return (
    <div className="max-w-4xl mx-auto p-4 text-right">
      <h2 className="text-2xl font-bold mb-4">צ׳אט עם הבינה המלאכותית</h2>
      <div className="bg-gray-100 rounded-lg p-4 h-64 overflow-y-auto mb-4">
        {messages.map((msg, index) => (
          <div
            key={index}
            className={`mb-2 ${
              msg.sender === "ai" ? "text-blue-700" : "text-green-700"
            }`}
          >
            <span className="font-semibold">
              {msg.sender === "ai" ? "בינה:" : "אתה:"}
            </span>{" "}
            {msg.text}
          </div>
        ))}
      </div>
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="flex-1 p-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-green-400"
          placeholder="כתוב כאן את ההערה שלך..."
        />
        <button
          onClick={handleSend}
          className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md font-bold"
        >
          שלח
        </button>
      </div>
    </div>
  );
};

export default AiChat;
