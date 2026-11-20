// O 5x5 com as amazonas em quinas opostas. Sao mais de 11 milhoes de posicoes
// guardadas e alguns minutos: perto demais do teto de 2^24 do Map para rodar
// nos nove jobs da matriz. O CI roda este arquivo uma vez, no job das tabelas,
// com mais memoria para o node.

import test from 'node:test'
import assert from 'node:assert/strict'

import { quinas5 } from '../js/medidas.js'

test('5x5, quinas opostas: quem comeca ganha', { timeout: 1800000 }, () => {
  const r = quinas5()
  assert.equal(r.ganha, true)
  assert.equal(r.posicoes, 11401184)
})
