const customerRouter = require('express').Router();
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

module.exports = customerRouter;

const subRouter = require('./subscription');
customerRouter.use('/:customerId/subscriptions',subRouter);

//get all customers
customerRouter.get('/',(req,res,next) =>{
    db.all(`SELECT * FROM Customers`,(err,rows) => {
        if(err){
            next(err);
        }else{
            res.status(200).json({customers:rows});
        }
    });
});

//Create cutomer
customerRouter.post('/',(req,res,next) => {
    const name = req.body.name;
    const address = req.body.address;
    const phone = req.body.phone;

    if(!name || !address || !phone){
        return res.sendStatus(400);
    }

    db.run('INSERT INTO Customers (name,address,phone) VALUES ($name,$address,$phone)',{
        $name:name,
        $address:address,
        $phone:phone
    },function(err){
        if(err){
            next(err);
        }else{
            const newId = this.lastID;

            db.get('SELECT * FROM Customers WHERE id = $newId',{
                $newId:newId
            },(err,row) => {
                if(err){
                    next(err);
                }else{
                    res.status(201).json({customer:row});
                }
            });
        }
    });
});

//handle common parameters
customerRouter.param('customerId',(req,res,next,id) => {
    db.get('SELECT * FROM Customers WHERE id = $customerid',{
        $customerid:id
    },(err,row) => {
        if(err){
            next(err);
        }
        else if(!row){
            res.sendStatus(404);
        }
        req.customers = row;
        next();
    });
});

//Get customer via Id
customerRouter.get('/:customerId',(req,res,next) => {
    res.status(200).json({customer:req.customers});
});

customerRouter.put('/:customerId',(req,res,next) => {
    const {name,address,phone} = req.body;
    
    if(!name || !address || !phone){
        return res.sendStatus(400);
    }

    db.run('UPDATE Customers SET name = $name, address = $address, phone = $phone WHERE id = $customerId',{
        $name:name,
        $address:address,
        $phone:phone,
        $customerId:req.params.customerId
    },function(err){
        if(err){
            next(err);
        }else{
            db.get('SELECT * FROM Customers WHERE id = $customerId',{
                $customerId:req.params.customerId
            },(err,row) => {
                if(err){
                    next(err);
                }else{
                    res.status(200).json({customer:row});
                }
            });
        }
    });
});

customerRouter.delete('/:customerId',(req,res,next) => {
    db.run('DELETE FROM Customers WHERE id = $customerId',{
        $customerId:req.params.customerId
    },(err,row) => {
        if(err){
            next(err);
        }else{
            res.sendStatus(204);
        }
    });
});

//get a specific customers subscription
customerRouter.get('/:customerId/subscription',(req,res,next) => {
    db.get('SELECT * FROM Subscriptions WHERE customer_id = $customerId',{
        $customerId:req.params.customerId
    },(err,row) => {
        if(err){
            next(err);
        }else{
            res.status(200).json({subscription:row});
        }
    });
});