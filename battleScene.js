const battleBackgroundImage = new Image()
battleBackgroundImage.src = './images/battleBackgroundDungeonBlackWhite.png'
const battleBackground = new Sprite({
    position: {
        x: 0,
        y: 0
    },
    image: battleBackgroundImage
})

const fantasmaImage = new Image()
fantasmaImage.src = './images/fantasmaBlackWhite.png'
const fantasma = new Sprite({
    position: {
        x: 340,
        y: 0,
    },
    image: fantasmaImage,
    name: 'Criatura'
})
fantasma.isEnemy = true

const kiliamImage = new Image()
kiliamImage.src = './images/kiliamEmpty.png'
const kilam = new Sprite({
    position: {
        x:0,
        y:0
    },
    image: kiliamImage,
    name: 'Kilam'
})

let battleAnimationId

let queue = []

function initBattle(){

}

function animateBattle(){
    battleAnimationId = window.requestAnimationFrame(animateBattle)
    battleBackground.draw()

    console.log(battleAnimationId)

    fantasma.draw()
    kilam.draw()
}
animateBattle()

// Nosso event listeners para os botões (Atacar)
document.querySelector('#attackButton').addEventListener('click', () => {
    kilam.attack({ 
        attack: {
            name: 'Espadada',
            damage: 20
        },
        recipient: fantasma
    });

    queue.push(() => {
        if (fantasma.health > 0) {
            fantasma.attack({ 
                attack: {
                    name: 'Ataque',
                    damage: 10
                },
                recipient: kilam
            })
        }
    })

    
    queue.push(() => {
        if (fantasma.health <= 0) {
            queue.push(() =>{
                fantasma.faint();
            })
            queue.push(() =>{
                // Voltar para tela preta
                gsap.to('#overlappingDiv',{
                    opacity: 1,
                    onComplete:() =>{
                        cancelAnimationFrame(battleAnimationId)
                        animate()
                        document.querySelector('#userInterface').style.display = 'none'
                        gsap.to('#overlappingDiv',{
                           opacity: 0 
                        })
                    }
                })
            })
        }
    })
    
})

document.querySelector('#dialogueBox').addEventListener('click', (e) => {
    if(queue.length > 0){
        queue[0]()
        queue.shift()
    } else e.currentTarget.style.display = 'none'
})

let fugindo = false
document.querySelector('#fugirButton').addEventListener('click', (e) => {
    const dialogueBox = document.querySelector('#dialogueBox');
    if (!fugindo) {
        // Primeira tentativa de fuga (exibe a mensagem)
        dialogueBox.innerHTML = "Voce acha mesmo que pode fugir?";
        dialogueBox.style.display = "block";
        fugindo = true;
    } else {
        // Segunda tentativa (fecha a mensagem e volta para a luta)
        dialogueBox.style.display = "none";
        fugindo = false;
    }
})