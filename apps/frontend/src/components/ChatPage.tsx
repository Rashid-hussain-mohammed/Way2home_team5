import React, { useEffect, useState } from "react";
import type { IMessage, IProperty, IUser } from "@gdsd/common/models";
import { fetchChatMessages, fetchChats, readChat } from "../api";
import { getPlaceholderAvatar } from "../utils";
import { useLocation, useNavigate, useSearchParams } from "react-router-dom";


type Props = {
  toggleUnreadUpdate: () => void
}

type ChatData = {
  otherUser: IUser;
  property: IProperty;
  messages: IMessage[];
  hasFetchedAllMessages: boolean
  unreadCount: number
}

export const getChatId = (otherUserId: string, propertyId: string) => `${otherUserId}-${propertyId}`

const ChatPage: React.FC<Props> = ({ toggleUnreadUpdate }) => {
  const navigate = useNavigate()
  const location = useLocation()
  const [searchParams, setSearchParams] = useSearchParams()

  const [chats, setChats] = useState(new Map<string, ChatData>());
  const [currentChat, setCurrentChat] = useState<ChatData>()
  const [newMessageContent, setNewMessageContent] = useState<string>("");
  const [otherUserId, setOtherUserId] = useState(() => searchParams.get("user"));
  const [propertyId, setPropertyId] = useState(() => searchParams.get("property"));
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  const [currentUserId] = useState(() => {
    const result = localStorage.getItem("userId");
    if (!result)
      throw new Error("userId not found in localStorage");
    return result;
  });

  const isFromCurrentUser = (message: IMessage) => (typeof message.sender === "string" ? message.sender : message.sender.id) === currentUserId

  useEffect(() => {
    const propertyId = searchParams.get("property")
    const otherUserId = searchParams.get("user")
    setPropertyId(propertyId)
    setOtherUserId(otherUserId)

    if (!propertyId || !otherUserId) return

    if (currentChat?.property.id !== propertyId || currentChat?.otherUser.id !== otherUserId) {
      const chatId = getChatId(otherUserId, propertyId)
      setCurrentChat(chats.get(chatId))
    }
  }, [searchParams, location])

  const setChat = (chatId: string, data: ChatData) => {
    const map = new Map(chats)
    map.set(chatId, data)
    setChats(map)
  }

  // initial chat list setup
  useEffect(() => {
    const setupChats = async () => {
      const response = await fetchChats();
      let chat: ChatData | undefined = undefined

      for (const apiChat of response) {
        const { otherUser, property, messages, unreadCount } = apiChat
        const chatId = getChatId(otherUser.id, property.id)

        if (chats.has(chatId))
          continue

        chat = {
          otherUser,
          property,
          messages,
          unreadCount,
          hasFetchedAllMessages: true
        }

        chats.set(chatId, chat)
      }
      setChats(chats)
      // debugger

      if (propertyId && otherUserId) {
        const chatId = getChatId(otherUserId, propertyId)
        chat = chats.get(chatId)
        if (!chats.has(chatId)) {
          const { messages, otherUser, property, unreadCount } = await fetchChatMessages(otherUserId, propertyId)

          chat = {
            otherUser,
            property,
            messages,
            unreadCount,
            hasFetchedAllMessages: true
          }
          setChat(chatId, chat)
        }
      }

      if (chat) setCurrentChat(chat)
    };

    setupChats()
      .catch(error => console.error("Error fetching messages:", error))
  }, []);


  const setupChat = async (otherUserId: string, propertyId: string) => {
    const { messages, otherUser, property } = await fetchChatMessages(otherUserId, propertyId)
    const chatId = getChatId(otherUserId, propertyId)

    let chat
    if (chats.has(chatId)) {
      chat = chats.get(chatId)!
      chat.messages = [...messages]
      chat.hasFetchedAllMessages = true
    } else {
      chat = {
        otherUser,
        property,
        messages,
        hasFetchedAllMessages: true,
        unreadCount: 0
      }
      setChat(chatId, chat)
    }
    return chat
  }

  // on change chat
  useEffect(() => {
    async function inner() {
      if (!currentChat) return

      const { otherUser, property } = currentChat
      setOtherUserId(otherUser.id)
      setPropertyId(property.id)
      setSearchParams({
        property: property.id,
        user: otherUser.id
      })

      if (!currentChat.hasFetchedAllMessages) {
        await setupChat(otherUser.id, property.id)
        return
      }

      scrollToLastMessage()
      readAllChatMessages(currentChat)
      focusMessageBox()
    }

    try {
      inner()
    } catch (e) {
      console.error(e)
    }
  }, [currentChat])

  function readAllChatMessages(chat: ChatData) {
    readChat(chat.otherUser.id, chat.property.id)
      .then(toggleUnreadUpdate)
    chat.unreadCount = 0
    for (const message of chat.messages.filter(isFromCurrentUser)) {
      message.isReadByReceiver = true
    }
    setChats(new Map(chats))
  }

  function focusMessageBox() {
    document.querySelector<HTMLInputElement>(".msg-box")?.focus()
  }

  const handleSendMessage = () => {
    if (newMessageContent.trim() === "") return;

    const newMessage: IMessage = {
      id: crypto.randomUUID(),
      content: newMessageContent.trim(),
      creationDate: new Date(),
      sender: currentUserId,
      receiver: otherUserId!,
      property: propertyId!,
      isReadByReceiver: false
    };

    currentChat!.messages = [...currentChat!.messages, newMessage]
    document.dispatchEvent(new CustomEvent("chat-send-message", { detail: { message: newMessage } }))
    scrollToLastMessage()
    setNewMessageContent(""); // Clear input
  };

  useEffect(() => {
    const handleMessage = (event: any) => {
      const { message } = event.detail
      const msgPropertyId = message.property as string
      const msgOtherUserId = message.sender as string
      const chatId = getChatId(msgOtherUserId, msgPropertyId)

      // add a new chat or add to the existing messages
      if (chats.has(chatId)) {
        const chat = chats.get(chatId)!
        const messages = chat.messages
        chat.messages = [...messages, message]

        if (msgOtherUserId !== searchParams.get("user") || msgPropertyId !== searchParams.get("property"))
          chat.unreadCount++
        else
          readAllChatMessages(chat)

        setChat(chatId, chat)
        scrollToLastMessage()
      } else {
        setupChat(msgOtherUserId, msgPropertyId).then(scrollToLastMessage).catch(console.error)
      }
    };

    document.addEventListener("chat-receive-message", handleMessage);

    return () => {
      document.removeEventListener("chat-receive-message", handleMessage);
    };
  }, []);

  function scrollToLastMessage() {
    // const top = globalThis.scrollY
    setTimeout(() => {
      const message = document.querySelector<HTMLElement>(`.chat-messages`)
      if (!message) return
      // globalThis.scrollTo({ top, behavior: "smooth" })
      message.scrollTo({ top: message.scrollHeight - message.offsetHeight, behavior: "smooth" })
    }, 20)
  }

  // mark messages as read when tab is active
  useEffect(() => {
    function handleVisibilityChange() {
      if (currentChat)
        readAllChatMessages(currentChat)
    }

    document.addEventListener("visibilitychange", handleVisibilityChange)
    window.addEventListener("focus", handleVisibilityChange)

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange)
      window.removeEventListener("focus", handleVisibilityChange)
    }
  });

  return (
    <div className="flex flex-col h-screen bg-gray-100">
      {/* Header */}
      <h3 className="p-4 text-3xl font-bold text-gray-900">Chat</h3>

      {/* Main Chat Layout */}
      <div className="flex flex-grow overflow-hidden">
        {/* Sidebar Toggle Button */}
        <button
          className="sm:hidden p-2 bg-blue-500 text-white rounded-md m-2"
          onClick={() => setIsSidebarOpen(!isSidebarOpen)}
        >
          {isSidebarOpen ? "Close Chats" : "Open Chats"}
        </button>

        {/* Sidebar */}
        <div
          className={`fixed inset-y-0 left-0 w-3/4 max-w-xs bg-white border-r transform ${
            isSidebarOpen ? "translate-x-0" : "-translate-x-full"
          } sm:relative sm:translate-x-0 transition-transform duration-300 ease-in-out`}
        >
          {[...chats.entries()].map(([key, chat]) => {
            const isCurrentChat =
              currentChat &&
              key === getChatId(currentChat.otherUser.id, currentChat.property.id);

            return (
              <div
                key={key}
                className={`flex items-center p-4 border-b cursor-pointer ${
                  isCurrentChat ? "bg-gray-100" : "hover:bg-gray-100"
                }`}
                onClick={() => {
                  setCurrentChat(chat);
                  setIsSidebarOpen(false); // Close sidebar on mobile after selecting a chat
                }}
              >
                {/* Avatar */}
                <div className="flex items-center justify-center w-12 h-12 text-white bg-gray-300 rounded-full">
                  <img
                    src={
                      chat.otherUser.avatar ||
                      getPlaceholderAvatar(chat.otherUser.gender)
                    }
                    alt="User Avatar"
                    className="rounded-full border-1 border-gray-200"
                  />
                </div>

                {/* User Details */}
                <div className="ml-4 flex-grow">
                  <h2 className="text-sm font-bold sm:text-base">
                    {`${chat.otherUser.firstName} ${chat.otherUser.lastName}`}
                  </h2>
                  <p className="text-xs text-gray-500 sm:text-sm">
                    {chat.messages.at(-1)?.content || "No messages yet"}
                  </p>
                </div>

                {chat.unreadCount === 0 ? (
                  <></>
                ) : (
                  <div
                    style={{
                      color: "white",
                      padding: "2px 6px",
                      backgroundColor: "#a00",
                      borderRadius: "999px",
                      marginLeft: "2px",
                    }}
                  >
                    {chat.unreadCount}
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Chat Section */}
        <div
          className={`flex flex-col w-full h-full ${
            isSidebarOpen ? "hidden" : "block"
          }`}
        >
          {currentChat ? (
            <>
              {/* Top Section with User Info */}
              <div className="flex items-center p-4 bg-white border-b shadow-sm justify-between">
                <div className="flex">
                  <div className="flex items-center justify-center w-12 h-12 text-white bg-gray-300 rounded-full">
                    <img
                      src={
                        currentChat.otherUser.avatar ||
                        getPlaceholderAvatar(currentChat.otherUser.gender)
                      }
                      alt="User Avatar"
                      className="rounded-full border-1 border-gray-200"
                    />
                  </div>
                  <div className="ml-4">
                    <p className="text-lg font-bold text-gray-900">
                      {currentChat.otherUser.firstName}{" "}
                      {currentChat.otherUser.lastName}
                    </p>
                    <p className="text-sm text-gray-600">
                      {currentChat.property.name}
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => navigate(`/listing/${currentChat.property.id}`)}
                  style={{
                    padding: "6px",
                    backgroundColor: "cadetblue",
                    color: "white",
                    border: "none",
                    borderRadius: "5px",
                    cursor: "pointer",
                  }}
                >
                  Go to property
                </button>
              </div>

              {/* Chat Messages */}
              <div className="flex flex-col h-full p-4 overflow-y-auto gap-4 chat-messages">
                {currentChat.messages.map((message) => {
                  const isOwnMessage = isFromCurrentUser(message);
                  const messageTime = new Date(
                    message.creationDate
                  ).toLocaleTimeString([], {
                    weekday: "long",
                    day: "2-digit",
                    month: "short",
                    hour: "2-digit",
                    minute: "2-digit",
                  });

                  return (
                    <div
                      key={message.id}
                      className={`flex ${
                        isOwnMessage ? "justify-end" : "justify-start"
                      }`}
                    >
                      <div
                        className={`rounded-lg p-4 max-w-xs sm:max-w-sm ${
                          isOwnMessage
                            ? "bg-blue-500 text-white"
                            : "bg-gray-200 text-gray-900"
                        }`}
                      >
                        <p className="text-xs sm:text-sm">{message.content}</p>
                        <div
                          className={`text-right text-[10px] sm:text-xs mt-2 flex items-center gap-2 ${
                            isOwnMessage ? "text-white" : "text-gray-900"
                          }`}
                        >
                          {messageTime}{" "}
                          {/*message.isReadByReceiver ? <FaCheckDouble /> : <FaCheck />*/}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Input Section */}
              <div className="flex items-center p-4 bg-white border-t">
                <input
                  type="text"
                  value={newMessageContent}
                  onChange={(e) => setNewMessageContent(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") handleSendMessage();
                  }}
                  placeholder="Write a message..."
                  className="flex-grow px-4 py-2 mr-4 text-xs border rounded-lg sm:text-sm focus:outline-none focus:ring focus:ring-blue-300"
                />
                <button
                  onClick={handleSendMessage}
                  className="px-4 py-2 text-xs text-white bg-blue-500 rounded-lg sm:text-sm hover:bg-blue-600"
                >
                  Send
                </button>
              </div>
            </>
          ) : (
            <div className="flex items-center justify-center h-full text-lg text-gray-500">
              Select a user to view messages
            </div>
          )}

          {/* Back Button for Mobile */}
          {window.innerWidth < 640 && (
            <button
              onClick={() => setIsSidebarOpen(true)}
              className="p-2 text-blue-500"
            >
              ⬅ Back
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default ChatPage;
