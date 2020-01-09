const data = {};
data["username"] = "513Louis";
data["password"] = "hahalol";
const lol = document.getElementById("lol");
lol.addEventListener("click", ()=>{
    fetch("/login", {
        method: "POST",
        body: JSON.stringify(data)
    });
})