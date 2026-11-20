// A pagina: Amazonas contra a maquina, com o mesmo motor dos testes.
//
// O lance tem tres cliques: a amazona, a casa onde ela para, e a casa da
// flecha. As casas possiveis de cada passo vem de `lances()`, nunca de uma
// regra reescrita aqui.

import { grade, inicial, lances, aplica, desenha as texto } from './nucleo.js'
import { Motor } from './busca.js'

const elTab = document.getElementById('tabuleiro')
const elEstado = document.getElementById('estado')
const elTamanho = document.getElementById('tamanho')

let g, motor, pos, vezBrancas, passo, de, para, acabou

const INICIOS = { '3x3': [0, 8], '3x5': [1, 13], '4x4': [0, 15], '3x6': [1, 16] }

function comeca () {
  const [w, h] = elTamanho.value.split('x').map(Number)
  g = grade(w, h)
  motor = new Motor(g, { simetria: true, ordenacao: true })
  const [a, b] = INICIOS[elTamanho.value]
  pos = inicial(g, [a], [b])
  vezBrancas = true
  passo = 0
  de = para = null
  acabou = false
  desenha()
  diz()
}

// Do ponto de vista das brancas, para desenhar sempre com as mesmas cores.
function brancasPretas () {
  return vezBrancas ? [pos.eu, pos.outro] : [pos.outro, pos.eu]
}

function desenha () {
  const [brancas, pretas] = brancasPretas()
  const lista = vezBrancas && !acabou ? lances(g, pos) : []
  const marcadas = new Set()
  if (passo === 0) lista.forEach((j) => marcadas.add(j.de))
  if (passo === 1) lista.filter((j) => j.de === de).forEach((j) => marcadas.add(j.para))
  if (passo === 2) lista.filter((j) => j.de === de && j.para === para).forEach((j) => marcadas.add(j.flecha))
  elTab.style.gridTemplateColumns = `repeat(${g.largura}, 1fr)`
  elTab.innerHTML = ''
  for (let i = 0; i < g.casas; i++) {
    const b = document.createElement('button')
    b.type = 'button'
    const r = Math.floor(i / g.largura)
    const c = i % g.largura
    b.className = 'casa ' + ((r + c) % 2 ? 'escura' : 'clara')
    // Durante o lance, a amazona aparece onde vai parar.
    const ondeBranca = passo === 2 && i === para ? true : passo === 2 && i === de ? false : brancas.includes(i)
    if (ondeBranca) b.classList.add('branca')
    else if (pretas.includes(i)) b.classList.add('preta')
    else if (pos.flechas & (1 << i)) b.classList.add('flecha')
    if (marcadas.has(i)) b.classList.add(passo === 0 ? 'pode' : 'alvo')
    if (i === de && passo > 0) b.classList.add('escolhida')
    b.setAttribute('aria-label', `casa ${String.fromCharCode(97 + c)}${g.altura - r}`)
    b.addEventListener('click', () => clique(i, marcadas))
    elTab.appendChild(b)
  }
}

function diz () {
  if (acabou) return
  if (!vezBrancas) { elEstado.textContent = 'A maquina pensa...'; return }
  const ganha = motor.ganha(pos)
  const fase = ['escolha a amazona', 'escolha onde ela para', 'escolha onde cai a flecha'][passo]
  elEstado.textContent = `Sua vez: ${fase}. Com o melhor jogo dos dois, ${ganha ? 'voce ganha' : 'voce perde'} daqui.`
}

function confereFim () {
  if (lances(g, pos).length > 0) return false
  acabou = true
  elEstado.textContent = vezBrancas ? 'Voce ficou sem lance. A maquina ganhou.' : 'A maquina ficou sem lance. Voce ganhou.'
  desenha()
  return true
}

function clique (i, marcadas) {
  if (acabou || !vezBrancas) return
  if (!marcadas.has(i)) {
    if (passo > 0) { passo = 0; de = para = null; desenha(); diz() }
    return
  }
  if (passo === 0) { de = i; passo = 1 } else if (passo === 1) { para = i; passo = 2 } else {
    pos = aplica(pos, { de, para, flecha: i })
    vezBrancas = false
    passo = 0
    de = para = null
    desenha()
    if (confereFim()) return
    diz()
    setTimeout(maquina, 300)
    return
  }
  desenha()
  diz()
}

function maquina () {
  const boas = motor.lancesQueGanham(pos)
  const j = boas.length ? boas[0] : lances(g, pos)[0]
  pos = aplica(pos, j)
  vezBrancas = true
  desenha()
  if (confereFim()) return
  diz()
}

document.getElementById('reiniciar').addEventListener('click', comeca)
elTamanho.addEventListener('change', comeca)
comeca()

export { texto }
