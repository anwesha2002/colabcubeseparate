import React, { useState, useEffect, useRef } from "react";
import axios from "axios";

function Chatbot() {
  const [input, setInput] = useState("");
  const [chat, setChat] = useState([]);
  const [loading, setLoading] = useState(false);
  const chatContainerRef = useRef(null);

  useEffect(() => {
    if (chatContainerRef.current) {
      chatContainerRef.current.scrollTop =
        chatContainerRef.current.scrollHeight;
    }
  }, [chat]);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!input.trim()) return;

    const newChat = [...chat, { type: "user", text: input }];
    setChat(newChat);
    setInput("");
    setLoading(true);

    try {
      const response = await axios.post("http://localhost:3001/ask", {
        question: input,
      });
      setChat([...newChat, { type: "bot", text: response.data.answer }]);
    } catch (error) {
      console.error("Error getting answer:", error);
      let errorMessage = "Sorry, I encountered an error. Please try again.";
      if (
        error.response &&
        error.response.data &&
        error.response.data.details
      ) {
        errorMessage += ` Error details: ${error.response.data.details}`;
      }

      setChat([...newChat, { type: "bot", text: errorMessage }]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center p-4">
      <div className="bg-white p-6 rounded-lg shadow-md w-full max-w-2xl">
        <h1 className="text-3xl font-bold mb-6 text-center text-blue-600">
          ColabCube Chatbot
        </h1>
        <div
          ref={chatContainerRef}
          className="mb-6 h-96 overflow-y-auto bg-gray-50 p-4 rounded-lg shadow-inner"
        >
          {chat.map((message, idx) => (
            <div
              key={idx}
              className={`mb-4 p-3 rounded-lg ${
                message.type === "user"
                  ? "bg-blue-100 text-blue-800"
                  : "bg-gray-200 text-gray-800"
              }`}
            >
              <strong className="block mb-1">
                {message.type === "user" ? "You" : "ColabCube Bot"}:
              </strong>
              {message.text}
            </div>
          ))}

          {loading && (
            <div className="text-center">
              <div
                className="inline-block animate-spin rounded-full h-8 w-8 
              border-t-2 border-b-2 border-blue-500"
              ></div>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="flex space-x-2">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            className="flex-1 p-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Ask your queries.."
          />

          <button
            type="submit"
            className="bg-blue-500 text-white p-3 rounded-lg hover:bg-blue-600 transition duration-200"
            disabled={loading}
          >
            {loading ? "Thinking..." : "Ask"}
          </button>
        </form>
      </div>
    </div>
  );
}

export default Chatbot;
