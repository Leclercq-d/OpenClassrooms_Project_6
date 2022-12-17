const multer = require('multer');
const Mime_Types = {
  'image/jpg': 'jpg',
  'image/jpeg': 'jpg',
  'image/png': 'png'
};
const storage = multer.diskStorage({
  destination:(req, file, callback)=>{
    callback(null, 'images')
  },
  filename: (req,file, callback)=>{
    const name = file.originalname.split('').join('_');
    const extension = Mime_Types[file.mimetype];
    callback(null, name + Date.now() + '.' + extension);
  }
});

module.exports = multer({storage}).single('image'); 