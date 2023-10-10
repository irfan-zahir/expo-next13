import {
  ConfirmationResult,
  User,
  getAuth,
  onAuthStateChanged,
  signInWithPhoneNumber,
  signOut,
} from "firebase/auth";
import { useEffect, useRef, useState } from "react";
import { auth } from "../../config/firebase";
import { FirebaseRecaptchaVerifierModal } from "expo-firebase-recaptcha";
import { useRouter } from "expo-router";
import { api } from "../../utils/api";

export const useUser = () => {
  const { refetch: loginTrpc, data } = api.authentication.login.useQuery(
    undefined,
    {
      enabled: false,
    }
  );
  const [dbUser, setDbUser] = useState<typeof data>();
  const [user, setUser] = useState<User | null>(getAuth().currentUser);
  const [loading, setLoading] = useState(true);

  const verifierRef = useRef<FirebaseRecaptchaVerifierModal>(null);
  // const [verificationId, setVerificationId] = useState<string | null>(null);
  const [confirmationResult, setConfirmationResult] =
    useState<ConfirmationResult | null>(null);

  const router = useRouter();

  useEffect(() => {
    const unsub = onAuthStateChanged(auth, async (updatedUser) => {
      if (updatedUser) {
        const { data } = await loginTrpc();
        setDbUser(data);
      }
      setUser(updatedUser);
      setLoading(false);
    });

    return () => unsub();
  }, []);

  const login = async (phone: string) => {
    setLoading(true);
    signInWithPhoneNumber(auth, phone, verifierRef.current!)
      .then((confirm) => {
        setConfirmationResult(confirm);
        setLoading(false);
        router.push("/authenticate");
      })
      .catch((e) => console.warn({ e }));
  };

  const authenticate = async (code: string) => {
    setLoading(true);
    if (confirmationResult) {
      confirmationResult.confirm(code).catch(e => console.warn(e)).then(async (creds) => {
        setLoading(false);
        if (creds) {
          const { data } = await loginTrpc();
          setDbUser(data);
          if (typeof data !== "undefined") {
            if (typeof data === "string") return router.push("/register");
            return router.replace("/home");
          }
        }
        router.back();
      });
    }
  };

  const logout = async () => {
    setLoading(true);
    await signOut(auth).then((_) => {
      setLoading(false);
      setUser(null);
    });
    router.replace("/login");
  };

  //TODO: Fetch user info from db
  //   const {} = api

  return {
    dbUser,
    user,
    setUser,
    loading,
    verifierRef,
    login,
    authenticate,
    logout,
  };
};

export type UseUser = ReturnType<typeof useUser>;
