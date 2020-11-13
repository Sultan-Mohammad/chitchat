const users = [];

// addUser, getUser, removeUser, getUsersInRoom

const addUser = ({id, username, room}) => {
    // clean the data
    username = username.trim().toLowerCase();
    room = room.trim().toLowerCase();

    // validate the data
    if(!username || !room){
        return {
            error: 'Username and room are required'
        }
    }

    // Check for existing user
    const existingUser = users.find((user) => {
        return user.room === room && user.username === username
    });

    // validate username
    if (existingUser) {
        return {
            error: 'Username is in use'
        }
    }

    // Store user 
    const user = {id, username, room}
    users.push(user);
    return { user };
}

const removUser = (userId) => {
    const index = users.findIndex(user => {
        return user.id === userId
    });

    if (user!== -1) {
        return users.splice(index, 1)[0];
    }
}