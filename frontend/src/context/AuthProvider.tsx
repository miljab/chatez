import { createContext, useState, useEffect, type ReactNode } from "react";
import axios from "../api/axios";
import { type User } from "../types";

type AuthState = {
  accessToken?: string;
  user?: User;
};

type AuthContextType = {
  auth: AuthState;
  setAuth: React.Dispatch<React.SetStateAction<AuthState>>;
};

const AuthContext = createContext<AuthContextType>({
  auth: {},
  setAuth: () => {},
});

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthProvider = ({ children }: AuthProviderProps) => {
  const [auth, setAuth] = useState<AuthState>({});
  const [isLoading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    const verifySession = async () => {
      try {
        const response = await axios.get<{ accessToken: string; user: User }>(
          "/refresh",
          {
            withCredentials: true,
          },
        );

        const { accessToken, user } = response.data;
        setAuth({ accessToken, user });
      } catch (error) {
        console.error("Session validation failed: ", error);
        setAuth({});
      } finally {
        setLoading(false);
      }
    };

    verifySession();
  }, []);

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ auth, setAuth }}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
