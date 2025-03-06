const canvas = document.querySelector('canvas')

// c Está se referenciando a "context"
const c = canvas.getContext('2d')


canvas.width = 1024
canvas.height = 576

const collisionsMap = []
for (let i = 0; i < collisions.length; i += 140) {
    collisionsMap.push(collisions.slice(i, 140 + i))
}

const battleZonesMap = []
for (let i = 0; i < battleZonesData.length; i += 140) {
    battleZonesMap.push(battleZonesData.slice(i, 140 + i))
}

// Define o tamanho das colisões
class Boundary {
    static width = 32
    static height = 32
    constructor({ position }) {
        this.position = position
        this.width = 32
        this.height = 32
    }

    draw() {
        c.fillStyle = 'rgba(255, 0, 0, 0)'
        c.fillRect(this.position.x, this.position.y, this.width, this.height)
    }
}

// Define o ponto onde o jogador vai nascer
const boundaries = []
const offset = {
    x: -323,
    y: -350
}

// Cria as colisões
collisionsMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 2818)
            boundaries.push(new Boundary(
                {
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                }
            ))
    })
})

const battleZones = []

battleZonesMap.forEach((row, i) => {
    row.forEach((symbol, j) => {
        if (symbol === 2818)
            battleZones.push(new Boundary(
                {
                    position: {
                        x: j * Boundary.width + offset.x,
                        y: i * Boundary.height + offset.y
                    }
                }
            ))
    })
})


// Importe do mapa da Dungeon Level 1
const image = new Image()
image.src = './images/dungeonLevel1wZ.png'

// Importe do foreground da Dungeon Level 1
const foregroundImage = new Image()
foregroundImage.src = './images/dungeonLevel1wZFg.png'

// Importe do sprite do jogador (Caveira)
const playerDownImage = new Image
playerDownImage.src = './images/playerDown1.png'

const playerUpImage = new Image
playerUpImage.src = './images/playerUp1.png'

const playerLeftImage = new Image
playerLeftImage.src = './images/playerLeft1.png'

const playerRightImage = new Image
playerRightImage.src = './images/playerRight1.png'

// Sprite do jogador
class Sprite {
    constructor({ position, image, frames = { max: 1, hold: 8}, sprites = [], hitboxOffset = { x: 0, y: 0, width: 0, height: 0 }, isEnemy = false, name}) {
        this.position = position
        this.image = image
        this.frames = { ...frames, val: 0, elapsed: 0 }

        this.image.onload = () => {
            this.width = this.image.width / this.frames.max
            this.height = this.image.height;
            // Definir a hitbox com base na sprite e no deslocamento
            this.hitbox = {
                x: this.position.x + hitboxOffset.x,
                y: this.position.y + hitboxOffset.y,
                width: this.width + hitboxOffset.width,
                height: this.height + hitboxOffset.height
            }
        }
        this.moving = false;
        this.sprites = sprites;
        this.hitboxOffset = hitboxOffset;
        this.opacity = 1
        this.health = 100
        this.isEnemy = this.isEnemy
        this.name = name
    }

    faint(){
        document.querySelector('#dialogueBox').innerHTML = this.name + ' foi morta...?'
        gsap.to(this.position,{
            y: this.position.y + 20
        })
        gsap.to(this,{
            opacity: 0
        })
    }

    updateHitbox() {
        this.hitbox = {
            x: this.position.x + this.hitboxOffset.x,
            y: this.position.y + this.hitboxOffset.y,
            width: this.width + this.hitboxOffset.width,
            height: this.height + this.hitboxOffset.height
        };
    }

    draw() {
        c.save()
        c.globalAlpha = this.opacity
        c.drawImage(
            this.image,
            this.frames.val * this.width,
            0,
            this.image.width / this.frames.max,
            this.image.height,
            this.position.x,
            this.position.y,
            this.image.width / this.frames.max,
            this.image.height
        )
        c.restore()

        if (!this.moving) return;

        if (this.frames.max > 1) {
            this.frames.elapsed++
        }

        // Define a velocidade da atualização do sprite do jogador
        if (this.frames.elapsed % this.frames.hold === 0) {
            if (this.frames.val < this.frames.max - 1) this.frames.val++;
            else this.frames.val = 1;
        }

        this.updateHitbox();
    }

    attack({attack, recipient}){
        const tl = gsap.timeline()

        recipient.health -= attack.damage

        let movementDistance = 20
        if(this.isEnemy) movementDistance = -30

        document.querySelector('#dialogueBox').style.display = 'block'
        document.querySelector('#dialogueBox').innerHTML = this.name + ' usou ' + attack.name

        let healthBar = '#enemyHealthBar'
        if (this.isEnemy) healthBar = '#playerHealthBar'

        tl.to(this.position,{
            x: this.position.x + 30,
            y: this.position.y - 10
        })
          .to(this.position,{
            x: this.position.x - 20,
            x: this.position.x,
            y: this.position.y,
            duration: 0.1,
            onComplete: () => {
                //Inimigo toma dano aqui
                gsap.to(healthBar,{
                    width: recipient.health + '%'
                })

                gsap.to(recipient.position,{
                    x: recipient.position.x + 10,
                    yoyo: true,
                    repeat: 5,
                    duration: 0.08
                })

                gsap.to(recipient,{
                    opacity: 0,
                    repeat: 5,
                    yoyo: true,
                    duration: 0.08
                })
            }
          })
    }

    // Desenha a hitbox do player
    drawHitbox() {
        c.fillStyle = 'rgba(0, 255, 0, 0)' // Cor verde semitransparente
        c.fillRect(
            this.position.x + this.hitboxOffset.x,
            this.position.y + this.hitboxOffset.y,
            this.width + this.hitboxOffset.width,
            this.height + this.hitboxOffset.height
        )
    }

}

// Define o tamanho do sprite do jogador e a quantidade de frames que ele tem
const player = new Sprite({
    position: {
        x: canvas.width / 2 - 192 / 4 / 2,
        y: canvas.height / 2 - 68 / 2
    },
    image: playerDownImage,
    frames: {
        max: 6,
        hold: 8
    },
    sprites: {
        up: playerUpImage,
        left: playerLeftImage,
        right: playerRightImage,
        down: playerDownImage
    },

    hitboxOffset: { x: 16, y: 40, width: -35, height: -45 } // Ajuste da hitbox
});


const background = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: image
})

const foreground = new Sprite({
    position: {
        x: offset.x,
        y: offset.y
    },
    image: foregroundImage
})

const keys = {
    w: {
        pressed: false
    },
    a: {
        pressed: false
    },
    s: {
        pressed: false
    },
    d: {
        pressed: false
    }
}


const movables = [background, ...boundaries, foreground, ...battleZones]

// Cria a hitbox do jogador e das colisões do mapa juntamente com o tamanho da hitbox do jogador
function rectangularCollision({ rectangle1, rectangle2 }) {
    return (
        rectangle1.hitbox.x + rectangle1.hitbox.width >= rectangle2.position.x &&
        rectangle1.hitbox.x <= rectangle2.position.x + rectangle2.width &&
        rectangle1.hitbox.y <= rectangle2.position.y + rectangle2.height &&
        rectangle1.hitbox.y + rectangle1.hitbox.height >= rectangle2.position.y
    );
}

const battle = {
    initiated: false
}

function animate() {
    const animationId = window.requestAnimationFrame(animate)
    background.draw()
    boundaries.forEach((boundary) => {
        boundary.draw()
        
    })
    battleZones.forEach(battleZone => {
        battleZone.draw()
    })
    player.draw()
    foreground.draw()
    player.drawHitbox()

    let moving = true
    player.moving = false

    console.log(animationId)
    if(battle.initiated) return

    // Ativa uma batalha
    if (keys.w.pressed || keys.a.pressed || keys.s.pressed || keys.d.pressed) {
        for (let i = 0; i < battleZones.length; i++) {
            const battleZone = battleZones[i]
    
            // Calcula a área de sobreposição entre o player e a battleZone
            const overlappingArea =
                (Math.min(
                    player.position.x + player.width,
                    battleZone.position.x + battleZone.width
                ) -
                    Math.max(player.position.x, battleZone.position.x)) *
                (Math.min(
                    player.position.y + player.height,
                    battleZone.position.y + battleZone.height
                ) -
                    Math.max(player.position.y, battleZone.position.y))
    
            if (
                rectangularCollision({
                    rectangle1: player,
                    rectangle2: battleZone
                }) &&
                overlappingArea > (player.width * player.height) / 4
                && Math.random() < 0.02
            ) {

                console.log('batalha ativada')

                // Desativa o loop de animação
                window.cancelAnimationFrame(animationId)

                battle.initiated = true
                gsap.to('#overlappingDiv', {
                    opacity: 1,
                    repeat: 2,
                    yoyo: true,
                    duration: 0.4,
                    onComplete(){
                        gsap.to('#overlappingDiv',{
                            opacity: 1,
                            duration: 0.4,
                            onComplete(){
                                // Ativa um novo loop de animação
                                animateBattle()
                                gsap.to('#overlappingDiv',{
                                    opacity: 0,
                                    duration: 0.4,
                                    
                                })
                            }
                        })


                    }
                })
                break
            }
        }
    }
    


    // Movimentação do jogador para cima
    
    if (keys.w.pressed && lastKey === 'w') {
        player.moving = true
        player.image = player.sprites.up
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y + 3
                }}
            })){
                
                moving = false
                break
            }
        }

        
        
        if (moving)
        movables.forEach(movable => { movable.position.y += 3 })
    }
    // Movimentação do jogador para a esquerda
    else if (keys.a.pressed && lastKey === 'a') { 
        player.moving = true
        player.image = player.sprites.left
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x +3,
                    y: boundary.position.y
                }}
            })){
                
                moving = false
                break
            }
        }
        // Movimentação do jogador para baixo
        if (moving)
        movables.forEach(movable => {movable.position.x += 3}) }
    else if (keys.s.pressed && lastKey === 's') {
        player.moving = true
        player.image = player.sprites.down
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x,
                    y: boundary.position.y - 3
                }}
            })){
                
                moving = false
                break
            }
        }
        // Movimentação do jogador para a direita
        if (moving)
        movables.forEach(movable => {movable.position.y -= 3}) }
    else if (keys.d.pressed && lastKey === 'd') {
        player.moving = true
        player.image = player.sprites.right
        for(let i = 0; i < boundaries.length; i++){
            const boundary = boundaries[i]
            if (rectangularCollision({
                rectangle1: player,
                rectangle2: {...boundary, position: {
                    x: boundary.position.x - 3,
                    y: boundary.position.y
                }}
            })){
                
                moving = false
                break
            }
        }
        if (moving)
        movables.forEach(movable => {movable.position.x -= 3}) }
}
//animate()


//Metodo para impedir que o jogador ande em duas direções ao mesmo tempo
let lastKey = ''
window.addEventListener('keydown', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = true
            lastKey = 'w'
            break
        case 'a':
            keys.a.pressed = true
            lastKey = 'a'
            break
        case 's':
            keys.s.pressed = true
            lastKey = 's'
            break
        case 'd':
            keys.d.pressed = true
            lastKey = 'd'
            break
    }
})
window.addEventListener('keyup', (e) => {
    switch (e.key) {
        case 'w':
            keys.w.pressed = false
            break
        case 'a':
            keys.a.pressed = false
            break
        case 's':
            keys.s.pressed = false
            break
        case 'd':
            keys.d.pressed = false
            break
    }
})
