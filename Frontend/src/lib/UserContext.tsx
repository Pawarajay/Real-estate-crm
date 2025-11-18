import React, { createContext, useContext, useState, ReactNode } from "react";

export type User = {
  username: string;
  role: "admin" | "agent";
  displayName: string;
};

const defaultUser: User | null = null;

const UserContext = createContext<{
  user: User | null;
  login: (user: User) => void;
  logout: () => void;
}>({
  user: defaultUser,
  login: () => {},
  logout: () => {},
});

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  function login(user: User) {
    setUser(user);
  }
  function logout() {
    setUser(null);
  }

  return (
    <UserContext.Provider value={{ user, login, logout }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  return useContext(UserContext);
}
