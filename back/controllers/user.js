const bcrypt = require('bcrypt');
const user = require('../models/user');
const jwt = require ('jsonwebtoken');
 
exports.signup = (req, res, next)=>{
  bcrypt.hash(req.body.password, 10)
  .then(hash =>{
    const newUser = new user ({
      email:req.body.email,
      password:hash
    });
    newUser.save()
    .then(()=>res.status(201).json({message:'utilisateur créé'}))
    .catch(error =>res.status(400).json({error}));
  })
  .catch(error =>res.status(500).json({error}));

};
exports.login = (req,res, next)=>{
  user.findOne({email:req.body.email})
  .then(user =>{
    if(user===null){
      res.status(401).json({message:'User doesn\'t exist' });
    }else {
      bcrypt.compare(req.body.password, user.password)
      .then(valid =>{
        if(!valid){
          res.status(401).json({message:'invalid email address/password'});
        }else{
          res.status(200).json({
            userId:user._id,
            token: jwt.sign(
              {userId: user._id},
              'RANDOM_TOKEN_SECRET',
              { expiresIn: '24h' },
            )
          })
        };
      })
      .catch(error => {
        res.status(500).json({error});
      })
    };
  })
  .catch(error => {
    res.status(500).json({error});
  })
};