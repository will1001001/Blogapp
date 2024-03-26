const express = require('express')
const router = express.Router()
const mongoose = require('mongoose')
require('../models/Categorias')
const Categorias = mongoose.model('Categorias')
require('../models/Postagens')
const Postagens = mongoose.model('Postagens')
    //Rota Principal
    router.get('/',(req, res) =>{
        res.render('admin/index')
    })
    //Rota para o post
    router.get('/post',(req, res) => {
        res.send('Rota para os posts')
    })
    //Rota categoria
    router.get('/categorias', (req, res) =>{
        Categorias.find().lean().sort({date:'desc'}).then((Categorias) =>{
            res.render('admin/categorias', {Categorias: Categorias})
        }).catch((err) =>{
            req.flash('erro_msg', 'Erro ao mostrar a alista ')
            res.redirect('/admin')
        })

    })
    router.get('/categorias/add', (req, res) =>{
        res.render('admin/addCategorias')
    })
    router.post('/Categorias/nova', (req, res) =>{
        //Verificação de autenticação 
        var erros = []

        if(!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null){
            erros.push({texto:"Nome invalido"})
        }
        if(!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null){
            erros.push({texto:"Slug invalido"})
        }
        if(req.body.nome.length < 2){
            erros.push({texto:"O nome da categoria e muito pequeno"})
        }
        if(erros.length > 0){
            res.render('admin/addCategorias',{erros: erros})
        }else{
            const novaCategoria = {
                nome: req.body.nome,
                slug: req.body.slug
            }
            new Categorias(novaCategoria).save().then(() =>{
                req.flash('success_msg', 'Categoria salva com sucesso')
                res.redirect('/admin/Categorias')
            }).catch((erro) =>{
                req.flash('error_msg', 'Erro ao salvar Categoria tente novamente')
                res.redirect('/admin')
            })
        }
    })
    //Rota para ediçao
    router.get('/Categorias/edit/:id', (req, res) =>{
        Categorias.findOne({_id:req.params.id}).lean().then((Categorias) =>{
            res.render('admin/editCategorias',{Categorias: Categorias})
        }).catch((erro) =>{
            req.flash('erro_msg','Esse id não existe')
            res.redirect('/admin/Categorias')
        })

    })
    //Categorias para edit
    router.post('/Categorias/edit', (req,res) =>{
        Categorias.findOne({_id: req.body.id}).then((Categorias) =>{
            Categorias.nome = req.body.nome
            Categorias.slug = req.body.slug

        Categorias.save().then(()=>{
                req.flash('success_msg','categoria editada com sucesso')
                res.redirect('/admin/Categorias')
            }).catch((erro) =>{
                req.flash('erro_msg','Ouve um erro ao salvar a edição da categoria')
                res.redirect('/admin/Categorias')
            })
        }).catch((erro) =>{
            req.flash('erro_msg', 'Ouve um erro en enditar a categoria')
            res.redirect('/admin/Categorias')
        })
    })

    router.post('/Categorias/deletar',(req,res) =>{
        Categorias.deleteOne({_id: req.body.id}).then(() =>{
            req.flash('success_msg', 'Categoria deletada com sucesso')
            res.redirect('/admin/Categorias')
        }).catch((erro) =>{
            req.flash('erro_msg', 'Erro ao deletar categoria')
        })
    })
    
    //Rota de postagens
    router.get('/postagens',(req,res) =>{
        Postagens.find().lean().populate('categoria').sort({date:'desc'}).then((Postagens) =>{
            res.render('admin/Postagens',{Postagens: Postagens})
        }).catch((erro) =>{
            req.flash('erro_msg','Houve um erro ao listar a postegem')
            res.redirect('/admin')
        })
        
    })

    router.get('/postagens/add',(req,res) =>{
         Categorias.find().lean().then((Categorias) =>{
            res.render('admin/addPostagens', {Categorias: Categorias})
         }).catch((erro) =>{
            req.flash('erro_msg','Ouve um erro ao criar a postagem')
            res.redirect('/admin')
         })
        
    })
    //Adicionando novas postagens
    router.post('/postagens/nova', (req,res) => {
        var erro = []

        if(req.body.categoria == 0){
            erro.push({text:'Categoria invalida, registre uma categoria'})
        }if(erro.length > 0){
            res.render('admin/addPostagens',{erro: erro})
        }else{
            const novaPostagem = {
                titulo: req.body.titulo,
                descricao: req.body.descricao,
                conteudo: req.body.conteudo,
                categoria: req.body.categoria,
                slug: req.body.slug
            }
            new Postagens(novaPostagem).save().then(() =>{
                req.flash('success_msg','Postagem criada com sucesso')
                res.redirect('/admin/postagens')
            }).catch((erro) =>{
                req.flash('erro_msg','Falha ao salvar postagem!')
                res.redirect('/admin/postagens')
            })
        }
    })
    //Rota para edição de postagens
    router.get('/postagens/edit/:id', (req,res) =>{
        Postagens.findOne({_id: req.params.id}).lean().then((Postagens) => {
            Categorias.find().lean().then((Categorias) =>{
                res.render('admin/editPostagens', {Categorias: Categorias, Postagens: Postagens})
        }).catch((erro) =>{
            req.flash('erro_msg','Houve um erro ao listar a categoria')
            res.redirect('/admin/postagens')
        })
            
        }).catch((erro) =>{
            req.flash('erro_msg','Erro ao editar a postegem')
            res.redirect('/admin/postagens')
        })
        
    })
    //Rota para salvar a edição
    router.post('/postagens/edit', (req,res) =>{
        Postagens.findOne({_id: req.body.id}).lean().then((Postagens) =>{
            Postagens.titulo = req.body.titulo
            Postagens.slug = req.body.slug
            Postagens.descricao = req.body.descricao
            Postagens.conteudo = req.body.conteudo

        }).catch((erro) =>{
            req.flash("erro_msg",'Houve um erro oa salvar a edição')
            res.redirect('/admin/postagens')
        })
    })
    //Rota para deletar 
    router.get('/postagens/deletar/:id', (req,res) => {
        Postagens.deleteOne({_id: req.params.id}).then(() =>{
            req.flash('success_msg','Postagem deletada com sucesso')
            res.redirect('/admin/postagens')
        }).catch((erro) =>{
            req.flash('erro_msg','Houve um erro para deletar a postagem')
            res.redirect('/admin/postagens')
        })
    })
    

module.exports = router
