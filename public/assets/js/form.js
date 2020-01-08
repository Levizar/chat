//Display or not the forms
document.getElementById('signUpLink').addEventListener("click", () => {
    document.getElementById('signUpForm').style.display= 'block';
    document.getElementById('signInForm').style.display="none";
});

document.getElementById('signInLink').addEventListener("click", () => {
    document.getElementById('signUpForm').style.display= 'none';
    document.getElementById('signInForm').style.display="block";
});


//Don't allow to send the forms
const formSignUp = document.getElementById('signUp');
const formSignIn = document.getElementById('signIn');

formSignUp.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Fail to send the form')
    const regex = /\W/g;
    let usernameSignIn = document.getElementById('usernameConnection').value;
    console.log(!regex.test(usernameSignIn)); 
});

formSignIn.addEventListener('submit', (event) => {
    event.preventDefault();
    console.log('Fail to send the form')
    const regex = /\W/g;
    let usernameSignIn = document.getElementById('usernameConnection').value;
    console.log(!regex.test(usernameSignIn)); 
});
