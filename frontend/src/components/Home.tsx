import ChatsList from "./ChatsList";
import Chat from "./Chat";
import { useState, useEffect } from "react";

export interface ActiveChat {
  id: string;
  name: string;
  img: string;
}

function Home() {
  const [activeChat, setActiveChat] = useState<ActiveChat | null>(null);
  const [windowWidth, setWindowWidth] = useState<number>(window.innerWidth);
  const [showBackButton, setShowBackButton] = useState<boolean>(
    windowWidth > 1024 ? false : true,
  );
  const [toggleLayout, setToggleLayout] = useState<boolean>(
    activeChat ? true : false,
  );

  useEffect(() => {
    window.addEventListener("resize", updateWindowWidth);

    return () => {
      window.removeEventListener("resize", updateWindowWidth);
    };
  }, []);

  function updateWindowWidth() {
    setWindowWidth(window.innerWidth);
  }

  useEffect(() => {
    if (windowWidth < 1024) {
      setShowBackButton(true);
    } else {
      setShowBackButton(false);
    }
  }, [windowWidth]);

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
      <ChatsList
        pickChat={pickChat}
        showBackButton={showBackButton}
        toggleLayout={toggleLayout}
        setToggleLayout={setToggleLayout}
      ></ChatsList>
      <Chat
        activeChat={activeChat}
        showBackButton={showBackButton}
        toggleLayout={toggleLayout}
        setToggleLayout={setToggleLayout}
      ></Chat>
    </div>
  );
}

export default Home;
