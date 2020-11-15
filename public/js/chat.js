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
const sidebarTemplate = document.querySelector("#sidebar-template").innerHTML;

// Options
const {username, room} = Qs.parse(location.search, {ignoreQueryPrefix: true});


const autoScroll = () => {
    // new message element 
    const $newMessage = $messages.lastElementChild;

    // height of the new message
    const newMessageStyle = getComputedStyle($newMessage);
    const newMessageMargin = parseInt(newMessageStyle.marginBottom);
    const newMessageHeight = $newMessage.offsetHeight + newMessageMargin;

    // visible height
    const visibleHeight = $messages.offsetHeight;

    // height of messages container

    const containerHeight = $messages.scrollHeight;

    // how far user have scrolled
    const scrollOffset = $messages.scrollTop + visibleHeight;

    if (containerHeight - newMessageHeight <= scrollOffset ) {
        $messages.scrollTop = $messages.scrollHeight
    }
}

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

socket.on('sendMessage', message => {
    const html = Mustache.render(messageTemplate, {
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
})

socket.on('sendToAll', message => {
    const html = Mustache.render(messageTemplate, {
        username: message.username,
        message: message.text,
        createdAt: moment(message.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend',html);
    autoScroll();
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
        username : location.username,
        location : location.url,
        createdAt: moment(location.createdAt).format('hh:mm:ss a')
    });
    $messages.insertAdjacentHTML('beforeend', html);
    autoScroll();
})

socket.emit('join', {username, room}, (error) => {
    if (error) {
        alert(error);
        location.href = '/';
    }
});

socket.on('roomData', ({room, users}) => {
    const html = Mustache.render(sidebarTemplate, {
        room,
        users
    });
    document.querySelector("#sidebar").innerHTML = html;
});