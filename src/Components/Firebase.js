import { initializeApp } from "firebase/app"
import { getFirestore } from "firebase/firestore"
import { getAuth, onAuthStateChanged, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "firebase/auth"
import { getterSetter } from "./Helpers"

// Your web app's Firebase configuration
const firebaseConfig = {
    apiKey: "AIzaSyBm1j8XA2l5Ao5t6xb4khN1pJIee3xgDo8",
    authDomain: "fir-auth-97b17.firebaseapp.com",
    databaseURL: "https://fir-auth-97b17.firebaseio.com",
    projectId: "fir-auth-97b17",
    storageBucket: "fir-auth-97b17.appspot.com",
    messagingSenderId: "778812845695",
    appId: "1:778812845695:web:c7ca9472948d6719a9594a"
}

const [getUserIsLoggedIn, setUserIsLoggedIn] = getterSetter(false)
const [getEmail, setEmail] = getterSetter("")

const app = initializeApp(firebaseConfig)
const auth = getAuth()
const db = getFirestore(app)

onAuthStateChanged(auth, (user) => {
    if (user) {
        setEmail(user.email)
        setUserIsLoggedIn(true)
        const uid = user.uid
        for(const element of document.getElementsByClassName('user-not-login')){
            // element.classList.remove("show")
            element.classList.add("collapse")
        }
        for(const element of document.getElementsByClassName('user-is-login')){
            // element.classList.remove("show")
            element.classList.remove("collapse")
        }
        for(const element of document.getElementsByClassName('leaderboard')){
            // element.classList.remove("show")
            element.classList.remove("collapse")
        }
    } else {
        setUserIsLoggedIn(false)
        for(const element of document.getElementsByClassName('user-not-login')){
            // element.classList.remove("show")
            element.classList.remove("collapse")
        }
        for(const element of document.getElementsByClassName('user-is-login')){
            // element.classList.remove("show")
            element.classList.add("collapse")
        }
        for(const element of document.getElementsByClassName('leaderboard')){
            // element.classList.remove("show")
            element.classList.add("collapse")
        }
        for(const element of document.getElementsByClassName('leaderboard-card-container')){
            // element.classList.remove("show")
            element.classList.add("collapse")
        }
    }
})

window.logOut = () => signOut(auth)


export {auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, getUserIsLoggedIn, getEmail, db}