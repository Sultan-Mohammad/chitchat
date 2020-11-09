const socket = io();

socket.on('counter', (count)=>{
    console.log(`Counter value ${count}`);
});

socket.on('welcome', (msg)=> {
    console.log(msg);
})

document.getElementById("messageForm").addEventListener('submit', (e) => {
    e.preventDefault();
    const message = e.target.elements.message.value;

    socket.emit('sendMessage', message);
});

socket.on('sendToAll', msg => {
    console.log(msg)
})

document.getElementById('btnLocation').addEventListener('click', (e)=> {
    if (!navigator.geolocation) {
        alert('Your browser doesn\'t suport geolocation');
    }
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        });
    })
})

// socket.on('sendMessage')