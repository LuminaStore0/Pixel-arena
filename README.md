# Pixel Arena Survivor 2D

Roguelite de sobrevivência em arena 2D, leve e jogável diretamente no navegador, no computador ou no telemóvel. Inspirado em *Vampire Survivors* e *Brotato*.

![Licença](https://img.shields.io/badge/license-MIT-green)
![Tamanho](https://img.shields.io/badge/size-%3C%201MB-blue)
![Tecnologia](https://img.shields.io/badge/tech-HTML5%20%7C%20JS%20Vanilla%20%7C%20Canvas-orange)

**Jogar online:** `https://SEU-USUARIO.github.io/pixel-arena-survivor/`

## Como jogar

- Sobreviva o máximo de tempo possível. O ataque é **automático** e mira no inimigo mais próximo.
- Matar inimigos dá XP. Ao subir de nível, escolha 1 de 3 upgrades.
- A cada 45 segundos surge um boss.
- As moedas ganhas ficam guardadas e podem ser gastas na **Loja** (menu inicial) em melhorias permanentes: vida, velocidade e dano.
- Depois de levar dano, o jogador fica protegido por um instante (pisca).

## Controlos

| Ação | Computador | Telemóvel / tablet |
|------|------------|--------------------|
| Mover | `W A S D` ou setas | Toque e arraste: aparece um joystick virtual |
| Pausa | `P` ou `Esc` | Botão **II** no canto superior |
| Som ligado/desligado | `M` | Botão 🔊 no canto superior |

No telemóvel, o jogo é em **modo horizontal**. Se abrir na vertical, aparece um aviso para rodar o aparelho.

## Executar localmente

```bash
git clone https://github.com/SEU-USUARIO/pixel-arena-survivor.git
cd pixel-arena-survivor
```

Abra o ficheiro `index.html` em qualquer navegador moderno. Não é preciso instalar nada.

## Tecnologias

- HTML5 Canvas (resolução lógica 960×540, 16:9, ajustada ao ecrã)
- JavaScript ES6+ sem bibliotecas externas
- Web Audio API (sons gerados por código, sem ficheiros de áudio)
- `localStorage` (moedas, upgrades da loja, melhor tempo, som)
- Loop com *delta time*: a mesma velocidade em 60, 120 ou 144 Hz

## Estrutura

```
index.html
css/style.css
js/
  storage.js    gravação do progresso e dados da loja
  audio.js      efeitos sonoros (Web Audio API)
  particle.js   partículas e números de dano
  weapon.js     projéteis (colisão varrida)
  enemy.js      inimigos e bosses
  player.js     jogador, XP e invulnerabilidade
  input.js      teclado e joystick virtual
  ui.js         HUD, upgrades de nível e loja
  game.js       loop principal, spawn, colisões, pausa e efeitos
  main.js       ligação dos botões e arranque
```

## Licença

Distribuído sob a licença MIT. Veja o ficheiro `LICENSE`.
