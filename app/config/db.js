const dotenv = require('dotenv').config();

if(process.env.NODE_ENV == "production") {
    module.exports = {
        mongoURI: process.env.LOCALHOST,
        port: process.env.PORT_1
    }
}else{
    module.exports = {
        mongoURI: process.env.LOCALHOST,
        port: process.env.PORT_2,
    }
}