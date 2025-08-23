export interface User {
  id: string;
  username: string;
  avatar?: string;
  bio?: string;
  createdAt: Date;
}

export interface Chat {
  id: string;
  name?: string;
  avatar?: string;
  isGroup: boolean;
  ownerId?: string;
  owner?: User;
  members: Array<User>;
}

export interface Message {
  id: string;
  text: string;
  authorId: string;
  author: User;
  chatId: string;
  chat: Chat;
  createdAt: Date;
}
