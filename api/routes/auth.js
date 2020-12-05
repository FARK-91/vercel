const express = require('express')
const crypto = require('crypto')
const jwt = require('jsonwebtoken')
const Users = require('../models/Users')
const { isAuthenticated } = require('../auth')

const router = express.Router()

// Funcion para encriptar y desencriptar tokens
const signToken = (_id) => {
    return jwt.sign({ _id }, 'mi-secreto', {
        expiresIn: 60 * 60 * 24 * 365,
    })
}

//Creacion de Endpoint para registrarse
router.post('/register', (req, res) => {
    const { email, password } = req.body
    // Metodo de encriptacion
    crypto.randomBytes(16, (err, salt) => {
        const newSalt = salt.toString("base64")
        crypto.pbkdf2(password, newSalt, 10000, 64, 'sha1', (err, key) => {
            const encryptedPasswd = key.toString("base64")
            Users.findOne({email}).exec()
            .then(user => {
                if(user) {
                    return res.send('Usuario ya existe')
                }
                Users.create({
                    email,
                    password: encryptedPasswd,
                    salt: newSalt
                })
                .then(() => {
                    res.send('Usuario creado con exito')
                })
            })
        })
    })
})

// Endpoint para hacer login
router.post('/login', (req, res) => {
    const { email, password } = req.body
    Users.findOne({ email }).exec()
    .then(user => {
        if (!user){
            return res.send('Usuario y/o Contraseña incorrecta.')
        }
        crypto.pbkdf2(password, user.salt, 10000, 64, 'sha1', (err, key) => {
            const encryptedPasswd = key.toString('base64')
            if (user.password === encryptedPasswd){
                const token = signToken(user._id)
                return res.send({ token })
            }
            return res.send('Usuario y/o Contraseña incorrecta.')
        })
    })
})

// Para que el usuario que hace login obtenga sus propios datos.
router.get('/me', isAuthenticated, (req, res) => {
    res.send(req.user)
})

module.exports = router