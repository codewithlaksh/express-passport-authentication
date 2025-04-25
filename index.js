import express from "express";
import { connectDb } from "./db/index.js";
import "dotenv/config";
import morgan from "morgan";
import { engine } from "express-handlebars";
import MongoStore from "connect-mongo";
import session from "express-session";
import passport from "passport";
import passportConfig from "./config/passport.config.js";
import { checkAuth } from "./middleware/checkAuth.js";
import { isGuest } from "./middleware/isGuest.js";

const app = express();
const port = process.env.PORT || 8080;

connectDb()
    .then(() => {
        if (process.env.NODE_ENV !== "prod") app.use(morgan('dev'));

        // Static files configuration
        app.use(express.static("public"))

        // Express handlebars configuration
        app.engine('.hbs', engine({
            extname: '.hbs',
            defaultLayout: 'main'
        }));
        app.set('view engine', '.hbs');

        // Express session configuration
        const mongoStore = new MongoStore({
            mongoUrl: process.env.MONGODB_URI
        });
        app.use(session({
            secret: process.env.SESSION_SECRET,
            resave: false,
            saveUninitialized: false,
            store: mongoStore
        }));

        // Passport middleware
        app.use(passport.initialize())
        app.use(passport.session())

        passportConfig(passport);

        app.use((req, res, next) => {
            if (req.user) {
                res.locals.user = {username: req.user.username, image: req.user.image};
            } else {
                res.locals.user = null;
            }
            next();
        })

        app.get('/', isGuest ,(req, res) => {
            res.render('index')
        });

        app.get('/user/profile', checkAuth, (req, res) => {
            res.render('profile')
        });

        app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

        app.get('/auth/google/callback', passport.authenticate('google', {
            successRedirect: '/user/profile',
            failureRedirect: '/'
        }));

        app.get('/auth/github', passport.authenticate('github', { scope: ['user:email', 'read:user'] }));

        app.get('/auth/github/callback', passport.authenticate('github', {
            successRedirect: '/user/profile',
            failureRedirect: '/'
        }));

        app.get('/auth/logout', checkAuth, (req, res) => {
            req.logout(() => {
                res.redirect('/');
            });
        })

        app.listen(port, () => {
            console.log(`App listening on port ${port}`);
        })
    })
    .catch((error) => {
        console.log('Error connecting to database: ', error);
        process.exit(1);
    })
