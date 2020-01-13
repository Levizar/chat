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
    try {
      const req = await fetch("/login", {
        method: "POST",
        body: JSON.stringify({
          username: usernameSignIn,
          password: passwordSignIn
        })
      });
      if (req.status >= 400) {
        // Une erreur est survenue : veuiller re-essayer
        console.log("une erreur est survenue, veuillez re-essayer plus tard")

      } else document.location.href = "/chat";
    } catch (error) {
      console.error(error);
    }
  }
})

// Send Form SignUp
document.getElementById('signUpBtn').addEventListener("click", async () => {
  const usernameSignUp = document.getElementById('usernameSignUp').value;
  const passwordSignUp = document.getElementById('pwdSignUp').value;
  const mailSignUp = document.getElementById("mailSignUp").value;
  if (!/\W/g.test(usernameSignUp)) {
    try {
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
        console.log("une erreur est survenue, veuillez re-essayer plus tard")

      } else document.location.href = "/chat";
    } catch (error) {
      console.error(error);
    }
  }else{
    
  }
})