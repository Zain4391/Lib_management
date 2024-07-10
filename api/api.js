const apiRouter = require('express').Router();

module.exports = apiRouter;

const employeeRouter = require('./employee');
apiRouter.use('/employees',employeeRouter);

const booksRouter = require('./books');
apiRouter.use('/books',booksRouter);

const customerRouter = require('./customer');
apiRouter.use('/customers',customerRouter);

const subRouter = require('./subscription');
apiRouter.use('/subscriptions',subRouter);