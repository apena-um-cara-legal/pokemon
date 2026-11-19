const http = require('http')
const fs = require('fs')
const path = require('path')

const {
    LIMITE_BARALHO,
    listarBaralho,
    contarBaralho,
    salvarPokemonBaralho
} = require('./script_db.js')
const { promises } = require('dns')
const { rejects } = require('assert')


const PORTA = process.env.PORT || 3002

const arquivos = {
    '/':{arquivo: 'index.html', tipo: 'text/html; charset=utf-8'},
    '/index.html':{arquivo: 'index.html', tipo: 'text/html; charset=utf-8'},
    '/style.css':{arquivo: 'style.css', tipo: 'text/css; charset=utf-8'},
    '/script.js':{arquivo: 'script.js', tipo: 'text/javascript; charset=utf-8'},

}

function responderJSON(res, status, dados){
    res.writeHead(status, {'Content-Type':'aplication/json; charset=utf-8'})
    res.end(JSON.stringify(dados))
}

function lerCorpo(req){
    return new Promise((resolve,reject)=>{
        let corpo =''
        req.on('data',pedaco => corpo+=pedaco)
        req.on('end',()=>{
            try{resolve(JSON.parse(corpo||'{}'))}
            catch(erro){reject(erro)}
        })
    })

}

const servidor = http.createServer(async (req,res) =>{
    //GET /api/baralho -> listar os pokemons salvos
    if(req.url==='api/baralho' && req.method === 'GET')
    {
        const linhas = await listarBaralho()
        if(linhas === null) return responderJSON(res,500,{erro:'Falha ao consultar o banco de dados'})
        return responderJSON(res, 200, linhas)
    }

    // arquivos da pagina
    const rota = arquivos[req.url]
    if(rota)
    {
        req.writeHead(200, {'Content-Type':rota.tipo})
        return fs.createReadStream(path.join(__dirname, rota.arquivo)).pipe(res)
    }
    res.writeHead(404,{'Content-Type':'text/plain; charset=utf-8'})
    res.end('Pagina não encontrada')

    // temporário
    servidor.listen(PORTA,()=> {
        console.log(`Arena Pokemon em http://localhost:${PORTA}`)
    })
})