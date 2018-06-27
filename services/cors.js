import cors from 'cors'

export default (app) => {
	//"Origins" del Request permitidos:
	const allowedOrigins = [
		'http://localhost:3000', //HOST DEVELOPMENT
		'http://localhost:5000', //HOST DEVELOPMENT (GraphiQL)
		'https://hlfmember.com' //HOST PRODUCTION
	];

	const corsOptions = {
		origin: function(origin, cb){
			// allow requests with no Origin (like Mobile Apps or CURL Requests or Postman)
			if(!origin) return cb(null, true)


			// if(allowedOrigins.includes(origin)) /*TODO*/
			if(allowedOrigins.indexOf(origin) === -1){
				var msg = `The CORS policy for this site does not allow access from the specified Origin.`
				return cb(new Error(msg), false);
			}
			return cb(null, true);
		},
		methods: ['GET', 'POST', 'PUT', 'DELETE'] //methods permitidos en la API
	}

	app.use(cors(corsOptions))
	// app.use(cors()) //Abierto para todo el mundo

}