CREATE TABLE IF NOT EXISTS baralho (
  id_pokemon INT PRIMARY KEY NOT NULL,
  nome       VARCHAR(50) NOT NULL,
  imagem     TEXT NOT NULL,
  cp         INT NOT NULL,
  treinador  VARCHAR(50) NOT NULL,
  tipo1      VARCHAR(20) NOT NULL,
  tipo2      VARCHAR(20)
);

-- Listar o baralho salvo e ordenar pelo ID
SELECT * FROM baralho ORDER BY id_pokemon;

-- Conta quantos pokemons estão no baralho
SELECT COUNT(*)::INT AS total FROM baralho;