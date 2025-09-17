import { type Message } from "@/types";
import { useEffect, useState, useRef } from "react";
import type { ActiveChat } from "./Home";
import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import useAuth from "@/hooks/useAuth";
import { Button } from "./ui/button";
import {
  AutosizeTextarea,
  type AutosizeTextAreaRef,
} from "./ui/AutosizeTextarea";

function Chat({ activeChat }: { activeChat: ActiveChat | null }) {
  const [messages, setMessages] = useState<Array<Message>>([]);
  const axiosPrivate = useAxiosPrivate();
  const { auth } = useAuth();
  const textareaRef = useRef<AutosizeTextAreaRef>(null);
  const messagesContainerRef = useRef<HTMLDivElement | null>(null);
  const ws = useRef<WebSocket | null>(null);

  useEffect(() => {
    if (activeChat) {
      getMessages();

      ws.current = new WebSocket("ws://localhost:3000");

      ws.current.onopen = () => {
        ws.current?.send(
          JSON.stringify({ type: "join", chatId: activeChat.id }),
        );
      };

      ws.current.onmessage = (event) => {
        const message = JSON.parse(event.data);
        setMessages((prev) => [...prev, message]);
      };

      return () => {
        ws.current?.close();
      };
    }
  }, [activeChat]);

  useEffect(() => {
    if (messagesContainerRef.current)
      messagesContainerRef.current.scrollTop =
        messagesContainerRef.current.scrollHeight;
  }, [messages]);

  async function getMessages() {
    try {
      const response = await axiosPrivate.get(`/messages/${activeChat?.id}`);

      setMessages(response.data);
    } catch (error) {
      console.error(error);
    }
  }

  function listMessages() {
    return messages.map((msg) => {
      if (msg.authorId === auth?.user?.id) {
        return (
          <div key={msg.id} className="flex justify-end p-1">
            <div className="flex w-auto max-w-4/5 justify-end rounded-md bg-neutral-200 p-2 wrap-anywhere whitespace-pre-wrap">
              {msg.text}
            </div>
          </div>
        );
      } else {
        return (
          <div key={msg.id} className="flex justify-start p-1">
            <div className="bg-primary flex w-auto max-w-4/5 justify-start rounded-md p-2 text-white">
              {msg.text}
            </div>
          </div>
        );
      }
    });
  }

  async function sendMessage() {
    if (
      textareaRef.current?.textArea.value.trim() &&
      activeChat &&
      ws.current
    ) {
      const messageData = {
        authorId: auth.user?.id,
        chatId: activeChat.id,
        text: textareaRef.current.textArea.value,
      };

      ws.current.send(JSON.stringify(messageData));
      textareaRef.current.textArea.value = "";
      textareaRef.current.triggerResize();
    }
  }

  if (activeChat === null) {
    return;
  }

  return (
    <div className="m-4 flex h-2/3 max-h-[600px] min-h-[400px] w-full flex-col rounded-xl border shadow-sm">
      <div className="grid w-full grid-cols-[32px_1fr] items-center justify-start gap-2 border-b p-4">
        <img className="h-8 w-8 rounded-full" src={activeChat.img} />
        <div className="truncate">{activeChat.name}</div>
      </div>
      <div ref={messagesContainerRef} className="flex-grow overflow-y-auto p-4">
        {listMessages()}
      </div>
      <div className="flex items-center justify-center gap-2 border-t p-4">
        <AutosizeTextarea
          ref={textareaRef}
          rows={1}
          maxHeight={200}
          className="field-sizing-fixed min-h-0 resize-none"
          onKeyDown={(e) => {
            if (e.code === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
        ></AutosizeTextarea>
        <Button onClick={sendMessage}>Send</Button>
      </div>
    </div>
  );
}

export default Chat;
