//Display or not the forms
document.getElementById("signUpLink").addEventListener("click", () => {
  document.getElementById("signUpForm").style.display = "block";
  document.getElementById("signInForm").style.display = "none";
});

document.getElementById("signInLink").addEventListener("click", () => {
  document.getElementById("signUpForm").style.display = "none";
  document.getElementById("signInForm").style.display = "block";
});

//Don't allow to send the forms
const formSignUp = document.getElementById("signUp");
const formSignIn = document.getElementById("signInBtn");

formSignUp.addEventListener("submit", async event => {
  event.preventDefault();
  const regex = /\W/g;
  if (!regex.test(usernameSignUp)) {
    let usernameSignUp = document.getElementById("usernameSignUp").value;
    let passwordSignUp = document.getElementById("pwdSignUp").value;
    let mailSignUp = document.getElementById("mailSignUp").value;
    let data = {
      username: usernameSignUp,
      password: passwordSignUp,
      mail: mailSignUp
    };
    data = JSON.stringify(data);
    try{
        const req = await fetch("/signup", {
          method: "POST",
          body: data
        });
        window.location.href = req;
    }catch(error){
        console.error(error)
    }

  }else{
      // If it is not ok color the border in red

  }
});

formSignIn.addEventListener("submit", event => {
  event.preventDefault();
  const regex = /\W/g;
  if (!regex.test(usernameSignIn)) {
    let usernameSignIn = document.getElementById("usernameSignIn").value;
    let passwordSignIn = document.getElementById("pwdSignIn").value;
    let data = { username: usernameSignIn, password: passwordSignIn };
    data = JSON.stringify(data);
    try{
        const req = await fetch("/login", {
          method: "POST",
          body: data
        });
        window.location.href= req;
    }catch(error){
        console.error(error);
    }
  }else{
      // If it is not ok color the border in red
      
  }
});
