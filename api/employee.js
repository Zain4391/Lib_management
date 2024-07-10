const employeeRouter = require('express').Router();
const sqlite3 = require('sqlite3');

module.exports = employeeRouter;

//connection with database

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');

//get all employees
employeeRouter.get('/', (req, res) => {
    db.all('SELECT * FROM Employees',(err,rows) => {
        if(err) {
            next(err);
        }else{
            res.status(200).json({employee: rows});
        }
    });
});

//create a new employee record & insert in table
employeeRouter.post('/', (req, res, next) => {
    const name = req.body.name;
    const position = req.body.position;
    const email = req.body.email;

    if(!name || !position || !email){
        return res.status(400).json({message: 'Please fill all the fields.'});
    }

    db.run('INSERT INTO Employees (name,position,email) VALUES ($name,$position,$email)',{
        $name: name,
        $position: position,
        $email: email
    },function(err){
        if(err){
            next(err);
        }else{
            const newId = this.lastID;
            db.get('SELECT * FROM Employees WHERE id = $newId',{$newId: newId},(err,row) => {
                res.status(201).json({employee: row});
            });
        }
    });
});

//handling common parameters
employeeRouter.param('employeeId',(req,res,next,id) => {
    db.get('SELECT * FROM Employees WHERE id = $employeeId',{$employeeId: id},(err,row) => {
        if(err){
            next(err);
        }else{
            if(!row){
                return res.status(404).json({message: 'Employee not found.'});
            }
            req.employee = row;
            next();
        }
    });
});

//Retrieve employee via id
employeeRouter.get('/:employeeId', (req, res, next) => {
    res.json({employee: req.employee});
});

//update data via id
employeeRouter.put('/:employeeId',(req,res,next) => {
    const name = req.body.name;
    const position = req.body.position;
    const email = req.body.email;

    if(!name || !position || !email){
        return res.status(400).json({message: 'Please fill all the fields.'});
    }
    db.run('UPDATE Employees SET name = $name, position = $position, email = $email WHERE id = $employeeId',{
        $name: name,
        $position: position,
        $email: email,
        $employeeId: req.params.employeeId
    },function(err){
        if(err){
            return next(err);
        }else{
            db.get('SELECT * FROM Employees WHERE id = $employeeId',{$employeeId: req.params.employeeId},(err,row) => {
                res.status(200).json({employee: row});
            });
        }
    });
});

employeeRouter.delete('/:employeeId',(req,res,next) => {
    db.run('DELETE FROM Employees WHERE id = $employeeId',{$employeeId: req.params.employeeId},function(err){
        if(err){
            return next(err);
        }else{
            res.status(204).json({message: 'Employee deleted.'});
        }
    });
});