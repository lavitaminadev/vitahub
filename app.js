// Phusion Passenger entry point — starts compiled NestJS API
const path = require('path');
process.env.NODE_ENV = process.env.NODE_ENV || 'production';
require(path.join(__dirname, 'apps', 'api', 'dist', 'main'));
