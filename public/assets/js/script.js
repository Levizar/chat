const data = {};
data["oldID"] = "C EST MON OLD ID GROSLOUIS";
data["Shrek"] = "PTDRLOL";
const lol = document.getElementById("lol");
lol.addEventListener("click", ()=>{
    fetch("/login", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: data
    });
})