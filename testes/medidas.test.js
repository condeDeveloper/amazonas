// Os numeros do README, presos.

import test from 'node:test'
import assert from 'node:assert/strict'

import { tabela, lancesNaAbertura, cruzada, conferencia } from '../js/medidas.js'

const em = (lista, w, h) => lista.find((l) => l.largura === w && l.altura === h)

test('todos os inicios dos tabuleiros leves: quantos quem comeca ganha', () => {
  const resumo = Object.fromEntries(tabela().map((l) => [`${l.largura}x${l.altura}`, [l.total, l.ganha]]))
  assert.deepEqual(resumo, {
    '2x2': [12, 0], '2x3': [30, 28], '2x4': [56, 28], '2x5': [90, 80], '2x6': [132, 104],
    '2x7': [182, 144], '2x8': [240, 192],
    '3x3': [72, 72], '3x4': [132, 92], '3x5': [210, 210], '3x6': [306, 162],
    '4x4': [240, 180]
  })
})

test('no 3x3 e no 3x5 quem comeca ganha de qualquer inicio', () => {
  assert.equal(em(tabela(), 3, 3).perde, 0)
  assert.equal(em(tabela(), 3, 5).perde, 0)
  // E nas faixas de 3 linhas pares nao: no 3x4 e no 3x6 ha muito inicio perdido.
  assert.equal(em(tabela(), 3, 4).perde, 40)
  assert.equal(em(tabela(), 3, 6).perde, 144)
})

test('no 2x2 quem comeca perde de qualquer inicio', () => {
  const l = em(tabela(), 2, 2)
  assert.equal(l.ganha, 0)
  assert.equal(l.perdem.length, 12)
})

test('no 2x4 quem comeca ganha exatamente metade dos inicios', () => {
  const l = em(tabela(), 2, 4)
  assert.equal(l.ganha * 2, l.total)
})

test('no 2x3 so dois inicios perdem: as duas lado a lado na linha do meio', () => {
  assert.deepEqual(em(tabela(), 2, 3).perdem, ['../BP/..', '../PB/..'])
})

test('as posicoes guardadas', () => {
  const t = tabela()
  assert.equal(em(t, 3, 5).posicoes, 41150)
  assert.equal(em(t, 4, 4).posicoes, 56758)
  assert.equal(em(t, 3, 6).posicoes, 335637)
})

test('a primeira jogada tem ate 98 lances no 4x4', () => {
  assert.deepEqual(lancesNaAbertura(3, 3), { largura: 3, altura: 3, min: 16, max: 37 })
  assert.deepEqual(lancesNaAbertura(4, 4), { largura: 4, altura: 4, min: 44, max: 98 })
  assert.deepEqual(lancesNaAbertura(3, 6), { largura: 3, altura: 6, min: 30, max: 109 })
})

test('tabela cruzada no 3x4 e no 3x5: as duas reducoes juntas rendem mais que o produto', () => {
  for (const [w, h, cel, juntas, produto] of [
    [3, 4, { 'nao/nao': 67540, 'nao/sim': 20766, 'sim/nao': 23474, 'sim/sim': 5446 }, '12.40', '9.36'],
    [3, 5, { 'nao/nao': 811571, 'nao/sim': 130077, 'sim/nao': 287333, 'sim/sim': 41150 }, '19.72', '17.62']
  ]) {
    const c = cruzada(w, h).celulas
    assert.deepEqual(c, cel)
    const s = c['nao/nao'] / c['sim/nao']
    const o = c['nao/nao'] / c['nao/sim']
    const j = c['nao/nao'] / c['sim/sim']
    assert.equal(j.toFixed(2), juntas)
    assert.equal((s * o).toFixed(2), produto)
    assert.ok(j > s * o)
  }
})

test('o juiz concorda em todos os inicios ate o 3x4, e o controle discorda', () => {
  const c = conferencia([[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4]])
  for (const l of c) assert.equal(l.divergencias, 0, `${l.largura}x${l.altura}`)
  const ctl = Object.fromEntries(c.map((l) => [`${l.largura}x${l.altura}`, l.controle]))
  assert.deepEqual(ctl, { '2x2': 0, '2x3': 0, '2x4': 32, '2x5': 16, '2x6': 48, '3x3': 0, '3x4': 52 })
  assert.equal(em(c, 3, 4).posicoesDoJuiz, 147404)
})
