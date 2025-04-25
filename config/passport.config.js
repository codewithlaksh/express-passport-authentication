import { Strategy as GithubStrategy } from "passport-github2";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { UserModel } from "../models/user.schema.js";

export default function (passport) {
    passport.use(
        new GoogleStrategy(
            {
                clientID: process.env.GOOGLE_CLIENT_ID,
                clientSecret: process.env.GOOGLE_CLIENT_SECRET,
                callbackURL: process.env.GOOGLE_OAUTH_CALLBACK_URL
            },
            async (accessToken, refreshToken, profile, done) => {
                const email = profile.emails[0].value;
                const user = await UserModel.findOne({ email });

                if (user) {
                    done(null, user);
                } else {
                    const newUser = await UserModel.create({
                        name: profile.displayName,
                        username: email.split('@')[0],
                        email,
                        image: profile.photos[0].value
                    });
                    done(null, newUser);
                }
            }
        )
    ),

    passport.use(
        new GithubStrategy(
            {
                clientID: process.env.GITHUB_CLIENT_ID,
                clientSecret: process.env.GITHUB_CLIENT_SECRET,
                callbackURL: process.env.GITHUB_OAUTH_CALLBACK_URL
            },
            async (accessToken, refreshToken, profile, done) => {
                try {
                    const email = profile.emails[0].value;
                    const user = await UserModel.findOne({ email });

                    if (user) {
                        done(null, user);
                    } else {
                        const newUser = await UserModel.create({
                            name: profile.displayName,
                            username: email.split('@')[0],
                            email,
                            image: profile.photos[0].value
                        });
                        done(null, newUser);
                    }
                }
                catch (error) {
                    done("Cannot read email address. Make sure it's selected in public email!", null)
                }
            }
        )
    ),

    passport.serializeUser((user, done) => {
        done(null, user.id);
    })

    passport.deserializeUser(async (id, done) => {
        try {
            const user = await UserModel.findById(id);
            done(null, user);
        } catch (error) {
            done(error, null);
        }
    })
}