const mongoose = require('mongoose')
const Schema = mongoose.Schema

const Postagens = new Schema({
    titulo:{
        type: String,
        required: true
    },
    slug:{
        type: String,
        required: true
    },
    descricao:{
        type: String,
        required: true
    },
    conteudo:{
        type: String,
        required: true
    },
    categoria:{
        type:  Schema.Types.ObjectId,
        ref: 'Categorias',
        require: false
    },
    data:{
        type: Date,
        default: Date.now()
    }
})

mongoose.model('Postagens', Postagens)

