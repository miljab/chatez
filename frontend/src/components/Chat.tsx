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
import defaultAvatar from "@/assets/default-avatar.png";
import Icon from "@mdi/react";
import { mdiKeyboardBackspace } from "@mdi/js";

interface ChatProps {
  activeChat: ActiveChat | null;
  showBackButton: boolean;
  toggleLayout: boolean;
  setToggleLayout: React.Dispatch<React.SetStateAction<boolean>>;
}

function Chat({
  activeChat,
  showBackButton,
  toggleLayout,
  setToggleLayout,
}: ChatProps) {
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
      console.log(msg);

      if (msg.authorId === auth?.user?.id) {
        return (
          <div key={msg.id} className="flex justify-end p-1">
            <div className="flex w-auto max-w-4/5 justify-end rounded-xl bg-neutral-200 p-2 wrap-anywhere whitespace-pre-wrap">
              {msg.text}
            </div>
          </div>
        );
      } else if (!activeChat?.isGroup) {
        return (
          <div
            key={msg.id}
            className="flex items-start justify-start gap-1 p-1"
          >
            <img
              src={msg.author.avatar || defaultAvatar}
              className="mt-1 h-8 w-8 rounded-full"
            />
            <div className="bg-primary flex w-auto max-w-4/5 justify-start rounded-xl p-2 wrap-anywhere whitespace-pre-wrap text-white">
              {msg.text}
            </div>
          </div>
        );
      } else {
        return (
          <div
            key={msg.id}
            className="justify start flex items-center gap-1 p-1"
          >
            <div className="grid w-auto max-w-4/5 grid-cols-[32px_1fr] gap-x-1">
              <div className="col-start-2 m-0 mx-0.5 flex items-end p-0 font-light">
                {msg.author.username}
              </div>
              <img
                src={msg.author.avatar || defaultAvatar}
                className="mt-1 h-8 w-8 rounded-full"
              />
              <div className="bg-primary flex w-fit justify-start rounded-xl p-2 wrap-anywhere whitespace-pre-wrap text-white">
                {msg.text}
              </div>
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
        text: textareaRef.current.textArea.value.trim(),
      };

      ws.current.send(JSON.stringify(messageData));
      textareaRef.current.textArea.value = "";
      textareaRef.current.triggerResize();
    }
  }

  function handleBackButtonClick() {
    setToggleLayout(!toggleLayout);
  }

  if (activeChat === null) {
    return;
  }

  return (
    <div
      className={`m-4 h-2/3 max-h-[600px] min-h-[400px] w-full max-w-[800px] flex-col rounded-xl border shadow-sm ${toggleLayout || !showBackButton ? "flex" : "hidden"}`}
    >
      <div
        className={`grid w-full items-center justify-start gap-2 border-b p-4 ${
          showBackButton ? "grid-cols-[48px_32px_1fr]" : "grid-cols-[32px_1fr]"
        }`}
      >
        <button
          onClick={handleBackButtonClick}
          className={`h-12 w-12 cursor-pointer items-center justify-center rounded-full p-1 hover:bg-neutral-200 ${showBackButton ? "flex" : "hidden"}`}
        >
          <Icon
            path={mdiKeyboardBackspace}
            size={1.5}
            className="text-neutral-500"
          ></Icon>
        </button>
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
