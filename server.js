const express = require("express");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const multer  = require('multer')
//const upload = multer({ dest: 'uploads/' })
const storage = multer.diskStorage({
  destination: "uploads/",
  filename: (req, file, cb) => {
      const ext = path.extname(file.originalname); // Extrae la extensión (.jpg, .png, etc.)
      const uniqueName = Date.now() + "-" + Math.round(Math.random() * 1E9) + ext;
      cb(null, uniqueName);
  }
});
const upload = multer({ storage: storage })
const app = express();
const port = 3006;
const jwt = require("jsonwebtoken");
const cors = require("cors");
const JWT_SECRET = "ofdiswien384349";

const cookieParser = require('cookie-parser');
const path= require('path');
app.use(cookieParser());

require('dotenv').config();

mongoose.connect(process.env.CADENA)
  .then(() => console.log('Connected!'));

// Middleware para parsear el cuerpo de las solicitudes en formato JSON
app.use(express.json());
app.use(cors());
app.use(express.static('public'));
app.use('/uploads', express.static('uploads'));
app.set('view engine','ejs');
app.set('views', './views');
const modeloOrdenador = require('./models/ordenador');
const User = require("./models/User");
const User1 = require("./models/User");



const verificarToken = (req, res, next) => {
  const token = req.cookies.token;
  if (!token) return res.status(401).json({ mensaje: "Acceso denegado. No hay token." });

  try {
      const decoded = jwt.verify(token, JWT_SECRET);
      req.usuario = decoded;
      next();
  } catch (error) {
      res.status(401).json({ mensaje: "Token inválido" });
  }
};




app.get('/update_ordenador',verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      const id = req.query.id;
      modeloOrdenador.buscaPorId(id)
      .then(
        ordenador=>res.render('actualiza', { ordenador })
      )
      .catch(err=>res.status(500).send("error"))
    }

  

  
});

app.post('/update_ordenador', verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      const { id, marca, precio } = req.body;
      modeloOrdenador.buscaPorId(id).then(ordenador => { 
        if (ordenador) {
          
          ordenador.marca = marca;
          ordenador.precio = precio;
          ordenador.save()
          .then(ordenador=>res.redirect('/'))
          .catch(err=>res.status(500).send("error"))
        } else {
          res.status(404).send('Ordenador no encontrado');
        }
      });
    }
 
    
  
  

});
// Ruta para subir archivos
app.post('/subir', upload.single('file'), verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      if (!req.file) {
        return res.status(400).json({ message: 'No se ha subido ningún archivo' });
      }
      res.json({ message: 'Archivo subido correctamente', file: req.file });

}
});


  app.get('/usuarios/', verificarToken, (req,res)=>{
    
    
    //if (!token) return res.status(401).json({ mensaje: "Acceso denegado. No hay token." });
    const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      User.find()
    
    .then( 
      users=>res.json(users))
      //users=>res.render('usuarios',{users}))
    .catch(error=>res.status(500).json({mensaje: Err}))
    }
    
  
 

}
)

app.post('/borrartoken', (req,res)=>{
  res.clearCookie("token");
  res.json({"Token borrado":"Correctamente"})


}
)



app.get('/usuario/:id', verificarToken, (req,res)=>{
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      const id=req.params.id;
      User.findById(id)
      .then( user=>res.render('usuario',{user}))
      .catch(error=>res.status(500).json({mensaje: Err}))
    }
  

}

  
)


//registro de usuario
app.post('/registro', upload.single('foto'), (req, res) => {
  const { name, email, password } = req.body;

  // Encriptar contraseña
  bcrypt.genSalt(10)
    .then(salt => bcrypt.hash(password, salt))
    .then(hashedPassword => {
      // Crear usuario
      const newUser = new User({
        name,
        email,
        password: hashedPassword,
        foto: req.file.filename
      });


      // Guardar usuario
      return newUser.save();
    })
    .then(() => {
      res.json({ message: 'Usuario registrado correctamente' });
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error al registrar usuario' });
    });
});

app.get('/login', (req, res) => {
    /*if(req.cookies.token){
      
    }*/
    res.render("login");
});

app.post('/login', (req, res) => {

  

  
  const { email, password } = req.body;
  

  // Buscar usuario
  User1.findOne({ email })
  
    .then(user => {
      if (!user) {
        return res.status(400).json({ message: 'Usuario inválidas' });
      }
      const token = jwt.sign({ email: email }, JWT_SECRET, { expiresIn: "1h" });

      // Comparar contraseñas
      return bcrypt.compare(password, user.password)
        .then(isMatch => {
          if (!isMatch) {
            return res.status(400).json({ message: 'Contraseña inválidas' });
          }
          
          res.cookie("token", token, { httpOnly: true, secure:false, sameSite: "Strict" }); 
          res.json({ message: 'Usuario autenticado correctamente' });
          
          
          
          
        });
        
    })
    .catch(error => {
      console.error(error);
      res.status(500).json({ message: 'Error al iniciar sesión' });
    });
});


// Obtener todos los ítems
app.get("/items", verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      modeloOrdenador.buscaTodos()
      .then(
        ordenadores=>res.status(200).json(ordenadores)
      )
      .catch(err=>res.status(500).send("error"))
    }
  
});


// Obtener un ítem por ID
app.get("/items/:id", verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      const itemId = req.params.id;
      modeloOrdenador.buscaPorId(itemId)
      .then(
        ordenador=>res.status(200).json(ordenador)
      )
      .catch(err=>res.status(500).send("error"))
    } 
  
});


// Crear un nuevo ítem
app.post("/items", verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      marca= req.body.marca;
      precio= req.body.precio;
      modelo=req.body.modelo;
      cantidad=req.body.cantidad;
      diseño=req.body.diseño;
      reseñas=req.body.reseñas;
      modeloOrdenador.creaNuevoOrdenador(marca,precio,modelo,cantidad,diseño,reseñas)
      .then(
        ordenador=>res.status(200).json(ordenador)
      )
      .catch(err=>res.status(500).send("error"))
    }
    

});


// Actualizar un ítem existente
app.put("/items/:id", verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      const itemId = req.params.id;
      ordenador = req.body;
      //res.send(ordenador);
      modeloOrdenador.actualizaOrdenador(itemId,ordenador)
      .then(
        ordenadorActualizado=>res.status(200).json(ordenadorActualizado)
      )
      .catch(err=>res.status(500).send("error al actualizar el ordenador"))
    }
  

});


// Eliminar un ítem
app.delete("/items/:id", verificarToken, (req, res) => {
  const token = req.cookies.token;
    if(!token){
      res.render("login");
    }else{
      const itemId = req.params.id;
      modeloOrdenador.borraOrdenador(itemId)
      .then(
        ordenador=>res.status(200).json(ordenador)
      )
      .catch(err=>res.status(500).send("error"))
    }
  

});


// Iniciar el servidor
app.listen(port, () => {
  console.log(`Servidor escuchando en http://localhost:${port}`);
});
