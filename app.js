//Chamando cada modulo
const Express = require("express")
const HandleBars = require("express-handlebars")
const bodyparser = require('body-parser')
const app = Express()
const admin = require('./routes/admin')
const path = require('path')
const Mongoose = require("mongoose")
const session = require('express-session')
const flash = require('connect-flash')
require('./models/Postagens')
const Postagem = Mongoose.model('Postagens')
require("./models/Categorias")
const Categorias = Mongoose.model('Categorias')
const Usuario = require('./routes/Usuario')
const passport = require("passport")
require('./config/auth')(passport)
//configurações
    //Sessão
        app.use(session({
            secret: 'cursonod',
            resave: true,
            saveUninitialized: true
        }))
        app.use(passport.initialize())
        app.use(passport.session())
        app.use(flash())
    //Middleware
        app.use((req, res, next) =>{
            res.locals.success_msg = req.flash('success_msg')
            res.locals.erro_msg = req.flash('erro_msg')
            res.locals.erro = req.flash('erro')
            next()
        })
    //BodyParse
        app.use(bodyparser.urlencoded({extend: true}))
        app.use(bodyparser.json())
    //handlebars
        app.engine('handlebars', HandleBars.engine({defaultLayout: 'main'}))
        app.set('view engine', 'handlebars')
    //Mongoose
        Mongoose.promisse = global.promisse
        Mongoose.connect('mongodb://localhost/blogapp').then(() =>{
            console.log('Conectado com mongo')
        }).catch((erro) =>{
            console.log(`Erro ao se conectar com o mongo ${erro}`)
        })
    //Public
        app.use(Express.static(path.join(__dirname,'Public')))
    //Rota princpal
        app.get("/", (req,res) =>{
            Postagem.find().lean().populate('categoria').sort({date:'desc'}).then((Postagens) =>{
                res.render('index',{Postagens:Postagens})
            }).catch((erro) =>{
                req.flash('erro_msg','Houve um erro ao mostra as postagens')
                res.redirect('/404')
            })
            
        })
        //Rota do leia mais
        app.get('/postagem/:slug', (req,res)=>{
                Postagem.findOne({slug: req.params.slug}).lean().then((Postagem)=>{
                    if(Postagem){
                        res.render('postagem/index',{Postagem:Postagem})
                    }else{
                        req.flash("erro_msg",'Essa psotagem não existe')
                        res.redirect('/')
                    }
                }).catch((erro)=>{
                    req.flash('erro_msg','Ouve um erro interno')
                    res.redirect("/")
                })
        })
        //Porta404
        app.get('/404',(req,res) =>{
            res.send('erro 404!')
        })
        //rota listar as categorias
        app.get('/Categorias', (req,res)=>{
            Categorias.find().lean().then((Categorias)=>{
                res.render('Categorias/index',{Categorias:Categorias})
            }).catch((erro)=>{
                req.flash('erro_msg','Houve um erro  ao lista as categorias')
                res.redirect('/')
            })
        })
        //Rota para cada postagem da categoria 
        app.get('/Categorias/:slug', (req,res)=>{
            Categorias.findOne({slug: req.params.slug}).lean().then((Categorias)=>{
                if(Categorias){
                    Postagem.find({Categorias: Categorias._id}).lean().then((Postagem) =>{
                        res.render('Categorias/Postagens', {Postagens: Postagem,  Catgeorias: Categorias})
                    }).catch((erro)=>{
                        req.flash('erro_msg','Ouve um erro ao listar os posts')
                        res.redirect('/')
                    })
                }else{ 
                    req.flash('erro_msg','Essa categoria não existe')
                    res.redirect('/')
                }
            }).catch((erro)=>{
                req.flash('erro_msg','houve um erro interno ao recarregar a categoria')
                res.redirect("/")
            })
        })
     //Rota para usuarios
        app.use('/Usuario', Usuario)
    //Rortas
        app.use('/admin', admin)
    //porta de conexão
        const port = 8081
        app.listen(port, () =>{
    console.log('Servidor rodando')
    })
