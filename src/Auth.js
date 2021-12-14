// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { sleep } from "./Components/Helpers";

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

// Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig)


const login = () => {
	let email, password = ''
	document.getElementById('email').addEventListener('change', (event) => {
		email = document.getElementById('email').value
	});

	document.getElementById('password').addEventListener('change', (event) => {
		password = document.getElementById('password').value
	});


	// const login = () => {
	// 	firebase.auth().signInWithEmailAndPassword(email, password)
	// 		.then((userCredential) => {
	// 			// Signed in
	// 			console.log(userCredential, email, password)
	// 		})
	// 		.catch((error) => {
	// 			console.log(error, email, password)

	// 		});
	// }
}

const setupLoginRegister = async () => {
    for(const element of document.getElementsByClassName('register-card')){
        element.classList.add("show")
        element.classList.add("hide")
    }
	for(const element of document.getElementsByClassName('login-card')){
        element.classList.add("show")
        element.classList.add("hide")
    }
}

const transitionWait = 1.5

const showLogin = async () => {
	let wait = transitionWait
	for(const element of document.getElementsByClassName('register-card')){
		if(!element.classList.contains("hide")){
			element.classList.add("hide")
		} else {
			wait = 0
		}
	}
	await sleep(wait)
    for(const element of document.getElementsByClassName('login-card')){
        element.classList.remove("hide")
    }
}

const showRegister = async () => {
	let wait = transitionWait
	for(const element of document.getElementsByClassName('login-card')){
		if(!element.classList.contains("hide")){
			element.classList.add("hide")
		} else {
			wait = 0
		}
	}
	await sleep(wait)
	for(const element of document.getElementsByClassName('register-card')){
		element.classList.remove("hide")
    }
}

export {setupLoginRegister, showLogin, showRegister}