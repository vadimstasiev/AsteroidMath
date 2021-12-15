// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

import { getterSetter, sleep } from "./Helpers"


// Initialize Firebase
// const app = firebase.initializeApp(firebaseConfig)

const [getIsShowingRegisterOrLogin, setIsShowingRegisterOrLogin] = getterSetter(false)

const login = () => {
	hideError()
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

const hideError = () => {
	for(const element of document.getElementsByClassName('error')){
        element.innerHTML = ""
    }
}

const setError = (error="") => {
	for(const element of document.getElementsByClassName('error')){
        element.innerHTML = error
    }
}

const showForm = async (show = 'register-card', hide = 'login-card') => {
	if(!isTransitioning){
		isTransitioning = true
		setIsShowingRegisterOrLogin(true)
		for(const element of document.getElementsByClassName(hide)){
			let wait = transitionWait
			// if element already hiden there is no need to wait for transition
			if(element.classList.contains("hide")) {
				wait = 0
			} 
			element.classList.add("hide")
			await sleep(wait)
			hideError()
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
				setIsShowingRegisterOrLogin(false)
			}
		}
		isTransitioning = false
	}
}

export {setupLoginRegister, showForm, getIsShowingRegisterOrLogin}