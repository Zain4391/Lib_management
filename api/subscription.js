const subRouter = require('express').Router({ mergeParams: true });
const sqlite3 = require('sqlite3');

const db = new sqlite3.Database(process.env.TEST_DATABASE || './database.sqlite');
module.exports = subRouter;

// Get all subscriptions
subRouter.get('/', (req, res, next) => {
    db.all(`SELECT * FROM Subscriptions WHERE customer_id = $customerId`, {
        $customerId: req.params.customerId
    }, (err, rows) => {
        if (err) {
            next(err);
        } else {
            res.status(200).json({ subscriptions: rows });
        }
    });
});

// Add a new subscription
subRouter.post('/', (req, res, next) => {
    const { startDate, endDate } = req.body;
    const customerId = req.params.customerId;

    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    db.run('INSERT INTO Subscriptions (customer_id, start_date, end_date) VALUES ($customerId, $startDate, $endDate)', {
        $customerId: customerId,
        $startDate: startDate,
        $endDate: endDate
    }, function (err) {
        if (err) {
            next(err);
        } else {
            const newId = this.lastID;
            db.get(`SELECT * FROM Subscriptions WHERE id = $newId`, { $newId: newId }, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(201).json({ subscription: row });
                }
            });
        }
    });
});

// Handle common parameters
subRouter.param('subId', (req, res, next, id) => {
    db.get(`SELECT * FROM Subscriptions WHERE id = $subId`, { $subId: id }, (err, row) => {
        if (err) {
            next(err);
        } else {
            if (row) {
                req.subscription = row;  // Store row in req.subscription instead of req.body
                next();
            } else {
                res.status(404).json({ message: 'Subscription not found' });
            }
        }
    });
});

// Get subscription by ID
subRouter.get('/:subId', (req, res, next) => {
    res.status(200).json({ subscription: req.subscription });
});

// Update subscription by ID
subRouter.put('/:subId', (req, res, next) => {
    const { startDate, endDate } = req.body;
    if (!startDate || !endDate) {
        return res.status(400).json({ message: 'Missing required fields.' });
    }

    if(req.params.subId !== req.params.customerId){
        return res.status(400).json({ message: 'Subscription does not belong to customer.' });
    }

    db.run('UPDATE Subscriptions SET start_date = $startDate, end_date = $endDate WHERE id = $subId AND customer_id = $customerId', {
        $startDate: startDate,
        $endDate: endDate,
        $subId: req.params.subId,
        $customerId: req.params.customerId
    }, function (err) {
        if (err) {
            next(err);
        } else {
            db.get(`SELECT * FROM Subscriptions WHERE id = $subId`, { $subId: req.params.subId }, (err, row) => {
                if (err) {
                    next(err);
                } else {
                    res.status(200).json({ subscription: row });
                }
            });
        }
    });
});

// Delete subscription by ID
subRouter.delete('/:subId', (req, res, next) => {
    if(req.params.subId !== req.params.customerId){
        return res.status(400).json({ message: 'Subscription does not belong to customer.' });
    }
    db.run('DELETE FROM Subscriptions WHERE id = $subId AND customer_id = $customerId', { $subId: req.params.subId, $customerId: req.params.customerId }, function (err) {
        if (err) {
            next(err);
        } else {
            res.status(204).json({ message: 'Subscription deleted.' });
        }
    });
});
