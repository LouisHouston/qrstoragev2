import firebase from "firebase/compat/app";
import "firebase/compat/auth"

export const appRef =  firebase.initializeApp({
    apiKey: process.env.REACT_APP_API_KEY,
    authDomain: process.env.REACT_APP_AUTH_DOMAIN,
    projectId: process.env.REACT_APP_PROJECT_ID,
    storageBucket:process.env.REACT_APP_STORAGE_BUCKET,
    messagingSenderId: process.env.REACT_APP_MESSAGING_SENDER_ID,
    appId: process.env.REACT_APP_APP_ID,
    measurementId: process.env.REACT_APP_MEASUREMENT_ID,
  });
  
export const auth = firebase.auth();


const googleprovider = new firebase.auth.GoogleAuthProvider();

export const signInWith = () => {
    auth.signInWithRedirect(googleprovider).then((res) => {
        console.log(res.user)
    }).catch((error) => {
        console.log(error.message)
    })
}

export const signOut = () => {
    auth.signOut()
    localStorage.clear();
    sessionStorage.clear();
    window.location.reload(false);
    console.log("Logged Out Successfully")
}