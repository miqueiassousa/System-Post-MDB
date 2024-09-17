const express = require("express")
const router = express.Router()
const mongoose = require("mongoose")
require("../models/Categorias")
const Categoria = mongoose.model("categorias")
require("../models/Postagem")
const Postagem = mongoose.model("postagens")
const {eAdmin} = require("../helpers/eAdmin") // Pegar apenas o eAdmin


router.get('/', eAdmin,  (req, res) => {
    res.render("admin/index")
})

router.post('/posts', eAdmin, (req, res) => {
    res.render("admin/index")
})

// router.get('/categorias',  (req,res) => {
//     Categoria.findAll().then((categorias) => {
//         res.render("admin/categorias", {categorias: categorias})
//     }).catch((err) => {
//         req.flash("erro_msg", "Houve um problema ao listar as categorias")
//         res.redirect("/admin")
//     })

// })

/**
 *  As consultas do Mongoose retornam um Mongoose Document e eles são muito pesados para o JS. 
 * O método .lean() resolve esse problema retornando um objeto simples.
 */
router.get('/categorias', eAdmin,  (req, res) => {
    Categoria
        .find()
        .sort({ date: 'desc' })
        .lean()
        .then((categorias) => {
            res.render('admin/categorias', { categorias })
        })
        .catch((err) => {
            req.flash('error_msg', 'Houve um problema ao listar as categorias');
            res.redirect('/admin');
            console.error(err);
        });
});

router.get('/categorias/add', eAdmin, (req, res) => {
    res.render("admin/addcategorias")
})

router.post('/categorias/nova', eAdmin, (req, res) => {

    var erros = []

    if (!req.body.nome || typeof req.body.nome == undefined || req.body.nome == null) {
        erros.push({ texto: "Nome inválido" })
    }

    if (!req.body.slug || typeof req.body.slug == undefined || req.body.slug == null) {
        erros.push({ texto: "Slug inválido" })
    }

    if (req.body.nome.length < 2) {
        erros.push({ texto: "Nome da categoria é muito pequeno" })
    }

    if (erros.length > 0) {
        res.render("admin/addcategorias", { erros: erros })
    } else {
        const novaCategoria = {
            nome: req.body.nome,
            slug: req.body.slug
        }

        new Categoria(novaCategoria).save().then(() => {
            req.flash("success_msg", "Categoria criada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao salvar a categoria, tente novamente!")
            res.redirect("/admin")
        })
    }
})

// PEGAR DADOS DA CATEGORIA PRA EDITAR
router.get("/categorias/edit/:id", eAdmin,  (req, res) => {
    Categoria.findOne({ _id: req.params.id }).lean().then((categoria) => {
        res.render('admin/editcategorias', { categoria: categoria })
    }).catch((erro) => {
        req.flash("Error_msg", "Esta categoria não existe")
        res.redirect("/admin/categorias");
    })

})

// EDITA CATEGORIA
router.post("/categorias/edit", eAdmin,  (req, res) => {
    Categoria.findOne({ _id: req.body.id }).then((categoria) => {

        categoria.nome = req.body.nome
        categoria.slug = req.body.slug

        categoria.save().then(() => {
            req.flash("success_msg", "Categoria editada com sucesso")
            res.redirect("/admin/categorias")
        }).catch((erro) => {
            req.flash("erro_msg", "houve um erro ao salvar a categoria")
            res.redirect("/admin/categorias");
        })
    }).catch((erro) => {
        req.flash("erro_msg", "houve um erro ao editar a categoria")
        res.redirect("/admin/categorias");
    })
})

// DELETAR CATEGORIA
router.post("/categorias/deletar", eAdmin,  (req, res) => {
    Categoria.findOne({ _id: req.body.id }).lean().then((categoria) => {
        let nome = categoria.nome
        Categoria.deleteOne({ _id: req.body.id }).then(() => {
            req.flash("success_msg", "Categoria: " + nome + " deletada com sucesso!")
            res.redirect("/admin/categorias")
        }).catch((erro) => {
            req.flash("error_msg", "Houve um erro ao deletar a categoria")
            res.redirect("/admin/categorias")
        })
    })
})

router.get("/postagens", eAdmin,  (req, res) => {

    Postagem.find().populate("categoria").sort({ data: "desc" }).lean().then((postagens) => {
        res.render("admin/postagens", { postagens: postagens })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao listar as postagens")
        res.redirect("/admin")
    })


})

router.get("/postagens/add", eAdmin,  (req, res) => {
    Categoria.find().lean().then((categorias) => {
        res.render("admin/addpostagens", { categorias: categorias })
    }).catch(() => {
        res.flash("error_msg", "Houve um erro ao carregar o formulario")
        res.redirect("/admin")
    })
})

router.post("/postagens/nova", eAdmin, (req, res) => {

    const erros = []

    if (req.body.categoria == "0") {
        erros.push({ texto: "Categoria inválida, registre um categoria" })
    }
    if (erros.length > 0) {
        res.render("admin/addpostagem", { erros: erros })
    } else {
    }
    const novaPostagem = {
        titulo: req.body.titulo,
        descricao: req.body.descricao,
        conteudo: req.body.conteudo,
        categoria: req.body.categoria,
        slug: req.body.slug

    }
    new Postagem(novaPostagem).save().then(() => {
        req.flash("success_msg", "Postagem criada com sucesso!")
        res.redirect("/admin/postagens")
    }).catch((erro) => {
        req.flash("erro_msg", "Houve um erro durante o salvamento")
        res.redirect("/admin/postagens")
    })

})

router.get("/postagens/edit/:id", eAdmin,  (req, res) => {

    Postagem.findOne({ _id: req.params.id }).lean().then((postagem) => {
        Categoria.find().lean().then((categorias) => {
            res.render("admin/editpostagens", { categorias: categorias, postagem: postagem })
        }).catch((err) => {
            req.flash("error_msg", "Houve um erro ao listar as categorias")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        req.flash("error_msg", "Houve um erro ao carregar o formulário de edição")
        res.redirect("/admin/postagens")
    })
})


router.post("/postagem/edit", eAdmin,  (req, res) => {
    
    Postagem.findOne({ _id: req.body.id }).then((postagem) => {
    
        postagem.titulo = req.body.titulo
        postagem.slug = req.body.slug
        postagem.descricao = req.body.descricao
        postagem.conteudo = req.body.conteudo
        postagem.categoria = req.body.categoria

        postagem.save().then(() => {
            req.flash("success_msg", "Postagem editada com sucesso!")
            res.redirect("/admin/postagens")
        }).catch((err) => {
            req.flash("error_msg", "Erro interno")
            res.redirect("/admin/postagens")
        })
    }).catch((err) => {
        console.log(err)
        req.flash("error_msg", "Houve um erro ao salvar a edição") 
        res.redirect("/admin/postagens")
    })
    
})

router.get("/postagens/deletar/:id", eAdmin,  (req,res) => {
    Postagem.deleteOne({_id:req.params.id}).then(()=>{
        req.flash("success_msg", "postagem deletada com sucesso")
        res.redirect("/admin/postagens")
    }).catch((err)=>{
        req.flash("error_msg", "Houve uma falha")
        res.redirect("/admin/postagens")
    })
})
 

module.exports = router