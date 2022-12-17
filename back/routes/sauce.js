const express = require('express');
const router = express.Router();
const auth = require('../middlewares/auth');
const multer = require('../middlewares/multer-config')
const sauceCtrl = require('../controllers/sauce')

router.get('/:id', auth, sauceCtrl.findOneSauce)
router.get('/', auth, sauceCtrl.findSauces)
router.post('/', auth, multer, sauceCtrl.createSauce)
router.post('/:id/like', sauceCtrl.likeSauce)
router.put('/:id', auth, multer, sauceCtrl.modifySauce)
router.delete('/:id', auth, sauceCtrl.deleteOneSauce)



module.exports = router;
