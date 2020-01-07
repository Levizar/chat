const data = new FormData();
data.append("oldID", "C EST MON OLD ID GROSLOUIS");
data.append("Shrek", "PTDRLOL");
const lol = document.getElementById("lol");
lol.addEventListener("click", ()=>{
    fetch("/login", {
        method: "POST",
        body: data
    });
})