import passport from 'passport'
import { Strategy as JwtStrategy } from 'passport-jwt'
import { ExtractJwt } from 'passport-jwt'
import LocalStrategy from 'passport-local'
import { Strategy as GoogleStrategy } from 'passport-google-oauth20'
import { Strategy as FacebookStrategy } from 'passport-facebook'
import { Strategy as InstagramStrategy } from 'passport-instagram'
import User from '../models/User'
import keys from '../config/keys'

//////////////////////////////////////////
///////// OAuth Strategy ///////////
////////////////////////////////////////////
passport.serializeUser((user, done) => {
	done(null, user.id)
});

passport.deserializeUser((id, done) => {
	User.findById(id).then(user => done(null, user))
});




//////////////////////////////////////////
///////// JWT Strategy ///////////
////////////////////////////////////////////
//Options para la JWT Strategy
const jwtOptions = {
	jwtFromRequest: ExtractJwt.fromHeader('authorization'), //De donde quiero que extraiga el Token
	secretOrKey: keys.JWT_SECRET //el "secret" con el que se creó, para poder desencriptarlo
}

//Crear JWT Strategy
const jwtLogin = new JwtStrategy(jwtOptions, async (payload, done) => {
	const user = await User.findById(payload.sub)
	if(user){
		done(null, user)
	}else{
		done(null, false)
	}

});

//Tell passport to use this Strategy:
passport.use(jwtLogin)




//////////////////////////////////////////
///////// Local Strategy ///////////
////////////////////////////////////////////
const localOptions = { usernameField: 'email', passwordField: 'password' }
const localLogin = new LocalStrategy(localOptions, (email, password, done) => {
	//Verificar el email y password
	User.findOne({ email: email.toLowerCase() })
		.then(user => {
			//comparamos las password, es "password" igual a user.password?
			user.comparePassword(password, (err, isMatch) => {
				if(err) { return done(err) }
				if(!isMatch){ return done(null, false) }

				//Añadimos el authMethod = 'local'
				//Si crea primero la cuenta con SocialAuth no puede modificar el firstName
				//al entrar a traves de 'local'
				user.update({ $addToSet: { 'authMethod': 'local' } }).then(() => {
					//Con este "user" passport rellena el "req.user" y lo podemos usar en el routeHandler
					return done(null, user)
				})
			})
		})
		.catch(err => done(null, false))
});

//Tell passport to use this Strategy:
passport.use(localLogin)





//////////////////////////////////////////
///////// Google Strategy ///////////
////////////////////////////////////////////
const googleOptions = {
	clientID: keys.GOOGLE_CLIENT_ID,
	clientSecret: keys.GOOGLE_CLIENT_SECRET,
	callbackURL: keys.GOOGLE_CALLBACK_URL, // -> /auth/google/callback
	//proxy: true
}

const googleLogin = new GoogleStrategy(googleOptions, (accessToken, refreshToken, profile, done) => {
	// profile { id, provider, displayName, email[0].value, photos[0].value }
	User.findOne({ email: profile.emails[0].value })
		.then((existingUser) => {
			if(existingUser){
				//Ya tenemos el user en la database
				//Ahora se lo pasamos a la funcion serialize()
				existingUser.googleId = profile.id
				existingUser.firstName = profile.displayName.split(' ', 2)[0]
				return done(null, existingUser)
			}

			//Creamos un nuevo user en el database
			const user = new User({
				firstName: profile.displayName.split(' ', 2)[0],
				lastName: profile.displayName.split(' ', 2)[1],
				email: profile.emails[0].value.toLowerCase(),
				password: profile.emails[0].value.toLowerCase(),
				googleId: profile.id,
				authMethod: profile.provider
			})

			user.save()
				//Ya tenemos el user en la database
				//Ahora se lo pasamos a la funcion serialize()
				.then(() => done(null, user))
		})
		.catch((err) => done(null, false))

})

passport.use(googleLogin)



//////////////////////////////////////////
///////// Facebook Strategy ///////////
////////////////////////////////////////////
const facebookOptions = {
	clientID: keys.FACEBOOK_CLIENT_ID,
	clientSecret: keys.FACEBOOK_CLIENT_SECRET,
	callbackURL: keys.FACEBOOK_CALLBACK_URL, // -> /auth/facebook/callback
	//proxy: true,
	profileFields: ['id','displayName', 'photos','email']
}

const facebookLogin = new FacebookStrategy(facebookOptions, async (accessToken, refreshToken, profile, done) => {
	// profile { id, provider, displayName, email[0].value, photos[0].value }
	const existingUser = await User.findOne({ email: profile.emails[0].value })

	if(existingUser){
		existingUser.facebookId = profile.id
		existingUser.firstName = profile.displayName.split(' ', 2)[0]
		return done(null, existingUser)
	}

	//Creamos un nuevo user en el database
	const user = await new User({
		firstName: profile.displayName.split(' ', 2)[0],
		lastName: profile.displayName.split(' ', 2)[1],
		email: profile.emails[0].value.toLowerCase(),
		password: profile.emails[0].value.toLowerCase(),
		facebookId: profile.id,
		authMethod: profile.provider
	})

	user.save()
	done(null, user)

})


passport.use(facebookLogin)

