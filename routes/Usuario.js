const Express = require('express')
const Router = Express.Router()
const Mongoose = require('mongoose')
require('../models/Usuario')
const Usuario = Mongoose.model('usuarios')
const bcrypt = require('bcryptjs')
const  passport = require('passport')

Router.get('/registro', (req,res)=>{
    res.render('Usuario/registro')
})
Router.post('/registro', (req,res) =>{
    var erro = []
    if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
        erro.push({texto: 'Nome invalido'})
    }
    if(!req.body.email || typeof req.body.email == undefined || req.body.email == null){
        erro.push({texto: 'Email invalido'})
    }
    if(!req.body.senha || typeof req.body.senha == undefined || req.body.senha == null){
        erro.push({texto: 'Senha invalido'})
    }
    if(req.body.senha.length < 4){
        erro.push({texto: 'Senha muito curta'})
    }
    //Para verificar se a senhas são iguais
    if(req.body.senha != req.body.senha2){
        erro.push({texto: 'Erro senhas diferentes tente novamentes'})
    }
    if(erro.length > 0){
        res.render('Usuario/registro', {erro: erro})


    }else{
        //verificção se o email do usuario ja não existe no banco
        Usuario.findOne({email: req.body.email}).lean().then((usuarioEncontrado) =>{
            if(usuarioEncontrado){
                req.flash('erro_msg','Ja existe uma conta no sistema')
                res.redirect('/Usuario/registro')
            }else{
                const novoUsuario = new Usuario({
                    nome: req.body.nome,
                    email: req.body.email,
                    senha: req.body.senha
                })
                bcrypt.genSalt(10,(erro,salt) =>{
                    bcrypt.hash(novoUsuario.senha, salt, (erro, hash) =>{
                       if(erro){
                        req.flash('erro_msg','Ouve um erro durante o salvamento')
                        res.redirect('/')
                       }
                       novoUsuario.senha = hash

                       novoUsuario.save().then(() =>{
                        req.flash("success_msg",'Usuario salvo com sucesso')
                        res.redirect('/')
                    }).catch((erro) =>{
                        req.flash('erro_msg',`Erro ao salvar o usuario ${erro}`)
                        res.redirect('Usuario/registro')
                    })
                    })
                })
            }
        }).catch((erro) =>{
            req.flash('erro_msg',`Ouve um erro interno ${erro}`)
            res.redirect('/Usuario/registro')
        })
    }
})

//Rota para login
Router.get('/login', (req,res) =>{
     res.render('Usuario/login')       
})

Router.post('/login', (req, res, next) => {
    const {email, senha} = req.body

    passport.authenticate("local", {
        successRedirect:'/',
        failureRedirect:'/Usuario/login',
        failureFlash: true
    })(req, res, next)
})


module.exports = Router
