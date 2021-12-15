import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword } from "./Firebase"
import { getterSetter, sleep } from "./Helpers"


const [getIsShowingRegisterOrLogin, setIsShowingRegisterOrLogin] = getterSetter(false)

const login = () => {
	hideMessage()
	let email, password = ''
	for(const element of document.getElementsByClassName('email-login')){
        email = element.value
    }
	for(const element of document.getElementsByClassName('password-login')){
		password = element.value
    }
	if(email.length && password.length){
		signInWithEmailAndPassword(auth, email, password)
			.then((userCredential) => {
				// Signed in
				console.log(userCredential, email, password)
			})
			.catch((error) => {
				let errorMessageFormated = error.code.replace('auth/','').replace(/-/g, " ")
				errorMessageFormated = errorMessageFormated.charAt(0).toUpperCase() + errorMessageFormated.slice(1)
				setMessage(errorMessageFormated)
			})
	} else {
		setMessage("Please fill both fields")
	}
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

const hideMessage = () => {
	for(const element of document.getElementsByClassName('message')){
        element.innerHTML = ""
    }
}

const setMessage = (message="") => {
	for(const element of document.getElementsByClassName('message')){
        element.innerHTML = message
    }
}

const showForm = async (show = 'register-card', hide = 'login-card') => {
	if(!isTransitioning){
		isTransitioning = true
		setIsShowingRegisterOrLogin(true)
		for(const element of document.getElementsByClassName(hide)){
			hideMessage()
			let wait = transitionWait
			// if element already hiden there is no need to wait for transition
			if(element.classList.contains("hide")) {
				wait = 0
			} 
			element.classList.add("hide")
			await sleep(wait)
			element.classList.add("collapse")
			element.classList.remove("show")
			// element.style.top = "1000%"
		}
		for(const element of document.getElementsByClassName(show)){
			let wait = transitionWait
			// show it if already hiding else hide it if already showing
			if(element.classList.contains("hide")){
				element.classList.remove("collapse")
				element.classList.add("show")
				await sleep(wait)
				element.classList.remove("hide")
			} else {
				element.classList.add("hide")
				await sleep(wait)
				element.style.pointerEvents = "none"
				element.classList.add("collapse")
				element.classList.remove("show")
				setIsShowingRegisterOrLogin(false)
			}
		}
		isTransitioning = false
	}
}

export {setupLoginRegister, showForm, getIsShowingRegisterOrLogin, login}