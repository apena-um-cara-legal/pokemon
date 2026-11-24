const LIMITE_BARALHO = 12
const URL_POKEAPI = 'https://pokeapi.co/api/v2/pokemon'
const URL_API = '/api/baralho'

const form = document.querySelector('#form-pokemon')
const feedback = document.querySelector('#feedback')
const listaCards = document.querySelector('#lista-cards')
const inputNome = document.querySelector('#nome')
const inputTipo = document.querySelector('#tipo')
const inputCp = document.querySelector('#cp')
const inputTreinador = document.querySelector('#treinador')

let pokemonsCadastrados = []

const ESTILOS_TIPO = {
    fire:     { borda: '#e25822', fundo: '#ffe3d6' },
    water:    { borda: '#2980d9', fundo: '#dcecff' },
    grass:    { borda: '#3a9d3a', fundo: '#e0f6dc' },
    electric: { borda: '#d4a800', fundo: '#fff7c2' },
    poison:   { borda: '#8e44ad', fundo: '#eddcf5' },
    normal:   { borda: '#7f8c8d', fundo: '#ececec' },
    ice:      { borda: '#3dbdc2', fundo: '#e0f9fb' },
    fighting: { borda: '#c0392b', fundo: '#fcdcd8' },
    ground:   { borda: '#cc8830', fundo: '#f8e9d4' },
    flying:   { borda: '#70a8da', fundo: '#e6f2ff' },
    psychic:  { borda: '#e84393', fundo: '#fde4f0' },
    bug:      { borda: '#83a123', fundo: '#f0f6d6' },
    rock:     { borda: '#a38c21', fundo: '#f4f0db' },
    ghost:    { borda: '#6c5ce7', fundo: '#e8e5fa' },
    dragon:   { borda: '#4834d4', fundo: '#e1dffd' },
    steel:    { borda: '#8a99a6', fundo: '#e3e8ec' },
    fairy:    { borda: '#e056fd', fundo: '#fbe2ff' },
    dark:     { borda: '#2d3436', fundo: '#dcdde1' }
}

function mostrarFeedback(mensagem, cor = 'red') {
    feedback.textContent = mensagem
    feedback.style.color = cor
}

// ---------- PokeAPI ----------
async function buscarDadosPokemon(nome) {
    const nomeFormatado = nome.toLowerCase().trim()

    try {
        const resposta = await fetch(`${URL_POKEAPI}/${nomeFormatado}`)
        if (!resposta.ok) {
            throw new Error('Pokemon não encontrado na PokeAPI')
        }
        feedback.textContent = ''
        return await resposta.json()
    }
    catch (error) {
        mostrarFeedback('❌ Pokemon não encontrado na PokeAPI.')
        console.log('Não foi possível carregar os dados do pokemon na PokeAPI', error)
        return null
    }
}

function extrairImagemPokemon(dadosPokemon) {
    if (!dadosPokemon) return null
    const artWorkOfficial = dadosPokemon.sprites?.other?.['official-artwork']?.front_default
    const spriteDefault = dadosPokemon.sprites?.front_default
    return artWorkOfficial || spriteDefault || null
}

function extrairTipoPokemon(dadosPokemon) {
    if (!dadosPokemon || !dadosPokemon.types) return null
    return dadosPokemon.types.map(item => item.type.name)
}

function extrairCombatPower(dadosPokemon) {
    if (!dadosPokemon || !dadosPokemon.base_experience) return null
    return dadosPokemon.base_experience
}

// ---------- Servidor (banco) ----------
function linhaParaPokemon(linha) {
    return {
        id: Number(linha.id_pokemon),
        nome: linha.nome,
        imagem: linha.imagem,
        tipo: [linha.tipo1, linha.tipo2].filter(Boolean),
        cp: Number(linha.cp),
        treinador: linha.treinador
    }
}

async function carregarBaralho() {
    try {
        const resposta = await fetch(URL_API)
        if (!resposta.ok) throw new Error('Falha ao carregar o baralho')
        const linhas = await resposta.json()
        pokemonsCadastrados = linhas.map(linhaParaPokemon)
        renderizarArena()
    }
    catch (erro) {
        console.log(erro)
        mostrarFeedback('❌ Não foi possível carregar o baralho salvo.')
    }
}

async function salvarNoServidor(pokemon) {
    const resposta = await fetch(URL_API, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(pokemon)
    })
    if (!resposta.ok) {
        const erro = await resposta.json().catch(() => ({}))
        throw new Error(erro.erro || 'Falha ao salvar')
    }
}

async function removerNoServidor(id) {
    const resposta = await fetch(`${URL_API}/${id}`, { method: 'DELETE' })
    if (!resposta.ok) throw new Error('Falha ao remover')
}

// ---------- Cards ----------
function aplicarEstiloPorTipo(card, tipos) {
    const lista = Array.isArray(tipos) ? tipos : [tipos]
    const estilo1 = ESTILOS_TIPO[lista[0]]
    const estilo2 = ESTILOS_TIPO[lista[1]]
    if (!estilo1) return

    card.style.borderColor = estilo1.borda

    // cor do tipo só como um tom suave por cima do fundo escuro (hex + "33" = ~20% de opacidade)
    if (estilo2) {
        card.style.backgroundImage = `linear-gradient(135deg, ${estilo1.borda}33 50%, ${estilo2.borda}33 50%)`
    } else {
        card.style.backgroundImage = `linear-gradient(135deg, ${estilo1.borda}33, ${estilo1.borda}11)`
    }
}

function criarCardPokemon(id, nome, imagem, tipo, combatPower, treinador, campeao = false) {
    const card = document.createElement('div')
    card.className = 'card-pokemon'
    card.id = id

    const img = document.createElement('img')
    img.className = 'card-pokemon-img'
    img.src = imagem || 'https://placehold.co/96x96?text=?'
    img.alt = nome

    const nomeCard = document.createElement('h3')
    nomeCard.className = 'card-pokemon-nome'
    nomeCard.textContent = campeao ? `👑 ${nome}` : nome

    const infoTipo = document.createElement('p')
    infoTipo.className = 'card-pokemon-info'
    const textoTipo = Array.isArray(tipo) ? tipo.join(', ') : tipo
    infoTipo.textContent = `Tipo: ${textoTipo || 'desconhecido'}`

    const cp = document.createElement('p')
    cp.className = 'card-pokemon-info'
    cp.textContent = `CP: ${combatPower || '000'}`

    const treinadorName = document.createElement('p')
    treinadorName.className = 'card-pokemon-info'
    treinadorName.textContent = `Treinador: ${treinador || 'Sem Treinador'}`

    const btnRemover = document.createElement('button')
    btnRemover.type = 'button'
    btnRemover.className = 'btn-remover'
    btnRemover.textContent = 'x'
    btnRemover.title = 'Remover'
    btnRemover.setAttribute('aria-label', `Remover ${nome}`)
    btnRemover.dataset.id = id

    card.append(btnRemover, img, nomeCard, infoTipo, cp, treinadorName)

    aplicarEstiloPorTipo(card, tipo)
    if (campeao) card.classList.add('campeao')
    listaCards.appendChild(card)
}

function renderizarArena() {
    listaCards.innerHTML = ''
    const ordenados = [...pokemonsCadastrados].sort((a, b) => (b.cp || 0) - (a.cp || 0))
    ordenados.forEach((p, i) =>
        criarCardPokemon(p.id, p.nome, p.imagem, p.tipo, p.cp, p.treinador, i === 0)
    )
}

// Botão para apagar o card
listaCards.addEventListener('click', async function (event) {
    const botao = event.target.closest('.btn-remover')
    if (!botao) return

    const id = Number(botao.dataset.id)
    try {
        await removerNoServidor(id)
        pokemonsCadastrados = pokemonsCadastrados.filter(p => p.id !== id)
        renderizarArena()
    }
    catch (erro) {
        console.log(erro)
        mostrarFeedback('❌ Não foi possível remover o pokémon.')
    }
})

// ---------- Formulário ----------
function limparCampos() {
    inputNome.value = ''
    inputTipo.value = ''
    inputCp.value = ''
    inputTreinador.value = ''
    feedback.textContent = ''
}

document.querySelector('#botaolimpar').addEventListener('click', limparCampos)

form.addEventListener('submit', async function (event) {
    event.preventDefault() // impede de recarregar a página

    const nome = inputNome.value.trim()
    const cp = Number(inputCp.value)
    const treinador = inputTreinador.value.trim()

    if (nome.length < 3) {
        return mostrarFeedback('❌ Nome deve conter ao menos 3 caracteres.')
    }
    if (!cp || cp < 100) {
        return mostrarFeedback('❌ O CP do pokemon precisa ser no mínimo 100.')
    }
    if (pokemonsCadastrados.length >= LIMITE_BARALHO) {
        return mostrarFeedback(`❌ O baralho já tem ${LIMITE_BARALHO} pokémons.`)
    }

    const dadosApi = await buscarDadosPokemon(nome)
    if (!dadosApi) return

    const id = dadosApi.id
    if (pokemonsCadastrados.some(p => p.id === id)) {
        return mostrarFeedback('❌ Esse pokemon já está na arena.')
    }

    const pokemon = {
        id,
        nome: dadosApi.name,
        imagem: extrairImagemPokemon(dadosApi) || 'https://placehold.co/96x96?text=?',
        tipo: extrairTipoPokemon(dadosApi) || [],
        cp,
        treinador
    }

    try {
        await salvarNoServidor(pokemon)
        pokemonsCadastrados.push(pokemon)
        renderizarArena()
        mostrarFeedback('✅ Pokemon cadastrado com sucesso.', 'green')
    }
    catch (erro) {
        console.log(erro)
        mostrarFeedback(`❌ ${erro.message}`)
    }
})

// ---------- Autocomplete ----------
let debounceBusca = null
let requisicaoAtual = 0

inputNome.addEventListener('input', function () {
    const valor = inputNome.value.trim()

    clearTimeout(debounceBusca)
    requisicaoAtual++

    if (valor.length < 3) {
        return mostrarFeedback('❌ Nome deve conter ao menos 3 caracteres.')
    }

    feedback.textContent = ''
    const idRequisicao = requisicaoAtual

    debounceBusca = setTimeout(async function () {
        const dadosApi = await buscarDadosPokemon(valor)

        if (idRequisicao !== requisicaoAtual) return
        if (!dadosApi) return

        inputNome.value = dadosApi.name || ''
        inputTipo.value = (extrairTipoPokemon(dadosApi) || []).join(', ')
        inputCp.value = extrairCombatPower(dadosApi) || ''
    }, 1000)
})

carregarBaralho()