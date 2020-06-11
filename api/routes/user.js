const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
const bcrypt = require('bcrypt')
const jwt = require('jsonwebtoken')
const checkAuth = require('../middleware/check-auth')
const User = require('../models/user')

router.post('/signup', async (req, res) => {
   const user = await User.find({email: req.body.email})
    if(user.length >= 1){
        return res.status(409).json({
            message: 'Mail exists'
        })
    } else {
        bcrypt.hash(req.body.password, 10, async (err, hash) => {
            if(err){
                return res.status(500).json({
                    error: err
                })
            } else {
                try{
                    const user = await new User({
                        _id: new mongoose.Types.ObjectId(),
                        email: req.body.email,
                        password: hash
                    })
                  const result =  await user.save()
                  console.log(result)
                    res.status(201).json({
                        message: 'User created'
                    })
                } catch(err){
                    console.log(err)
                    res.status(500).json({
                        error: err
                    })
                }
              
            }
        })
    }
 
})

router.post('/login', async (req, res) => {
    try{
       const user = await User.find({email: req.body.email})
        if(user.length < 1){
            return res.status(401).json({
                message: `Auth failed`
            })
        }
        bcrypt.compare(req.body.password, user[0].password, (err, result) => {
            if(err){
                return res.status(401).json({
                    message: `Auth failed`
                })
            }
            if(result){
                const token = jwt.sign({
                    email: user[0].email,
                    userId: user[0]._id
                }, 
                process.env.JWT_KEY, 
                {
                    expiresIn: "1h"
                }
                )
               return res.status(200).json({
                    message: 'Auth successful',
                    token
                })
            }
            res.status(401).json({
                message: `Auth failed`
            })
        })

    } catch(err){
        console.log(err)
        res.status(500).json({
            error: err
        })
    }
})


router.delete('/:userId', checkAuth, async (req, res) => {
    try {
       const result = await User.remove({_id: req.params.userId})
       res.status(200).json({
           message: 'User deleted'
       })
    } catch(err){
        console.log(err)
                    res.status(500).json({
                        error: err
                    })
    }
} )


module.exports = router