// As tabelas do README. Cada tabuleiro e resolvido uma vez so e guardado.

import { grade, inicial, desenha, lances } from './nucleo.js'
import { Motor } from './busca.js'
import { Juiz, tabuleiro } from './juiz.js'

const cache = new Map()
function guardado (nome, f) {
  if (!cache.has(nome)) cache.set(nome, f())
  return cache.get(nome)
}

export const LEVES = [[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [2, 8], [3, 3], [3, 4], [3, 5], [3, 6], [4, 4]]
export const PESADOS = [[3, 7], [4, 5]]

// Uma amazona de cada lado, em todas as posicoes iniciais possiveis (pares
// ordenados de casas distintas), com as brancas na vez.
export function inicios (w, h) {
  return guardado(`ini${w}x${h}`, () => {
    const g = grade(w, h)
    const m = new Motor(g, { simetria: true, ordenacao: true })
    let total = 0
    let ganha = 0
    const perdem = []
    for (let a = 0; a < g.casas; a++) {
      for (let b = 0; b < g.casas; b++) {
        if (a === b) continue
        total++
        const pos = inicial(g, [a], [b])
        if (m.ganha(pos)) ganha++
        else perdem.push(desenha(g, pos))
      }
    }
    return { largura: w, altura: h, total, ganha, perde: total - ganha, posicoes: m.memo.size, perdem }
  })
}

export function tabela ({ pesados = false } = {}) {
  return (pesados ? [...LEVES, ...PESADOS] : LEVES).map(([w, h]) => inicios(w, h))
}

// A abertura mais carregada: quantos lances tem o primeiro jogador, no pior e
// no melhor lugar, num tabuleiro vazio com uma amazona de cada lado.
export function lancesNaAbertura (w, h) {
  return guardado(`ab${w}x${h}`, () => {
    const g = grade(w, h)
    let max = 0
    let min = Infinity
    for (let a = 0; a < g.casas; a++) {
      for (let b = 0; b < g.casas; b++) {
        if (a === b) continue
        const n = lances(g, inicial(g, [a], [b])).length
        max = Math.max(max, n)
        min = Math.min(min, n)
      }
    }
    return { largura: w, altura: h, min, max }
  })
}

// Tabela cruzada: simetria x ordenacao, posicoes guardadas varrendo todos os
// inicios de um tabuleiro. As quatro celulas, nunca duas medidas soltas.
export function cruzada (w, h) {
  return guardado(`cruz${w}x${h}`, () => {
    const g = grade(w, h)
    const celulas = {}
    for (const simetria of [false, true]) {
      for (const ordenacao of [false, true]) {
        const m = new Motor(g, { simetria, ordenacao })
        for (let a = 0; a < g.casas; a++) {
          for (let b = 0; b < g.casas; b++) if (a !== b) m.ganha(inicial(g, [a], [b]))
        }
        celulas[`${simetria ? 'sim' : 'nao'}/${ordenacao ? 'sim' : 'nao'}`] = m.nos
      }
    }
    return { largura: w, altura: h, celulas }
  })
}

// O juiz contra a busca, em todos os inicios. E o controle negativo: o mesmo
// juiz com as PRETAS comecando tem de discordar em algum lugar.
export const ALCANCE_DO_JUIZ = [[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4], [4, 4]]

export function conferencia (lista = ALCANCE_DO_JUIZ) {
  return lista.map(([w, h]) => guardado(`conf${w}x${h}`, () => {
    const g = grade(w, h)
    const m = new Motor(g, { simetria: true, ordenacao: true })
    const juiz = new Juiz()
    let total = 0
    let divergencias = 0
    let controle = 0
    for (let a = 0; a < g.casas; a++) {
      for (let b = 0; b < g.casas; b++) {
        if (a === b) continue
        total++
        const busca = m.ganha(inicial(g, [a], [b]))
        if (juiz.ganha(tabuleiro(w, h, [a], [b]), 'B') !== busca) divergencias++
        if (juiz.ganha(tabuleiro(w, h, [a], [b]), 'P') !== busca) controle++
      }
    }
    return { largura: w, altura: h, total, divergencias, controle, posicoesDoJuiz: juiz.memo.size }
  }))
}

// O 5x5, so com as amazonas em quinas opostas: mais de 11 milhoes de
// posicoes, perto do teto de 2^24 do Map. Roda uma vez so no CI.
export function quinas5 () {
  return guardado('q5', () => {
    const g = grade(5, 5)
    const m = new Motor(g, { simetria: true, ordenacao: true })
    const ganha = m.ganha(inicial(g, [0], [24]))
    return { ganha, posicoes: m.memo.size }
  })
}
