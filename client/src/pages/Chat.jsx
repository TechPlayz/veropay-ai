import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

import {
  ArrowUp,
  Bot,
  Sparkles,
  ShieldCheck,
  TrendingUp,
  CircleDollarSign,
  Scale,
  RotateCcw,
} from "lucide-react";

import Layout from "../components/layout/Layout";

const API_URL = "http://127.0.0.1:8000";


const suggestions = [
  {
    icon: <Scale size={18} />,
    title: "Explain my underpayment",
    prompt: "Why was my last ride underpaid?",
  },
  {
    icon: <TrendingUp size={18} />,
    title: "Improve my earnings",
    prompt: "When should I work tomorrow to earn more?",
  },
  {
    icon: <CircleDollarSign size={18} />,
    title: "Weekly summary",
    prompt: "Summarize my earnings this week.",
  },
  {
    icon: <ShieldCheck size={18} />,
    title: "Dispute a payment",
    prompt: "Help me dispute an unfair payment.",
  },
];


function getMockResponse(message) {
  const text = message.toLowerCase();

  if (
    text.includes("underpaid") ||
    text.includes("underpayment") ||
    text.includes("last ride")
  ) {
    return `Your last ride appears to have been underpaid by approximately ₹44.

You received ₹142 for an 11.2 km ride that took 38 minutes. Based on VeroPay's estimated fair compensation, a ride with those characteristics should have paid around ₹186.

The biggest factor was your effective rate of ₹12.68/km, which was significantly below the estimated fair rate of ₹16.60/km.

I'd recommend keeping a record of the ride and requesting a payment review from the platform.`;
  }

  if (
    text.includes("tomorrow") ||
    text.includes("earn more") ||
    text.includes("when should")
  ) {
    return `Based on your recent earnings pattern, your strongest window is between 12 PM and 3 PM.

Your lunch-hour rides currently generate the highest average earnings per hour. Earnings tend to decline after 9 PM, so extending your shift late into the evening may actually reduce your effective hourly rate.

For tomorrow, I'd prioritize 12–3 PM and 6–8 PM.`;
  }

  if (
    text.includes("week") ||
    text.includes("summary") ||
    text.includes("earnings")
  ) {
    return `You've earned approximately ₹6,840 this week across 94 rides.

Your strongest day was Friday, and your highest-performing period was consistently between 12 PM and 3 PM.

VeroPay detected 11 rides with possible pay discrepancies, representing approximately ₹620 in potential lost earnings.

Your overall fairness score for the week is 89/100.`;
  }

  if (
    text.includes("dispute") ||
    text.includes("complaint") ||
    text.includes("unfair payment")
  ) {
    return `I can help you prepare a payment review request.

For the strongest complaint, include the ride date, platform, distance, duration, payout received and the reason you believe the compensation was unfair.

For your last analyzed ride, VeroPay estimated a ₹44 discrepancy. You can reference the unusually low per-kilometre rate and the ride's 38-minute duration as supporting details.`;
  }

  return `I can help you understand your earnings, identify possible underpayments, analyze your working patterns and prepare payment disputes.

Try asking me about a specific ride, your weekly performance, or when you should work to maximize your earnings.`;
}


function Chat() {
  const [messages, setMessages] = useState([
    {
      id: 1,
      role: "assistant",
      content:
        "Hi — I'm VeroPay AI. I can analyze your earnings, explain possible underpayments and help you make smarter decisions about your gig work.",
    },
  ]);

  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [useWebSearch, setUseWebSearch] = useState(false);

  const messagesEndRef = useRef(null);


  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({
      behavior: "smooth",
    });
  }, [messages, isTyping]);


  const sendMessage = async (customMessage) => {
    const messageText =
      typeof customMessage === "string"
        ? customMessage
        : input.trim();

    if (!messageText || isTyping) return;


    const userMessage = {
      id: Date.now(),
      role: "user",
      content: messageText,
    };


    const conversation = [...messages, userMessage];
    setMessages(conversation);

    setInput("");
    setIsTyping(true);


    try {
      const response = await fetch(`${API_URL}/api/chat`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: conversation.map(({ role, content }) => ({ role, content })),
          use_web_search: useWebSearch,
        }),
      });

      const data = await response.json();
      if (!response.ok) {
        throw new Error(data.detail || "VeroPay AI could not answer right now.");
      }

      const aiMessage = {
        id: Date.now() + 1,
        role: "assistant",
        content: data.response,
      };
      setMessages((previous) => [
        ...previous,
        aiMessage,
      ]);
    } catch (error) {
      setMessages((previous) => [
        ...previous,
        {
          id: Date.now() + 1,
          role: "assistant",
          content: error.message,
        },
      ]);
    } finally {
      setIsTyping(false);
    }
  };


  const handleSubmit = (event) => {
    event.preventDefault();
    sendMessage();
  };


  const handleKeyDown = (event) => {
    if (
      event.key === "Enter" &&
      !event.shiftKey
    ) {
      event.preventDefault();
      sendMessage();
    }
  };


  const resetChat = () => {
    setMessages([
      {
        id: Date.now(),
        role: "assistant",
        content:
          "Hi — I'm VeroPay AI. What would you like to understand about your work today?",
      },
    ]);

    setInput("");
    setIsTyping(false);
  };


  return (
    <Layout>

      <div className="max-w-6xl mx-auto">

        {/* Header */}
        <div className="flex items-start justify-between mb-8">

          <div>

            <div className="flex items-center gap-2 text-green-400 mb-3">

              <Sparkles size={18} />

              <span className="text-sm font-semibold">
                AI WORKER COMPANION
              </span>

            </div>

            <h1 className="text-4xl font-bold">
              Ask VeroPay AI
            </h1>

            <p className="text-gray-400 mt-3">
              Your personal copilot for fair pay, earnings and gig work.
            </p>

          </div>


          <button
            onClick={resetChat}
            className="
              flex
              items-center
              gap-2
              text-sm
              text-gray-400
              hover:text-white
              border
              border-white/10
              hover:border-white/20
              rounded-xl
              px-4
              py-2.5
              transition
              cursor-pointer
            "
          >

            <RotateCcw size={15} />

            New chat

          </button>

        </div>


        {/* Main Chat Container */}
        <div
          className="
            bg-[#131C2E]
            border
            border-white/5
            rounded-2xl
            overflow-hidden
          "
        >

          {/* Chat Top Bar */}
          <div
            className="
              flex
              items-center
              justify-between
              px-6
              py-4
              border-b
              border-white/5
            "
          >

            <div className="flex items-center gap-3">

              <div
                className="
                  w-9
                  h-9
                  rounded-xl
                  bg-green-500/10
                  flex
                  items-center
                  justify-center
                "
              >

                <Bot
                  size={20}
                  className="text-green-400"
                />

              </div>

              <div>

                <p className="font-semibold text-sm">
                  VeroPay AI
                </p>

                <div className="flex items-center gap-2">

                  <div className="w-2 h-2 rounded-full bg-green-400" />

                  <span className="text-xs text-gray-500">
                    Online
                  </span>

                </div>

              </div>

            </div>


            <div
              className="
                hidden
                sm:flex
                items-center
                gap-2
                text-xs
                text-gray-500
              "
            >

              <ShieldCheck
                size={14}
                className="text-green-400"
              />

              Earnings-aware assistant

            </div>

          </div>


          {/* Messages */}
          <div
            className="
              h-[430px]
              overflow-y-auto
              px-6
              md:px-8
              py-7
            "
          >

            <div className="space-y-6">

              <AnimatePresence>

                {messages.map((message) => (

                  <motion.div
                    key={message.id}
                    initial={{
                      opacity: 0,
                      y: 8,
                    }}
                    animate={{
                      opacity: 1,
                      y: 0,
                    }}
                    className={
                      message.role === "user"
                        ? "flex justify-end"
                        : "flex justify-start"
                    }
                  >

                    {message.role === "assistant" && (

                      <div
                        className="
                          w-8
                          h-8
                          rounded-lg
                          bg-green-500/10
                          flex
                          items-center
                          justify-center
                          mr-3
                          mt-1
                          shrink-0
                        "
                      >

                        <Bot
                          size={17}
                          className="text-green-400"
                        />

                      </div>

                    )}


                    <div
                      className={
                        message.role === "user"
                          ? `
                            max-w-[75%]
                            bg-green-500
                            text-[#07110B]
                            rounded-2xl
                            rounded-br-md
                            px-5
                            py-3.5
                            font-medium
                          `
                          : `
                            max-w-[80%]
                            bg-[#1B263B]
                            border
                            border-white/5
                            text-gray-300
                            rounded-2xl
                            rounded-bl-md
                            px-5
                            py-4
                          `
                      }
                    >

                      <p className="whitespace-pre-line leading-7 text-sm">
                        {message.content}
                      </p>

                    </div>

                  </motion.div>

                ))}

              </AnimatePresence>


              {/* Typing Indicator */}
              {isTyping && (

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="flex justify-start"
                >

                  <div
                    className="
                      w-8
                      h-8
                      rounded-lg
                      bg-green-500/10
                      flex
                      items-center
                      justify-center
                      mr-3
                      shrink-0
                    "
                  >

                    <Bot
                      size={17}
                      className="text-green-400"
                    />

                  </div>


                  <div
                    className="
                      bg-[#1B263B]
                      border
                      border-white/5
                      rounded-2xl
                      rounded-bl-md
                      px-5
                      py-4
                    "
                  >

                    <div className="flex gap-1.5">

                      <motion.div
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />

                      <motion.div
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.2,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />

                      <motion.div
                        animate={{
                          opacity: [0.3, 1, 0.3],
                        }}
                        transition={{
                          duration: 1,
                          repeat: Infinity,
                          delay: 0.4,
                        }}
                        className="w-2 h-2 bg-gray-400 rounded-full"
                      />

                    </div>

                  </div>

                </motion.div>

              )}

              <div ref={messagesEndRef} />

            </div>

          </div>


          {/* Input */}
          <div
            className="
              border-t
              border-white/5
              p-5
              bg-[#101929]
            "
          >

            <form
              onSubmit={handleSubmit}
              className="
                flex
                items-end
                gap-3
                bg-[#1B263B]
                border
                border-white/10
                focus-within:border-green-500/50
                rounded-2xl
                p-2
                transition
              "
            >

              <textarea
                value={input}
                onChange={(event) =>
                  setInput(event.target.value)
                }
                onKeyDown={handleKeyDown}
                rows={1}
                placeholder="Ask about your earnings, rides or fair pay..."
                className="
                  flex-1
                  bg-transparent
                  text-white
                  placeholder:text-gray-500
                  resize-none
                  outline-none
                  px-3
                  py-2.5
                  max-h-28
                "
              />


              <button
                type="submit"
                disabled={!input.trim() || isTyping}
                className="
                  w-11
                  h-11
                  rounded-xl
                  bg-green-500
                  hover:bg-green-400
                  disabled:bg-gray-700
                  disabled:text-gray-500
                  text-[#07110B]
                  flex
                  items-center
                  justify-center
                  transition
                  cursor-pointer
                  disabled:cursor-not-allowed
                  shrink-0
                "
              >

                <ArrowUp size={20} />

              </button>

            </form>

            <label className="mt-3 flex items-center justify-center gap-2 text-xs text-gray-500 cursor-pointer">
              <input
                type="checkbox"
                checked={useWebSearch}
                onChange={(event) => setUseWebSearch(event.target.checked)}
                className="accent-green-500"
              />
              Use web search for current information
            </label>

            <p className="text-center text-xs text-gray-600 mt-3">
              VeroPay AI can make mistakes. Verify important payment information.
            </p>

          </div>

        </div>


        {/* Suggestions */}
        <div className="mt-8">

          <p className="text-gray-500 text-sm mb-4">
            TRY ASKING
          </p>


          <div className="grid md:grid-cols-4 sm:grid-cols-2 gap-4">

            {suggestions.map((suggestion) => (

              <button
                key={suggestion.title}
                onClick={() =>
                  sendMessage(suggestion.prompt)
                }
                disabled={isTyping}
                className="
                  bg-[#131C2E]
                  hover:bg-[#19253A]
                  border
                  border-white/5
                  hover:border-green-500/20
                  rounded-xl
                  p-5
                  text-left
                  transition
                  cursor-pointer
                  disabled:opacity-50
                "
              >

                <div className="text-green-400 mb-4">
                  {suggestion.icon}
                </div>

                <p className="font-semibold text-sm">
                  {suggestion.title}
                </p>

                <p className="text-gray-500 text-xs mt-2 leading-5">
                  {suggestion.prompt}
                </p>

              </button>

            ))}

          </div>

        </div>

      </div>

    </Layout>
  );
}

export default Chat;
