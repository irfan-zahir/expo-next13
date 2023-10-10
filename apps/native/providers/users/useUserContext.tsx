import React from "react";
import { createGenericContext } from "../createGenericProviders";
import { UseUser, useUser } from "./useUser";

const [useUserContext, UserContextProvider] = createGenericContext<UseUser>();

const UserProvider: React.FC<React.PropsWithChildren> = ({ children }) => {
  const { user, loading, ...useUserData } = useUser();

  return (
    <UserContextProvider value={{ ...useUserData, user, loading }}>
      {children}
    </UserContextProvider>
  );
};

export { UserProvider, useUserContext };
