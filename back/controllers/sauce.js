const fs = require('fs')
const auth = require('../middlewares/auth');
const sauce = require('../models/sauce');

exports.createSauce = (req,res,next)=>{
  const sauceObject = JSON.parse(req.body.sauce);
  delete sauceObject._id;
  delete sauceObject._userId;
  const newSauce = new sauce({
    ...sauceObject,
    userId: req.auth.userId,
    imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`,
    likes:0,
    dislikes:0,
    usersLiked:[],
    usersDisliked:[]
  });
  newSauce.save()
    .then(()=> res.status(201).json({message:'Sauce created!'}))
    .catch(error => res.status(400).json({error}))
  

 
};
exports.modifySauce = (req,res,next)=>{
  let sauceObject = req.file?{...JSON.parse(req.body.sauce), 
  imageUrl: `${req.protocol}://${req.get('host')}/images/${req.file.filename}`
  } : {...req.body};
  delete sauceObject._userId;
  sauce.findOne({_id:req.params.id})
    .then((modSauce) =>{
      if(modSauce.userId != req.auth.userId){
        res.status(403).json({message:'Unauthorized Request'});
      }else{
        sauce.updateOne({_id:req.params.id},{...sauceObject,_id:req.params.id})
        .then(()=>res.status(200).json({message:'Objet bien modifié'}))
        .catch(error =>res.status(401).json({error}));
      }
    })
    .catch(error => res.status(400).json({error}));

};
exports.deleteOneSauce = (req,res,next)=>{
  sauce.findOne({_id:req.params.id})
    .then(sauce =>{
      if(sauce.userId != req.auth.userId){
        res.status(401).json({message:'Not authorized'});
      }else{
        const filename = sauce.imageUrl.split('/images/')[1];
        fs.unlink(`images/${filename}`, () =>{
          sauce.deleteOne({_id:req.params.id})
          .then(()=>res.status(200).json({message:'Objet bien supprimé'}))
          .catch(error=>res.status(400).json({error}));
        })
      };
    })
    .catch(error=>res.status(500).json({error}));
};
exports.findOneSauce = (req, res, next)=>{
  sauce.findOne({_id:req.params.id})
    .then( existSauce => res.status(200).json(existSauce))
    .catch(error => res.status(404).json({error}))

};
exports.findSauces = (req, res, next)=>{
  sauce.find()
    .then(allSauces => res.status(200).json(allSauces))
    .catch(error=>res.status(400).json({error})) 
  
};
exports.likeSauce = (req,res,next)=>{  
  const liker = req.body.userId;
  let likeStatus = req.body.like;
  sauce.findOne({_id:req.params.id})
    .then((votedSauce)=>{  
      if(likeStatus === 1){
        sauce.updateOne({_id:req.params.id}, {$push:{usersLiked:liker}, $inc:{likes:1}})
          .then(()=>res.status(201).json({message:'you liked this sauce'}))
          .catch(error=>res.status(400).json({error}))
      } else if (likeStatus === -1) {
        sauce.updateOne({_id:req.params.id}, {$inc:{dislikes:1},$push:{usersDisliked:liker}})
          .then(()=>res.status(201).json({message:'you disliked this sauce'}))
          .catch(error=>res.status(400).json({error}))
      } else if(likeStatus === 0){
          if(votedSauce.usersLiked.includes(liker)){
            sauce.updateOne({_id:req.params.id}, {$inc: {likes: -1}, $pull: {usersLiked:liker}})
            .then(()=>res.status(201).json({message:'you un-liked this sauce'}))
            .catch(error=>res.status(400).json({error}))
          } else if (votedSauce.usersDisliked.includes(liker)){
            sauce.updateOne({_id:req.params.id}, { $inc: {dislikes: -1}, $pull: {usersDisliked:liker}})
            .then(()=>res.status(201).json({message:'you un-disliked this sauce'}))
            .catch(error=>res.status(400).json({error}))
          }
      }
    })
    .catch(error=>res.status(400).json({error}))
};
