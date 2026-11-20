#!/usr/bin/env node
// O medidor. Roda as tabelas e cospe os numeros que vao para o README.
//
//   node ferramentas/medidor.js              todas as leves
//   node ferramentas/medidor.js inicios      todos os inicios, tabuleiros leves
//   node ferramentas/medidor.js pesados      3x7 e 4x5 (cerca de um minuto cada)
//   node ferramentas/medidor.js abertura     quantos lances tem a primeira jogada
//   node ferramentas/medidor.js cruzada      simetria x ordenacao (3x4 e 3x5)
//   node ferramentas/medidor.js cruzada4     a mesma tabela no 4x4 (dezenas de segundos)
//   node ferramentas/medidor.js juiz         o juiz sem reducoes, ate o 3x4
//   node ferramentas/medidor.js juiz4        o juiz no 4x4 (minutos)

import { tabela, inicios, PESADOS, lancesNaAbertura, cruzada, conferencia } from '../js/medidas.js'

const n = (x) => x.toLocaleString('pt-BR')
const pad = (s, w) => String(s).padStart(w)

function linha (l) {
  const pct = (l.ganha / l.total * 100).toFixed(1).replace('.', ',')
  return `   ${pad(`${l.largura}x${l.altura}`, 4)}  ${pad(l.total, 4)} inicios   quem comeca ganha ${pad(l.ganha, 4)} (${pad(pct, 5)}%)   perde ${pad(l.perde, 4)}   ${pad(n(l.posicoes), 10)} posicoes`
}

function tabelaInicios () {
  console.log('\n== uma amazona de cada lado, todos os inicios, brancas na vez ==')
  for (const l of tabela()) console.log(linha(l))
}

function tabelaPesados () {
  console.log('\n== os pesados ==')
  for (const [w, h] of PESADOS) {
    const t = Date.now()
    const l = inicios(w, h)
    console.log(`${linha(l)}   ${((Date.now() - t) / 1000).toFixed(0)} s`)
    if (l.perde <= 8) for (const d of l.perdem) console.log(`        quem comeca perde: ${d}`)
  }
}

function tabelaAbertura () {
  console.log('\n== lances da primeira jogada (amazona anda + flecha) ==')
  for (const [w, h] of [[3, 3], [3, 5], [4, 4], [3, 6]]) {
    const l = lancesNaAbertura(w, h)
    console.log(`   ${w}x${h}  de ${l.min} a ${l.max} lances, conforme onde as duas estao`)
  }
}

function imprimeCruzada (w, h) {
  const r = cruzada(w, h)
  const c = r.celulas
  const base = c['nao/nao']
  const s = base / c['sim/nao']
  const o = base / c['nao/sim']
  const j = base / c['sim/sim']
  console.log(`\n   ${w}x${h} (posicoes abertas varrendo todos os inicios)`)
  console.log(`     nenhuma          : ${pad(n(base), 10)}`)
  console.log(`     so simetria      : ${pad(n(c['sim/nao']), 10)}   ${s.toFixed(2)}x`)
  console.log(`     so ordenacao     : ${pad(n(c['nao/sim']), 10)}   ${o.toFixed(2)}x`)
  console.log(`     as duas          : ${pad(n(c['sim/sim']), 10)}   ${j.toFixed(2)}x   (produto das separadas: ${(s * o).toFixed(2)}x)`)
}

function tabelaCruzada () {
  console.log('\n== tabela cruzada: simetria x ordenacao ==')
  imprimeCruzada(3, 4)
  imprimeCruzada(3, 5)
}

function tabelaCruzada4 () {
  console.log('\n== tabela cruzada no 4x4 ==')
  imprimeCruzada(4, 4)
}

function imprimeJuiz (lista) {
  for (const l of conferencia(lista)) {
    console.log(`   ${l.largura}x${l.altura}  ${pad(l.total, 4)} inicios   divergencias ${l.divergencias}   controle (pretas comecando): ${pad(l.controle, 3)} diferentes   ${pad(n(l.posicoesDoJuiz), 10)} posicoes do juiz`)
  }
}

function tabelaJuiz () {
  console.log('\n== o juiz (matriz de letras, sem simetria nem ordenacao) contra a busca ==')
  imprimeJuiz([[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [3, 3], [3, 4]])
}

function tabelaJuiz4 () {
  console.log('\n== o juiz no 4x4 ==')
  imprimeJuiz([[4, 4]])
}

const partes = {
  inicios: tabelaInicios,
  pesados: tabelaPesados,
  abertura: tabelaAbertura,
  cruzada: tabelaCruzada,
  cruzada4: tabelaCruzada4,
  juiz: tabelaJuiz,
  juiz4: tabelaJuiz4
}
const caras = new Set(['pesados', 'cruzada4', 'juiz4'])

const pedido = process.argv[2]
if (!pedido) {
  for (const [nome, f] of Object.entries(partes)) if (!caras.has(nome)) f()
} else if (partes[pedido]) {
  partes[pedido]()
} else {
  console.error(`nao conheco "${pedido}". conheco: ${Object.keys(partes).join(', ')}`)
  process.exit(1)
}
