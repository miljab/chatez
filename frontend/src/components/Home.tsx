import ChatsList from "./ChatsList";
import Chat from "./Chat";
import { useState } from "react";

export interface ActiveChat {
  id: string;
  name: string;
  img: string;
}

function Home() {
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);

  function pickChat(chatId: string, chatName: string, chatImg: string) {
    const newActiveChat = {
      id: chatId,
      name: chatName,
      img: chatImg,
    };

    setActiveChat(newActiveChat);
  }

  return (
    <div className="flex h-screen items-center justify-center gap-4">
      <ChatsList pickChat={pickChat}></ChatsList>
      <Chat activeChat={activeChat}></Chat>
    </div>
  );
}

export default Home;
