import React, { createContext, useContext, useState, ReactNode } from "react";

export type User = { username: string; role: "admin" | "agent" };

const defaultUser: User | null = null;

const UserContext = createContext<{
  user: User | null;
  setUser: (u: User | null) => void;
}>({
  user: defaultUser,
  setUser: () => {},
});

export const UserProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(defaultUser);

  return (
    <UserContext.Provider value={{ user, setUser }}>
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => useContext(UserContext);
