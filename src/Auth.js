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
	// add both before anything else, these are not added by default o prevent them from appearing before anything else loads 
    for(const element of document.getElementsByClassName('register-card')){
        element.classList.add("show")
        element.classList.add("hide")
    }
	for(const element of document.getElementsByClassName('login-card')){
        element.classList.add("show")
        element.classList.add("hide")
    }
}

const transitionWait = 0.75
let isTransitioning = false

const showForm = async (show = 'register-card', hide = 'login-card') => {
	if(!isTransitioning){
		isTransitioning = true
		for(const element of document.getElementsByClassName(hide)){
			let wait = transitionWait
			// if element already hiden there is no need to wait for transition
			if(element.classList.contains("hide")) {
				// wait = 0
			} 
			element.classList.add("hide")
			await sleep(wait)
			element.style.top = "1000%"
		}
		for(const element of document.getElementsByClassName(show)){
			let wait = transitionWait
			// show it if already hiding else hide it if already showing
			if(element.classList.contains("hide")){
				element.style.top = "10%"
				element.classList.remove("hide")
				await sleep(wait)
			} else {
				element.classList.add("hide")
				await sleep(wait)
				element.style.top = "1000%"
			}
		}
		isTransitioning = false
	}
}

export {setupLoginRegister, showForm}