// As regras, a busca e o juiz em casos pequenos.

import test from 'node:test'
import assert from 'node:assert/strict'

import { grade, alcance, lances, temLance, aplica, chave, inicial, simetrias, permutaPos, desenha, ocupacao } from '../js/nucleo.js'
import { Motor } from '../js/busca.js'
import { Juiz, tabuleiro } from '../js/juiz.js'

test('cada casa tem 8 raios, e a soma dos raios do 3x3 e 56 casas', () => {
  const g = grade(3, 3)
  assert.equal(g.raios.length, 9)
  // Do centro alcanca as 8 vizinhas; de uma quina, 2+2+2 = 6; do meio de uma
  // borda tambem 6 (1+1 de lado, 2 para a frente, 1+1 nas diagonais).
  assert.equal(g.raios[4].flat().length, 8)
  assert.equal(g.raios[0].flat().length, 6)
  assert.equal(g.raios[1].flat().length, 6)
  assert.equal(g.raios.reduce((s, r) => s + r.flat().length, 0), 4 * 6 + 4 * 6 + 8)
})

test('a grade recusa o que nao cabe em 31 bits', () => {
  assert.throws(() => grade(6, 6))
})

test('a amazona para antes do primeiro obstaculo', () => {
  const g = grade(4, 1)
  assert.deepEqual(alcance(g, 0, 1 << 2), [1])
  assert.deepEqual(alcance(g, 0, 0).sort(), [1, 2, 3])
})

test('a flecha pode voltar para a casa de onde a amazona saiu', () => {
  const g = grade(2, 1)
  const pos = inicial(g, [0], [])
  const l = lances(g, pos)
  assert.deepEqual(l, [{ de: 0, para: 1, flecha: 0 }])
})

test('o 2x2 com uma amazona de cada lado: as quinas opostas', () => {
  const g = grade(2, 2)
  const pos = inicial(g, [0], [3])
  // Ela anda para 1 ou 2 e atira em uma das duas livres.
  assert.equal(lances(g, pos).length, 4)
})

test('temLance concorda com a lista de lances', () => {
  const g = grade(3, 3)
  const presa = { flechas: 0b000011010, eu: [0], outro: [8] }
  assert.equal(temLance(g, presa), lances(g, presa).length > 0)
  assert.equal(temLance(g, presa), false)
  assert.equal(temLance(g, inicial(g, [0], [8])), true)
})

test('aplicar troca os papeis e poe a flecha', () => {
  const g = grade(3, 3)
  const depois = aplica(inicial(g, [0], [8]), { de: 0, para: 4, flecha: 2 })
  assert.deepEqual(depois, { flechas: 1 << 2, eu: [8], outro: [4] })
  assert.equal(ocupacao(depois), (1 << 2) | (1 << 8) | (1 << 4))
})

test('a chave separa quem esta na vez', () => {
  const g = grade(3, 3)
  assert.notEqual(chave(g, inicial(g, [0], [8])), chave(g, inicial(g, [8], [0])))
})

test('o quadrado tem 8 simetrias e o retangulo 4', () => {
  assert.equal(simetrias(grade(3, 3)).length, 8)
  assert.equal(simetrias(grade(3, 4)).length, 4)
  for (const p of simetrias(grade(4, 4))) assert.equal(new Set(p).size, 16)
})

test('permutar pela identidade nao muda nada', () => {
  const g = grade(3, 3)
  const pos = { flechas: 0b101, eu: [4], outro: [8] }
  assert.deepEqual(permutaPos(simetrias(g)[0], pos), pos)
})

test('desenha por linhas', () => {
  const g = grade(3, 3)
  assert.equal(desenha(g, { flechas: 1 << 4, eu: [0], outro: [8] }), 'B../.#./..P')
})

test('sem lance, perde', () => {
  const g = grade(3, 3)
  const presa = { flechas: 0b000011010, eu: [0], outro: [8] }
  assert.equal(new Motor(g).ganha(presa), false)
})

test('a simetria nao muda a resposta, so o trabalho', () => {
  const g = grade(3, 4)
  const a = new Motor(g, { simetria: true })
  const b = new Motor(g, { simetria: false })
  for (const [x, y] of [[0, 11], [1, 10], [5, 6], [0, 1]]) {
    assert.equal(a.ganha(inicial(g, [x], [y])), b.ganha(inicial(g, [x], [y])))
  }
})

test('os lances que ganham sao lances que ganham', () => {
  const g = grade(3, 3)
  const m = new Motor(g)
  const pos = inicial(g, [0], [8])
  const boas = m.lancesQueGanham(pos)
  assert.ok(boas.length > 0)
  for (const j of boas) assert.equal(m.ganha(aplica(pos, j)), false)
})

test('o juiz: no 3x3 quem comeca ganha das quinas opostas', () => {
  assert.equal(new Juiz().ganha(tabuleiro(3, 3, [0], [8]), 'B'), true)
})

test('o juiz monta o tabuleiro', () => {
  assert.deepEqual(tabuleiro(2, 2, [0], [3]), [['B', '.'], ['.', 'P']])
})
