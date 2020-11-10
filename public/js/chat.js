const socket = io();

socket.on('welcome', (msg)=> {
    console.log(msg);
});

const $chatForm = document.getElementById("messageForm");
const $chatTextBox = $chatForm.elements.message;
const $chatSendBtn = $chatForm.elements.sendBtn;

$chatForm.addEventListener('submit', (e) => {
    e.preventDefault();
    $chatSendBtn.setAttribute('disabled', 'disabled');
    const message = $chatTextBox.value;

    socket.emit('sendMessage', message, (msg)=> {
        $chatSendBtn.removeAttribute('disabled');
        $chatTextBox.value= '';
        $chatTextBox.focus();
        if (msg) {
            return console.log(msg);
        }
        console.log('Delivered!', msg);
    });
});

socket.on('sendToAll', msg => {
    console.log(msg)
});

const $sendLocationBtn = document.getElementById('btnLocation');

$sendLocationBtn.addEventListener('click', (e)=> {
    if (!navigator.geolocation) {
        alert('Your browser doesn\'t suport geolocation');
    }
    $sendLocationBtn.setAttribute('disabled', 'disabled');
    navigator.geolocation.getCurrentPosition((position) => {
        socket.emit('sendLocation', {
            longitude: position.coords.longitude,
            latitude: position.coords.latitude
        }, ()=> {
            $sendLocationBtn.removeAttribute('disabled');
            console.log('Location shared!');
        });
    })
});