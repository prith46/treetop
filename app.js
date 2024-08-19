if (process.env.NODE_ENV !== "production") {
    require('dotenv').config();
}

const express = require('express');
const app = express();
const path = require('path');
const userdetails = require('./userdetails');
const mongoose = require('mongoose');
const Userdetails = require('./userdetails');
const Userpost = require('./userpost');
const session = require('express-session');
const MongoStore = require('connect-mongo');
const multer = require('multer');
const {storage} = require('./cloudinary');
const upload = multer({storage});

const dbUrl = process.env.DB_URL;

mongoose.connect(dbUrl, {
    useNewUrlParser: true,
    useCreateIndex: true,
    useUnifiedTopology: true,
    useFindAndModify: false
}).then(() => {
    console.log("Connection is up in app");
}).catch((error) => {
    console.log(error);
})

const store = MongoStore.create({
    mongoUrl: dbUrl,
    touchAfter: 24 * 60 * 60,
    crypto: {
        secret: 'thisshouldbeabettersecret!'
    }
});

store.on("error", function (err) {
    console.log("SESSION STORE ERROR", err);
})

const secret = process.env.SECRET || 'dattebayo';

const sessionConfig = {
    store,
    secret,
    resave: false,
    saveUninitialized: false,
    cookie: {
        httpOnly: true,
        expire: Date.now() + 1000 * 60 * 60 * 24,
        maxAge: 1000 * 60 * 60 * 24
    }
}

app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: true }));
app.use(session(sessionConfig));
app.use(express.static(path.join(__dirname, 'public')));

const requireLogin = (req, res, next) => {
    if (!req.session.user_id) {
        console.log("No user is logged in");
        return res.redirect('/login');
    }
    next();
}

app.get('/login', (req, res) => {
    res.render('loginpage');
    console.log("login page");
});

app.get('/signup', (req, res) => {
    res.render('signuppage');
    console.log("Signup page");
});

app.get('/home', requireLogin, async (req, res) => {
    console.log("Home page");
    console.log(req.session.user_id);
    const allPost = await Userpost.find().sort({createdAt: -1});
    const allUsers = await Userdetails.find({});
    res.render('homepage', { allPost, allUsers });
});

app.get('/resetpassword', (req, res) => {
    res.render('resetpass');
    console.log("Reset Password");
})

app.post('/logout', (req, res) => {
    // req.session.user_id = null;
    req.session.destroy();
    res.redirect('/login');
})

app.post('/resetpassword', async (req, res) => {
    const { email, password, mobile } = req.body.reset;
    console.log(`Received reset request for email: ${email}`);
    try {
        const reset = await Userdetails.findUserAndUpdate(email, password, mobile);
        if (reset) {
            req.session.user_id = null;
            res.redirect('/login');
            console.log("Password changed successfully");
        } else {
            res.send("Password changing failed");
        }
    } catch (error) {
        console.error('Error during password reset:', error);
        res.send("An error occurred during password reset.");
    }
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body.userdetailslogin;
    console.log(`Login attempt for email: ${email}`);
    try {
        const userValidate = await Userdetails.findAndValidate(email, password);
        if (userValidate) {
            req.session.user_id = userValidate._id;
            res.redirect('/home');
            console.log("Login successful");
        } else {
            res.send("Login error");
            console.log("Login failed");
        }
    } catch (error) {
        console.error('Error during login:', error);
        res.send("An error occurred during login.");
    }
});

app.post('/signup', async (req, res) => {
    const { email, username, mobile, password } = req.body.userdetails;
    const addUser = new Userdetails({
        email: email,
        name: username,
        mobile: mobile,
        password: password,
    });
    await addUser.save().then(() => {
        console.log("signup successful");

    }).catch((error) => {
        console.log(error);
    });
    res.redirect('/login');
})

app.get('/post', requireLogin, async (req, res) => {
    res.render('userpost');
})

app.post('/post', upload.single('image'), requireLogin, async (req, res) => {
    console.log(req.file.path);
    const { caption } = req.body;
    const userName = await Userdetails.findById(req.session.user_id);
    const addPost = new Userpost({
        username: userName.name,
        post: req.file.path,
        caption,
        createdAt: Date.now()
    });
    await addPost.save().then(() => {
        console.log("post saved successful");

    }).catch((error) => {
        console.log(error);
    });
    console.log("posted successfully");
    res.redirect('/home');
})

app.post('/like/:id', requireLogin, async (req, res) => {
    const postId = req.params.id;
    const post = await Userpost.findById(postId);
    if (post) {
        post.likes += 1;
        await post.save();
    }
    res.json({ likes: post.likes, dislikes: post.dislikes });
});

app.get('/about', (req, res) => {
    res.render('aboutpage');
});

app.get('/privacy', (req, res) => {
    res.render('privacypage');
});

app.get('/contactus', (req, res) => {
    res.render('contactus');
})

const port = process.env.PORT || 8080;

app.listen(port, () => {
    console.log("App is up")
})
