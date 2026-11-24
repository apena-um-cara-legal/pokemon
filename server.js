const http = require('http')
const fs = require('fs')
const path = require('path')

const {
    LIMITE_BARALHO,
    listarBaralho,
    contarBaralho,
    salvarPokemonBaralho,
    deletarPokemon
} = require('./script_db.js')

const PORTA = process.env.PORT || 3002

const arquivos = {
    '/': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/index.html': { arquivo: 'index.html', tipo: 'text/html; charset=utf-8' },
    '/style.css': { arquivo: 'style.css', tipo: 'text/css; charset=utf-8' },
    '/script.js': { arquivo: 'script.js', tipo: 'text/javascript; charset=utf-8' }
}

function responderJSON(res, status, dados) {
    res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8' })
    res.end(JSON.stringify(dados))
}

function lerCorpo(req) {
    return new Promise((resolve, reject) => {
        let corpo = ''
        req.on('data', pedaco => corpo += pedaco)
        req.on('end', () => {
            try { resolve(JSON.parse(corpo || '{}')) }
            catch (erro) { reject(erro) }
        })
        req.on('error', reject)
    })
}

const servidor = http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url, 'http://localhost')

    // GET /api/baralho -> listar os pokemons salvos
    if (pathname === '/api/baralho' && req.method === 'GET') {
        const linhas = await listarBaralho()
        if (linhas === null) return responderJSON(res, 500, { erro: 'Falha ao consultar o banco de dados' })
        return responderJSON(res, 200, linhas)
    }

    // POST /api/baralho -> salvar um pokemon
    if (pathname === '/api/baralho' && req.method === 'POST') {
        let p
        try { p = await lerCorpo(req) }
        catch { return responderJSON(res, 400, { erro: 'JSON inválido' }) }

        const tipos = Array.isArray(p.tipo) ? p.tipo : []
        if (!p.id || !p.nome || !p.treinador || !p.cp || !tipos[0]) {
            return responderJSON(res, 400, { erro: 'Dados incompletos' })
        }

        const total = await contarBaralho()
        if (total === null) return responderJSON(res, 500, { erro: 'Falha ao consultar o banco de dados' })
        if (total >= LIMITE_BARALHO) {
            return responderJSON(res, 409, { erro: `O baralho já tem ${LIMITE_BARALHO} pokémons` })
        }

        const salvo = await salvarPokemonBaralho(
            Number(p.id), p.nome, p.imagem || '', Number(p.cp), p.treinador, tipos[0], tipos[1] || null
        )
        if (salvo === null) return responderJSON(res, 500, { erro: 'Falha ao salvar no banco de dados' })
        if (salvo.length === 0) return responderJSON(res, 409, { erro: 'Esse pokémon já está no baralho' })
        return responderJSON(res, 201, salvo[0])
    }

    // DELETE /api/baralho/:id -> remover um pokemon
    const matchDelete = pathname.match(/^\/api\/baralho\/(\d+)$/)
    if (matchDelete && req.method === 'DELETE') {
        const removido = await deletarPokemon(Number(matchDelete[1]))
        if (removido === null) return responderJSON(res, 500, { erro: 'Falha ao remover do banco de dados' })
        if (removido.length === 0) return responderJSON(res, 404, { erro: 'Pokémon não encontrado' })
        return responderJSON(res, 200, removido[0])
    }

    // arquivos da página
    const rota = arquivos[pathname]
    if (rota) {
        res.writeHead(200, { 'Content-Type': rota.tipo })
        return fs.createReadStream(path.join(__dirname, rota.arquivo)).pipe(res)
    }

    res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' })
    res.end('Página não encontrada')
})

servidor.listen(PORTA, () => {
    console.log(`Arena Pokemon em http://localhost:${PORTA}`)
})