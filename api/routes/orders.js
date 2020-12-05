const express = require('express')
const {isAuthenticated, hasRoles} = require('../auth')
const Orders = require('../models/Orders')

const router = express.Router()

//Crearcion de Endpoint
router.get('/', (req, res) => {
    Orders.find()
    .exec()
    .then(data => res.status(200).send(data))
})

router.get('/:id', (req, res) => {
    Orders.findById(req.params.id)
    .exec()
    .then(data => res.status(200).send(data))
})

router.post('/', isAuthenticated, (req, res) => {
    const { _id } = req.user
    Orders.create({ ...req.body, user_id: _id})
    .then(data => res.status(201).send(data))
})

router.put('/:id', isAuthenticated, hasRoles(['admin', 'user']) ,(req, res) => {
    Orders.findOneAndUpdate(req.params.id, req.body)
    .then(() => res.sendStatus(204))
})

router.delete('/:id', isAuthenticated, (req, res) => {
    Orders.findOneAndDelete(req.params.id).exec()
    .then(() => res.sendStatus(204))
})

module.exports = router