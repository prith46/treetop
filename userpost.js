const mongoose = require('mongoose');

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl).then(() => {
    console.log("Connection is up in app");
}).catch((error) => {
    console.log(error);
})


const userpostSchema = new mongoose.Schema({
    username: {
        type: String,
        required: [true, 'userId is mandatory']
    },
    post: {
        type: String,
        required: [true, 'User post cannot be empty']
    },
    caption: {
        type: String
    },
    createdAt: {
        type: Date,
    },
    likes: {
        type: Number,
        default: 0
    },
    disLikes: {
        type: Number,
        default: 0
    }
})

module.exports = mongoose.model('Userpost', userpostSchema);
