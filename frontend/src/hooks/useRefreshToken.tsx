import axios from "../api/axios";
import useAuth from "./useAuth";
import { type User } from "../types";

const useRefreshToken = () => {
  const { setAuth } = useAuth();

  const refresh = async () => {
    try {
      const response = await axios.get<{ accessToken: string; user: User }>(
        "/refresh",
        {
          withCredentials: true,
        },
      );

      setAuth((prev) => {
        return {
          ...prev,
          accessToken: response.data.accessToken,
          user: response.data.user,
        };
      });

      return response.data.accessToken;
    } catch (error) {
      console.error("Refresh token failed: ", error);
      setAuth({});
      throw error;
    }
  };

  return refresh;
};

export default useRefreshToken;
