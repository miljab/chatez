import useAxiosPrivate from "@/hooks/useAxiosPrivate";
import { Button } from "./ui/button";
import useAuth from "@/hooks/useAuth";
import { useEffect, useState, useRef } from "react";
import { type User, type Chat } from "@/types";
import defaultAvatar from "@/assets/default-avatar.png";
import defaultGroupAvatar from "@/assets/default-group-avatar.png";
import {
  Dialog,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogContent,
  DialogFooter,
  DialogClose,
} from "./ui/dialog";

function ChatsList() {
  const { auth } = useAuth();
  const axiosPrivate = useAxiosPrivate();
  const [chats, setChats] = useState<Array<Chat>>([]);
  const [usersToAdd, setUsersToAdd] = useState<Array<User>>([]);
  const addUserRef = useRef<HTMLInputElement>(null);
  const [dialogOpen, setDialogOpen] = useState<boolean>(false);

  useEffect(() => {
    getChats();
  }, []);

  async function getChats() {
    try {
      const response = await axiosPrivate.get("/chats");

      console.log(response.data);
      setChats(response.data);
    } catch (error) {
      console.log(error);
    }
  }

  function formatGroupChatName(chat: Chat) {
    return chat.members
      .filter((user) => user.id !== auth?.user?.id)
      .map((user) => user.username)
      .join(", ");
  }

  function getOtherChatUser(chat: Chat) {
    if (chat.members[0].id === auth?.user?.id) return chat.members[1];
    else return chat.members[0];
  }

  function listChats() {
    if (chats.length === 0)
      return (
        <div className="flex grow items-center justify-center text-gray-400">
          <p>There are no chats yet.</p>
        </div>
      );

    return chats.map((chat) => {
      if (chat.isGroup) {
        return (
          <div className="grid cursor-pointer grid-cols-[32px_1fr] items-center justify-start gap-2 rounded-xl bg-neutral-100 p-2 hover:bg-neutral-200">
            <img
              src={chat.avatar ? chat.avatar : defaultGroupAvatar}
              alt="avatar"
              className="h-8 w-8 rounded-full"
            />
            <div className="truncate">
              {chat.name ? chat.name : formatGroupChatName(chat)}
            </div>
          </div>
        );
      }

      const otherUser = getOtherChatUser(chat);

      return (
        <div className="grid cursor-pointer grid-cols-[32px_1fr] items-center justify-start gap-2 rounded-xl bg-neutral-100 p-2 hover:bg-neutral-200">
          <img
            src={otherUser.avatar ? otherUser.avatar : defaultAvatar}
            className="h-8 w-8 rounded-full"
          />
          <div className="truncate">{otherUser.username}</div>
        </div>
      );
    });
  }

  async function addUser() {
    const username = addUserRef.current?.value;

    //check if user is trying to add himself
    if (username === auth?.user?.username) return;

    try {
      const response = await axiosPrivate.post("/user", { username: username });

      if (response.data) {
        for (let i = 0; i < usersToAdd.length; i++) {
          if (response.data.id === usersToAdd[i].id) return;
        }

        const usersToAddNew = [...usersToAdd];
        usersToAddNew.push(response.data);
        setUsersToAdd(usersToAddNew);
      } else {
        //TODO: display error: user with that nickname does not exist
        console.log(response.data);
      }
    } catch (error) {
      console.error(error);
    }
  }

  function deleteUserFromList(userId: string) {
    for (let i = 0; i < usersToAdd.length; i++) {
      if (usersToAdd[i].id === userId) {
        const usersToAddNew = [...usersToAdd];
        usersToAddNew.splice(i, 1);
        setUsersToAdd(usersToAddNew);
        return;
      }
    }
  }

  async function createChat() {
    if (usersToAdd.length < 1) return;

    try {
      await axiosPrivate.post("/chats/new", { users: usersToAdd });

      setChats([]);
      await getChats();
      setUsersToAdd([]);
      setDialogOpen(false);
    } catch (error) {
      console.error(error);
    }
  }

  return (
    <div className="m-auto flex h-2/3 max-h-[600px] min-h-[400px] w-11/12 max-w-[400px] flex-col rounded-xl border shadow-sm">
      <div className="flex items-center justify-center gap-2 border-b px-4 py-2">
        <input
          type="text"
          name="chatSearch"
          id="chatSearch"
          className="h-9 w-full rounded-md bg-gray-200 px-2"
          placeholder="Search..."
        ></input>

        <span className="h-12 border-l-1"></span>

        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button className="text-4xl">+</Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>New Chat</DialogTitle>
            </DialogHeader>
            <div className="w-full">
              <div className="xs:w-5/6 m-auto flex w-full flex-col items-start">
                <label
                  htmlFor="addUser"
                  className="font-roboto ml-1 tracking-wide uppercase"
                >
                  Add user:
                </label>
                <div className="flex w-full gap-2">
                  <input
                    type="text"
                    name="addUser"
                    id="addUser"
                    className="h-9 w-full rounded-md bg-gray-200 px-2 text-black"
                    placeholder="username"
                    ref={addUserRef}
                    onKeyDown={(e) => {
                      if (e.code === "Enter") {
                        addUser();
                      }
                    }}
                  ></input>
                  <Button className="text-2xl" onClick={addUser}>
                    +
                  </Button>
                </div>
              </div>
              <div
                className="m-auto mt-4 flex max-h-[200px] w-full max-w-[400px] flex-col items-start gap-2 overflow-y-auto rounded-md border p-4 shadow-sm"
                style={usersToAdd.length === 0 ? { display: "none" } : {}}
              >
                {usersToAdd.map((user) => {
                  return (
                    <div
                      className="grid w-full min-w-0 grid-cols-[32px_1fr_32px] items-center justify-start gap-2 rounded-xl border bg-neutral-100 p-2"
                      key={user.username}
                    >
                      <img
                        className="h-8 w-8 rounded-full"
                        src={user.avatar ? user.avatar : defaultAvatar}
                      />
                      <div className="truncate">{user.username}</div>
                      <div className="flex justify-end">
                        <button
                          onClick={() => deleteUserFromList(user.id)}
                          className="flex h-8 w-8 cursor-pointer items-center justify-center rounded-full bg-transparent text-xl text-red-500 hover:bg-black/10"
                        >
                          &#10005;
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
            <DialogFooter>
              <DialogClose asChild>
                <Button variant={"ghost"} onClick={() => setUsersToAdd([])}>
                  Cancel
                </Button>
              </DialogClose>
              <Button onClick={createChat}>Create</Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
      <div className="mb-4 flex h-full max-h-full w-full flex-col justify-start gap-2 overflow-y-auto p-4">
        {listChats()}
      </div>
    </div>
  );
}

export default ChatsList;
