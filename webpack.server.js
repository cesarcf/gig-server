const path = require('path')
const webpack = require('webpack')
const merge = require('webpack-merge')
const baseConfig = require('./webpack.base.js')
const webpackNodeExternals = require('webpack-node-externals')
const CleanWebpackPlugin = require("clean-webpack-plugin")


module.exports = env => {
	const IS_DEVELOPMENT = (env === 'development') ? true : false
	const ifDev = (then) => (IS_DEVELOPMENT ? then : null)
	const ifProd = (then) => (!IS_DEVELOPMENT ? then : null)
	const falsy = (i) => i //Para usar en [].filter(falsy)


	const serverConfig = {
		target: 'node',

		node:{
			__dirname: true //The "dirname" of the input file relative to the context option.
		},

		//root file del server
		entry: [
			'babel-polyfill',
			'./server.js'
		],

		//donde va a sacar el 'build.js' webpack?
		output: {
			filename: IS_DEVELOPMENT ? 'dev.js' : 'prod.js',
			path: path.resolve(__dirname, 'build')
		},

		//Nos permite debuggear los errores y warnings en los archivos de origen una vez hecho el bundle
		//This option controls if and how source maps are generated
		devtool: IS_DEVELOPMENT ? 'eval' : false,

		module: {

			rules:[
				/////////////////// JS|JSX|BABEL ///////////////////
				{
					test: /\.jsx?$/,
					loader: 'babel-loader',
					exclude: /node_modules/,
					options: {
						presets: [
							// 'react',
							['env',
								{
									//modules = false le dice a babel que no utilize "modules"
									//Ya que esto lo hara Webpack por nosotros en lugar de babel.
									modules: false,
									targets: { browsers: ['last 2 versions'] }
								}
							],
							'stage-0'
						],
						//Plugins va dentro de options
						plugins:[]
					}
				},

				{
					test: /\.(html)$/,
					use: {
						loader: 'html-loader',
					}
				}
			]
		},

		//ignora las librerias que existan en "node_modules" y hayamos
		//requerido en nuestro proyecto during build process
		externals: [webpackNodeExternals()],


		plugins: [
			new webpack.DefinePlugin({
				'process.env.NODE_ENV': JSON.stringify(process.env.NODE_ENV)
			}),
			ifProd(new CleanWebpackPlugin(['build'], { root: __dirname }))
		].filter(falsy)

	}

	return merge(baseConfig, serverConfig)
}