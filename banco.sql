CREATE TABLE IF NOT EXISTS baralho (
  id INT PRIMARY KEY NOT NULL,
  nome VARCHAR(50) NOT NULL,
  img TEXT NOT NULL,
  cp INT NOT NULL,
  treinador VARCHAR(50) NOT NULL
)

-- Listar o baralho salvo e ordenar pelo ID

-- Conta quantos pokemons estão no baralho
SELECT COUNT(*):: INT AS total FROM baralho