// Test to throw for production

const data = {};
data["username"] = "513Louis";
data["password"] = "hahalol";
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
