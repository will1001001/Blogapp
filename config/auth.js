const localstrategy = require('passport-local').Strategy
const mongoose = require('mongoose')
const bcrypt = require("bcryptjs")
require('../models/Usuario')
const usuario = mongoose.model('usuarios')

//configurando o sistema de altenticação
module.exports = function(passport){
 passport.use(new localstrategy({usernameField: 'email', passwordField: 'senha'},
 (email, senha, done) =>{
    usuario.findOne({email: email}).lean().then((Usuario) =>{
        if(!Usuario){
            return done(null, false, {message:'Essa conta não existe'})
        }else{
            bcrypt.compare(senha, Usuario.senha,(erro, batem) =>{
                if(batem){
                    return done(null, Usuario)
                }else{
                    return done(null, false,{message: 'Senha incorreta'})
                }
            })
        }
    }).catch((erro) =>{
        return done(erro)
    })
 }))
//serve para salvar os dados do usuario numa sessão
 passport.serializeUser((usuario, done) =>{
    done(null, usuario.id)
 })
 //procura o usuario parte do id
 passport.deserializeUser((id, done) =>{
    usuario.findById(id,(erro, usuario)=>{
        done(erro, usuario)    
       }) 
   })
}


