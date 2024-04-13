const express = require('express');
const path = require('path');
const session = require('express-session');
const { User, connectSignUp} = require('./models/signUpDB');

const app = express();

// Set up EJS for templating
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
//Middleware
app.use(session({
    secret: 'your-secret-key',
    resave: false,
    saveUninitialized: true
}));

// Connect to the database
connectSignUp()
    .then(() => {
        console.log("database file is linked successfully");});

// Route to handle GET requests for the signup page
app.get('/signup.ejs', async (req, res) => {
    try {
        // Retrieve all users from the database
        const users = await User.find();
        // Render the 'signup' template and pass the users data to it
        res.render('signup', { users });
    } catch (err) {
        console.error("Error retrieving users from database:", err);
        res.status(500).send('Error retrieving users from database');
    }
});

// Route to handle POST requests from the signup form
app.post('/signup', async (req, res) => {
    try {
        // Extract data from the request body
        const { username, email, phone, gender, password } = req.body;
        // Create a new user document
        const newUser = new User({ username, email, phone, gender, password });
        // Save the user document to the database
        await newUser.save();
        console.log('User data saved successfully:', newUser);
        // Store user information in the session
        req.session.user = newUser;
        res.redirect('/content');
    } catch (err) {
        console.error("Error saving user data:", err);
        res.status(500).send('Error saving user data');
    }
});

// Route to handle POST requests from the login form
app.post('/login', async (req, res) => {
    try {
        // Extract email and password from request body
        const { email, password } = req.body;

        // Check if a user with the provided email exists in the database
        const user = await User.findOne({ email });

        if (!user || user.password !== password) {
            // If user doesn't exist or password is incorrect, render login page with error message
            return res.status(401).render('login', { error: 'Invalid email or password' });
        }

        // Store user information in the session
        req.session.user = user;

        // If authentication is successful, redirect to the content page
        res.redirect('/content');
    } catch (err) {
        console.error("Error logging in:", err);
        res.status(500).send('Error logging in');
    }
});






// Route to handle GET requests for the home page
app.get('/', (req, res) => {
    res.render('homePage');
});


app.get('/content', (req, res) => {
    try{
        const user = req.session.user;
        if (!user) {
            // If user is not logged in, redirect to the login page
            return res.redirect('/login');
        }
        res.render('homeContent', { user: user }); // Pass the user object to the template

    } catch (err) {
        console.error("Error rendering content page:", err);
        res.status(500).send('Error rendering content page');
    }
});

app.get('/login', (req, res) => {
    res.render('login', {error:req.query.error});
});

app.get('/signup', (req, res) => {
    res.render(`signup`);
});

app.get('/logout', (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            console.error("Error destroying session:", err);
            res.status(500).send('Error logging out');
        } else {
            res.redirect('/');
        }
    });
});

const port = 5000;
app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
