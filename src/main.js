// Entry point of the Supertoad space war application
require('dotenv').config({path: require('path').resolve(__dirname, '../.env')});
const {bootstrap} = require('./bootstrap');

bootstrap({logger: console});