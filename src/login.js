// Import the functions you need from the SDKs you need
// TODO: Add SDKs for Firebase products that you want to use
// https://firebase.google.com/docs/web/setup#available-libraries

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
const app = firebase.initializeApp(firebaseConfig)


	let email, password = ''
	document.getElementById('email').addEventListener('change', (event) => {
		email = document.getElementById('email').value
	});

	document.getElementById('password').addEventListener('change', (event) => {
		password = document.getElementById('password').value
	});


	const login = () => {
		firebase.auth().signInWithEmailAndPassword(email, password)
			.then((userCredential) => {
				// Signed in
				console.log(userCredential, email, password)
			})
			.catch((error) => {
				console.log(error, email, password)

			});
	}