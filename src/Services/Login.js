import { useEffect, useState, createContext } from "react";
import { signInWith } from "../Services/firebaseauth";
import firebase from "firebase/compat/app";
import "firebase/compat/storage";
import "firebase/compat/auth";

export const UserContext = createContext({ user: null, boxes: null });

export const Login = () => {
  return (
    <div>
      <button onClick={signInWith}>Sign In</button>
    </div>
  );
};

export const UserProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [boxes, setBoxes] = useState(null);

  useEffect(() => {
    const unsubscribe = firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        setUser(user);
        getFolderList(user.uid);
      } else {
        setUser(null);
        setBoxes(null);
      }
    });
    return () => unsubscribe();
  }, []);

  const getFolderList = async (uid) => {
    const folderPath = `users/folders/${uid}`;
    const folderRef = firebase.storage().ref(folderPath);
    try {
      const folderItems = await folderRef.listAll();
      const folderData = folderItems.items.filter((item) => item.name.endsWith('/')).map((item) => ({
        name: item.name,
        link: item.fullPath,
      }));
      setBoxes(folderData);
      console.log("Folder list retrieved successfully.");
    } catch (error) {
      console.log("Error retrieving folder list:", error);
    }
  };
  

  return (
    <UserContext.Provider value={{ user, boxes }}>
      {children}
    </UserContext.Provider>
  );
};

