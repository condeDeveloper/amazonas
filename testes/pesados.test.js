// Os casos caros: o 3x7 e o 4x5 inteiros (cerca de um minuto cada), a tabela
// cruzada do 4x4 e o juiz no 4x4.

import test from 'node:test'
import assert from 'node:assert/strict'

import { inicios, cruzada, conferencia } from '../js/medidas.js'

test('3x7: quem comeca ganha 416 dos 420 inicios', { timeout: 600000 }, () => {
  const l = inicios(3, 7)
  assert.equal(l.total, 420)
  assert.equal(l.ganha, 416)
  assert.equal(l.posicoes, 1718686)
  // As quatro excecoes: a branca no meio da borda curta, a preta uma ou duas
  // casas a frente dela, na mesma coluna. Duas posicoes e os espelhos delas.
  assert.deepEqual(l.perdem, [
    '.B./.P./.../.../.../.../...',
    '.B./.../.P./.../.../.../...',
    '.../.../.../.../.P./.../.B.',
    '.../.../.../.../.../.P./.B.'
  ])
})

test('4x5: quem comeca ganha 220 dos 380 inicios', { timeout: 600000 }, () => {
  const l = inicios(4, 5)
  assert.equal(l.total, 380)
  assert.equal(l.ganha, 220)
  assert.equal(l.posicoes, 2113638)
})

test('a tabela cruzada do 4x4: 40,30x juntas contra 36,41x do produto', { timeout: 600000 }, () => {
  const c = cruzada(4, 4).celulas
  assert.deepEqual(c, { 'nao/nao': 2287349, 'nao/sim': 373329, 'sim/nao': 384860, 'sim/sim': 56758 })
  const s = c['nao/nao'] / c['sim/nao']
  const o = c['nao/nao'] / c['nao/sim']
  assert.equal(s.toFixed(2), '5.94')
  assert.equal(o.toFixed(2), '6.13')
  assert.equal((c['nao/nao'] / c['sim/sim']).toFixed(2), '40.30')
  assert.equal((s * o).toFixed(2), '36.41')
})

test('o juiz nos 240 inicios do 4x4', { timeout: 900000 }, () => {
  const [l] = conferencia([[4, 4]])
  assert.equal(l.total, 240)
  assert.equal(l.divergencias, 0)
  assert.equal(l.controle, 96)
  assert.equal(l.posicoesDoJuiz, 4820496)
  // Contra as 56.758 da busca com as duas reducoes: 85 vezes mais.
  assert.equal(Math.round(l.posicoesDoJuiz / 56758), 85)
})
