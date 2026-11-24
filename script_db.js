require('dotenv').config({ quiet: true })

const DATABASE_URL = process.env.DATABASE_URL
const host = new URL(DATABASE_URL).host
const neonHttpEndPoint = `https://${host}/sql`

const LIMITE_BARALHO = 12

async function executarQueryNeon(querySQL, parametros = []) {
    try {
        const resposta = await fetch(neonHttpEndPoint, {
            method: 'POST',
            headers: {
                'Neon-Connection-String': DATABASE_URL,
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                query: querySQL,
                params: parametros
            })
        })

        if (!resposta.ok) {
            const erroTexto = await resposta.text()
            throw new Error(`Erro HTTP ${resposta.status}: ${erroTexto}`)
        }

        const dados = await resposta.json()
        return dados.rows
    }
    catch (erro) {
        console.log('Falha ao comunicar com o banco de dados', erro)
        return null
    }
}

// cadastrar pokemon (retorna [] se o id já existia)
async function salvarPokemonBaralho(idPokemon, nome, imagem, cp, treinador, tipo1, tipo2) {
    return executarQueryNeon(
        `INSERT INTO baralho (id_pokemon, nome, imagem, cp, treinador, tipo1, tipo2)
         VALUES ($1, $2, $3, $4, $5, $6, $7)
         ON CONFLICT (id_pokemon) DO NOTHING
         RETURNING *`,
        [idPokemon, nome, imagem, cp, treinador, tipo1, tipo2]
    )
}

// consultar baralho
async function listarBaralho() {
    return executarQueryNeon('SELECT * FROM baralho ORDER BY id_pokemon')
}

// contar baralho
async function contarBaralho() {
    const linhas = await executarQueryNeon('SELECT COUNT(*)::INT AS total FROM baralho')
    if (linhas === null) return null
    return Number(linhas[0].total)
}

// deletar pokemon
async function deletarPokemon(idPokemon) {
    return executarQueryNeon(
        'DELETE FROM baralho WHERE id_pokemon = $1 RETURNING *',
        [idPokemon]
    )
}

module.exports = {
    LIMITE_BARALHO,
    listarBaralho,
    contarBaralho,
    salvarPokemonBaralho,
    deletarPokemon
}