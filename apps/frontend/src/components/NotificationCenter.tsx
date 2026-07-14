import React, { useEffect, useMemo, useState } from "react";
import { io } from "socket.io-client";
import { baseURL, fetchUser } from "../api";
import { CHAT_HEADER } from "@gdsd/common/constants";
import type { IMessage, IUser } from "@gdsd/common/models";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import { getChatId } from "./ChatPage";

type Props = {
  toggleUnreadUpdate: () => void
}

const NotificationCenter: React.FC<Props> = ({ toggleUnreadUpdate }) => {
  const navigate = useNavigate();

  const [users] = useState<Record<string, IUser>>({})

  const [currentUserId, setCurrentUserId] = useState<string | null>(localStorage.getItem("userId"));
  const [messageIds] = useState<Record<string, (string | number)[]>>({})

  useEffect(() => {
    const handleAuthChange = () => {
      const token = localStorage.getItem("authToken")
      setCurrentUserId(token ? localStorage.getItem("userId") : null);
      toggleUnreadUpdate()
    };

    // Listen for storage changes
    window.addEventListener("storage", handleAuthChange);
    window.addEventListener("authChange", handleAuthChange);
    handleAuthChange()

    // Cleanup listener
    return () => {
      window.removeEventListener("storage", handleAuthChange);
      window.removeEventListener("authChange", handleAuthChange);
    };
  }, []);

  const socket = useMemo(() => {
    if (!currentUserId)
      {
        console.log("cannot connect to socket, user is logged out")
        return undefined
      }

    return io(new URL(baseURL).origin, {
      extraHeaders: {
        [CHAT_HEADER]: currentUserId
      },
    });
  }, [currentUserId]);

  // socket.io setup
  useEffect(() => {
    if (!socket) return; // Ensure socket is not null before proceeding

    function onConnect() {
      console.log("socket connected");
    }

    function onDisconnect() {
      console.log("socket disconnected");
    }

    async function onMessage(message: IMessage) {
      console.log("Received message from server:", message);
      document.dispatchEvent(new CustomEvent("chat-receive-message", { detail: { message } }))

      const chatUrl = `/chatting?property=${message.property}&user=${message.sender}`
      if (globalThis.location.href.endsWith(chatUrl))
        return

      const user = await getUser(message.sender as string)

      setTimeout(() => {
        toggleUnreadUpdate()
      }, 200)

      const chatId = getChatId(message.sender as string, message.property as string)

      const id = toast(`New message from ${user?.firstName} ${user?.lastName}`, {
        description: message.content.slice(0, 80),
        action: {
          label: "Go to messages",
          onClick: () => {
            navigate(chatUrl)
            for (const id of messageIds[chatId] ?? []) {
              toast.dismiss(id)
            }
          }
        }
      })

      messageIds[chatId] ??= []
      messageIds[chatId].push(id)
    }

    toggleUnreadUpdate()

    socket.on("connect", onConnect);
    socket.on("disconnect", onDisconnect);
    socket.on("message", onMessage);

    // cleanup on unmount
    return () => {
      socket.off("connect", onConnect);
      socket.off("disconnect", onDisconnect);
      socket.off("message", onMessage);
    };
  }, [socket]);

  // send messages
  useEffect(() => {
    if (!socket) return
    const handleMessage = (event: any) => {
      const { message } = event.detail
      console.log("Sending message", message)
      socket.emit("message", message);
    };

    document.addEventListener("chat-send-message", handleMessage);

    return () => {
      document.removeEventListener("chat-send-message", handleMessage);
    };
  }, [socket]);

  async function getUser(id: string) {
    if (id in users)
      return users[id]!

    const user = await fetchUser(id)
    users[id] = user
    return user
  }

  return <></>;

};

export default NotificationCenter;
