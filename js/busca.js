// Quem ganha: busca com memoria, que para no primeiro lance vencedor.
//
// Duas reducoes opcionais, medidas uma contra a outra numa tabela cruzada:
//   simetria:  guardar a posicao pela menor chave entre as imagens dela
//   ordenacao: tentar primeiro os lances que deixam o outro com menos lances
//
// Nas Amazonas o lance tem duas partes, e o numero de lances explode: so a
// abertura do 5x5 com uma amazona de cada lado tem mais de cem. Por isso a
// busca para assim que acha um lance que ganha.

import { lances, aplica, chave, temLance, simetrias, permutaPos } from './nucleo.js'

export class Motor {
  constructor (g, { simetria = true, ordenacao = false } = {}) {
    this.g = g
    this.memo = new Map()
    this.nos = 0
    this.simetria = simetria
    this.ordenacao = ordenacao
    this.perms = simetria ? simetrias(g) : null
  }

  chaveDe (pos) {
    if (!this.simetria) return chave(this.g, pos)
    let menor = Infinity
    for (const p of this.perms) {
      const k = chave(this.g, permutaPos(p, pos))
      if (k < menor) menor = k
    }
    return menor
  }

  // true se quem esta na vez ganha.
  ganha (pos) {
    if (!temLance(this.g, pos)) return false
    const k = this.chaveDe(pos)
    const m = this.memo.get(k)
    if (m !== undefined) return m
    this.nos++
    let filhos = lances(this.g, pos).map((j) => aplica(pos, j))
    if (this.ordenacao) {
      const custo = filhos.map((f) => temLance(this.g, f) ? lances(this.g, f).length : -1)
      const idx = filhos.map((_, i) => i).sort((a, b) => custo[a] - custo[b])
      filhos = idx.map((i) => filhos[i])
    }
    let r = false
    for (const f of filhos) {
      if (!this.ganha(f)) { r = true; break }
    }
    this.memo.set(k, r)
    return r
  }

  lancesQueGanham (pos) {
    return lances(this.g, pos).filter((j) => !this.ganha(aplica(pos, j)))
  }
}
