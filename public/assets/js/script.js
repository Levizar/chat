const data = {};
data["username"] = "512Louis";
data["password"] = "xdddddéééééééééééééééééééééééééééééééééééééééééé";
const lol = document.getElementById("lol");
lol.addEventListener("click", ()=>{
    fetch("/login", {
        method: "POST",
        body: JSON.stringify(data)
    });
})