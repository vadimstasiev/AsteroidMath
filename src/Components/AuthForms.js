import { auth, createUserWithEmailAndPassword, signInWithEmailAndPassword, db, getEmail } from "./Firebase"
import { collection, getDocs, query, orderBy, limit } from "firebase/firestore"; 
import { quitGame } from "./Game"
import { getterSetter, sleep } from "./Helpers"


const [getIsShowingRegisterOrLogin, setIsShowingRegisterOrLogin] = getterSetter(false)

const login = () => {
	hideMessage()
	let email, password = ''
	let emailEl, passwordEl
	for(const element of document.getElementsByClassName('email-login')){
		emailEl = element
        email = element.value
    }
	for(const element of document.getElementsByClassName('password-login')){
		passwordEl = element
		password = element.value
    }
	if(email.length && password.length){
		setMessage("Logging in...")
		signInWithEmailAndPassword(auth, email, password)
			.then(async userCredential => {
				setMessage("Login Successful")
				await sleep(1)
				emailEl.innerHTML = ""
				passwordEl.innerHTML = ""
				showOrHideForm('login-card', 'register-card')
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

const register = () => {
	hideMessage()
	let email, password, confirmPassword = ''
	let emailEl, passwordEl, confirmPasswordEl
	for(const element of document.getElementsByClassName('email-register')){
		emailEl = element
        email = element.value
    }
	for(const element of document.getElementsByClassName('password-register')){
		passwordEl = element
		password = element.value
    }
	for(const element of document.getElementsByClassName('password-confirm-register')){
		confirmPasswordEl = element
		confirmPassword = element.value
    }
	if(email.length && password.length){
		if(password==confirmPassword){
			setMessage("Registering...")
			createUserWithEmailAndPassword(auth, email, password)
				.then(async userCredential => {
					setMessage("Register Successful")
					await sleep(1)
					emailEl.innerHTML = ""
					passwordEl.innerHTML = ""
					confirmPasswordEl.innerHTML = ""
					showOrHideForm('register-card', 'login-card')
				})
				.catch((error) => {
					// remove "auth/" from the returned error message and replace dashes with spaces
					let errorMessageFormated = error.code.replace('auth/','').replace(/-/g, " ")
					// Capitalize first letter
					errorMessageFormated = errorMessageFormated.charAt(0).toUpperCase() + errorMessageFormated.slice(1)
					setMessage(errorMessageFormated)
				})
		} else {
			setMessage("Please enter the same password")
		}
	} else {
		setMessage("Please fill all fields")
	}
}

const setupLoginRegister = async () => {
	// add both before anything else, these are not added by default o prevent them from appearing before anything else loads 
    for(const element of document.getElementsByClassName('register-card')){
        // element.classList.add("show")
        element.classList.add("collapse")
    }
	for(const element of document.getElementsByClassName('login-card')){
        // element.classList.add("show")
        element.classList.add("collapse")
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

const showOrHideForm = async (show = 'register-card', hide = 'login-card') => {
	quitGame()
	if(isTransitioning){ return }

	let elementToHide
	for(const element of document.getElementsByClassName(hide)){
		elementToHide = element
	}
	let elementToShow
	for(const element of document.getElementsByClassName(show)){
		elementToShow = element
	}
	
	isTransitioning = true
	setIsShowingRegisterOrLogin(true)
	hideMessage()
	let wait = transitionWait
	// if elementToHide already hiden there is no need to wait for transition
	if(elementToHide.classList.contains("hide")) {
		wait = 0
	} 
	elementToHide.classList.add("hide")
	await sleep(wait)
	elementToHide.classList.add("collapse")
	elementToHide.classList.remove("show")
	wait = transitionWait
	// show it if already hiding else hide it if already showing
	if(elementToShow.classList.contains("hide")){
		elementToShow.classList.remove("collapse")
		elementToShow.classList.add("show")
		await sleep(wait)
		elementToShow.classList.remove("hide")
	} else {
		elementToShow.classList.add("hide")
		await sleep(wait)
		elementToShow.classList.add("collapse")
		elementToShow.classList.remove("show")
		setIsShowingRegisterOrLogin(false)
	}
	isTransitioning = false
}

const showOrHideLeaderboard = async () => {
	quitGame()
	
	const titles = `<thead><tr><th scope="col">#</th><th scope="col">Score</th><th scope="col">Day</th></tr></thead>`
	let tableContent = titles + "<tbody>"
	let i = 0 

	const leaderboardRef = collection(db, "leaderboard")

	const result = query(leaderboardRef, orderBy("score", "desc"), limit(10));

	const querySnapshot = await getDocs(result)

	let isNoContent = true

	querySnapshot.forEach((doc) => {
		i++
		const data = doc.data()
		if(data.email == getEmail()){
			isNoContent = false
			tableContent += `<tr><th scope="row">${i}</th><td>${data.score}</td><td>${data.day}</td></tr>`
			console.log(data)
		}
	})

	if(isNoContent){
		tableContent += `<tr><th scope="row">1</th><td>No games played</td><td>-</td></tr>`
	}

	tableContent += "</tbody>"
	for(const element of document.getElementsByClassName('leaderboard-table')){
        element.innerHTML = tableContent
    }
	for(const element of document.getElementsByClassName('leaderboard-card-container')){
        if(element.classList.contains("collapse")){
			element.classList.remove("collapse")
		} else {
			element.classList.add("collapse")
		}
    }
}

export {setupLoginRegister, showOrHideForm, getIsShowingRegisterOrLogin, login, register, showOrHideLeaderboard}