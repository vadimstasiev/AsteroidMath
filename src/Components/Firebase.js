import * as firebase from "firebase/app"
import "firebase/firestore"
import "firebase/auth"

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

const auth = firebase.auth();
const firestore = firebase.firestore();

firebase.initializeApp(firebaseConfig)


export {auth, firestore}