//Display or not the forms
document.getElementById("signUpLink").addEventListener("click", () => {
  document.getElementById("signUpForm").style.display = "block";
  document.getElementById("signInForm").style.display = "none";
});

document.getElementById("signInLink").addEventListener("click", () => {
  document.getElementById("signUpForm").style.display = "none";
  document.getElementById("signInForm").style.display = "block";
});

// Send Form SignIn
document.getElementById("signInBtn").addEventListener("click", async () => {
  const usernameSignIn = document.getElementById('usernameSignIn').value;
  const passwordSignIn = document.getElementById('pwdConnection').value;
  if (!/\W/g.test(usernameSignIn)) {
    document.getElementById("usernameSignIn").style.border = "2px solid green";
    document.getElementById("pwdConnection").style.border = "2px solid green";
    try {
      document.getElementById("erreurSignIn").innerText="";
      const req = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({
          username: usernameSignIn,
          password: passwordSignIn
        })
      });
      if (req.status >= 400) {
        // Une erreur est survenue : veuiller re-essayer
        erreurSignIn.innerText="Une erreur est survenue, veuillez re-essayer plus tard";
        erreurSignIn.classList.add("alert");
        erreurSignIn.classList.add("alert-danger");
        console.log("une erreur est survenue, veuillez re-essayer plus tard")

      } else document.location.href = "/chat";
    } catch (error) {
      console.error(error);
    }
  }else{
    const erreurSignIn = document.getElementById("erreurSignIn");
    erreurSignIn.innerText="Champs mal remplis";
    erreurSignIn.classList.add("alert");
    erreurSignIn.classList.add("alert-danger");
    document.getElementById("usernameSignIn").style.border = "2px solid red";
    document.getElementById("pwdConnection").style.border = "2px solid red";
  }
})

// Send Form SignUp
document.getElementById('signUpBtn').addEventListener("click", async () => {
  const usernameSignUp = document.getElementById('usernameSignUp').value;
  const passwordSignUp = document.getElementById('pwdSignUp').value;
  const mailSignUp = document.getElementById("mailSignUp").value;
  if (!/\W/g.test(usernameSignUp)) {
    document.getElementById("usernameSignUp").style.border = "2px solid green";
    document.getElementById("mailSignUp").style.border = "2px solid green";
    document.getElementById("pwdSignUp").style.border = "2px solid green";
    try {
      document.getElementById("erreurSignUp").innerText="";
      const req = await fetch("/signup", {
        method: "POST",
        body: JSON.stringify({
          username: usernameSignUp,
          password: passwordSignUp,
          email: mailSignUp
        })
      });
      if (req.status >= 400) {
        // Une erreur est survenue : veuiller re-essayer plus tard
        document.getElementById("erreurSignUp").innerText="Une erreur est survenue, veuillez re-essayer plus tard";
        erreurSignUp.classList.add("alert");
        erreurSignUp.classList.add("alert-danger"); 
        console.log("une erreur est survenue, veuillez re-essayer plus tard")

      } else document.location.href = "/chat";
    } catch (error) {
      console.error(error);
    }
  }else{
    const erreurSignUp = document.getElementById("erreurSignUp");
    erreurSignUp.innerText="Champs mal remplis";
    erreurSignUp.classList.add("alert");
    erreurSignUp.classList.add("alert-danger");
    document.getElementById("usernameSignUp").style.border = "2px solid red";
    document.getElementById("mailSignUp").style.border = "2px solid red";
    document.getElementById("pwdSignUp").style.border = "2px solid red";
  }
});
