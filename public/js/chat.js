const socket = io();

socket.on('welcome', (msg)=> {
    console.log(msg);
});

const $chatForm = document.getElementById("messageForm");
const $chatTextBox = $chatForm.elements.message;
const $chatSendBtn = $chatForm.elements.sendBtn;
const $messages = document.querySelector('#messages');

//Templates

const messageTemplate = document.querySelector("#message-template").innerHTML;
const loactionTemplate = document.querySelector("#location-template").innerHTML;

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

socket.on('sendToAll', message => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
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

socket.on('sendLocationToAll', location => {
    const html = Mustache.render(loactionTemplate, {
        location : location.url,
        createdAt: moment(location.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
})