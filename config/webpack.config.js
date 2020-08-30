const path = require("path");
const dotenv = require("dotenv");
const CopyPlugin = require('copy-webpack-plugin');
const { CleanWebpackPlugin } = require('clean-webpack-plugin');

dotenv.config();
console.log('DN', __dirname);
module.exports = {
   entry : {
      main : "./src/index.js"
   },
   resolve : {
	   modules : [process.env.NODE_PATH, 'node_modules']
   },
   plugins: [
      new CleanWebpackPlugin(),	   
      new CopyPlugin({
	      patterns: [
		      {from: "./public" , to: "./"}
	      ]
      })
   ],
  module: {
	  rules: [
	    {
	      test: /\.m?js$/,
	      exclude: /(node_modules)/,
	      use: {
		loader: 'babel-loader',
		options: {
		  plugins: ['@babel/plugin-proposal-class-properties']
		}
	      }
	    }
	  ]
   }

}
