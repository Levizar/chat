// Test to throw for production

const data = {};
data["oldID"] = "C EST MON OLD ID GROSLOUIS";
data["Shrek"] = "PTDRLOL";
const lol = document.getElementById("lol");
lol.addEventListener("click", ()=>{
    fetch("/login", {
        method: "POST",
        body: JSON.stringify(data)
    });
});


()=>{
    // Message submit
    document.getElementById('chatForm').addEventListener('submit',(event) => {
        event.preventDefault();
        let message = document.getElementById('chatMessage').value;
        console.log(message);
        
    });
}
