const dotenv = require('dotenv').config();
// const path = require('path');
// dotenv.config({
//     path: path.resolve(__dirname, `../${process.env.NODE_ENV}.env`)
// });


if(process.env.NODE_ENV == "production") {
    module.exports = {mongoURI: process.env.DB_HEROKU}
}else{
    module.exports = {mongoURI: process.env.LOCALHOST}
}