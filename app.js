const express = require('express');
const app = express();
const morgan = require('morgan');
const mongoose = require('mongoose');
const cors = require('cors');
require('dotenv/config');

// helper
const authJwt = require('./helpers/jwt');
const errorHandler = require('./helpers/error-handler');

// enabling cors
app.use(cors());
app.options("*", cors());

const api = process.env.API_URL;

// Middleware will handle request and response
app.use(express.json());
app.use(morgan('tiny'));
app.use(authJwt());
app.use("/public/uploads", express.static(__dirname + "/public/uploads"));
app.use(errorHandler);

// connect to mongoDB
mongoose.connect(process.env.CONNECTION_STRING)
.then(() => {
	console.log('Database Connection is ready...');
})
.catch((err) => {
	console.log(err);
});

// initial route
const categoriesRoutes = require('./routes/categories');
const productsRoutes = require('./routes/products');
const usersRoutes = require('./routes/users');
const orderRoutes = require('./routes/orders');

app.use(`${api}/categories`, categoriesRoutes);
app.use(`${api}/products`, productsRoutes);
app.use(`${api}/users`, usersRoutes);
app.use(`${api}/orders`, orderRoutes);

// initial server : start awal respon server running
app.listen(3000, () => {
	console.log(`Server is running : http://localhost:3000`);
});