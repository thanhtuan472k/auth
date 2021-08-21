const express = require('express');
const mongoose = require('mongoose');
const app = express();
const User = require('./models/user');
const bcrypt = require('bcrypt');
const session = require('express-session');
const requireLogin = require('./middleware/login');

// Add static style
app.use(express.static(__dirname + '/public'));

// Connect MongoDB
mongoose
    .connect('mongodb://localhost:27017/authDemo', {
        useNewUrlParser: true,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log('Mongo Connect Open!!!');
    })
    .catch((err) => {
        console.log('Oh no Mongo Connection Erro!!!');
        console.log(err);
    });

app.set('view engine', 'ejs');
app.set('views', 'views');

// app.engine('hbs', hbs({ extname: '.hbs' }));
// app.set('view engine', 'hbs');

app.use(express.urlencoded({ extended: true }));
app.use(session({ secret: 'notagoodsecret' }));

// Route
app.get('/', (req, res, next) => {
    res.send('This is the home page');
});

app.get('/register', (req, res, next) => {
    res.render('register');
});

app.post('/register', async (req, res, next) => {
    const { password, username } = req.body;
    const user = new User({ username, password });
    await user.save();
    req.session.user_id = user._id;
    res.redirect('/');
});

app.get('/login', (req, res, next) => {
    res.render('login');
});

app.post('/login', async (req, res, next) => {
    const { username, password } = req.body;
    const foundUser = await User.findAndValidate(username, password);
    if (foundUser) {
        req.session.user_id = foundUser._id;
        res.redirect('/secret');
    } else {
        res.redirect('/login');
    }
});

app.post('/logout', (req, res, next) => {
    req.session.user_id = null;
    // req.session.destroy();
    res.redirect('/login');
});

app.get('/secret', requireLogin, (req, res, next) => {
    res.render('secret');
});

app.get('/topsecret', requireLogin, (req, res, next) => {
    res.send('TOP SECRET!!!');
});

app.listen(3000, () => {
    console.log('SERVING YOUR APP!');
});
