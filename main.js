const canvas = document.getElementById('canvas');
const ctx = canvas.getContext('2d');

let windowSize = window.innerWidth/650;
const cw = 400 * windowSize;
const ch = 300 * windowSize;


canvas.width = cw;
canvas.height = ch;

let graphic = new Image();
graphic.src = "img/GameGraphic.png";
graphic.addEventListener("load", function () {
    graphic = this;
})

const rocketWidthUsed = 132 * windowSize / 2;
const rocketHeightUsed = 140 * windowSize / 2;

const bulletHeightUsed = 9 * windowSize;
const bulletWidthUsed = 4 * windowSize;

let playerX = cw / 2 - rocketWidthUsed/2;
let playerY = ch / 6 *4 ;
let playerSpeed = windowSize * 4;
let skySpeed = 2;
let protection = false;
let lives = 3;
let defaultVolume = 0.3;

let numberGraphicRocket = 0;
let cheangeAnimation = 0;
let cheangeReloade = 0;
let reloadStatus = 0;
let meteorsWhile;
let engineWhile;
let menuWhile;



let right = false;
let left = false;
let up = false;
let down = false;
let keySpace = false;
let shotStatus = true;
let ammoStatus = true;
let menuSwith = false;

const Bullets = [];
let numberAmmo = 7;
let numberScore = 0;
let score = 0;
let bestScore = 0;
let skyPosition = 600;
const bulletSpeed = 10 * windowSize;
let speedRespMeteor = 1000;

let Meteors = [];
let Explosions = [];

function playSound(path){
    const sound = new Audio(path)
    sound.volume = defaultVolume
    sound.play();
}

const sound = {
    explosion: "./sounds/explosion.wav",
    heroDeath: "./sounds/hero-death.wav",
    hit: "./sounds/hit.wav",
    laserGunShot: "./sounds/laser-gun-shot.wav",
    reload: "./sounds/reload.wav"
}



function sky() {
    ctx.drawImage(graphic, 0, skyPosition, 800, 600, 0, 0, cw, ch);
    skyPosition -= skySpeed;
    if (skyPosition < 0) {
        skyPosition = 600
    }
};

function drowRocket() {
    ctx.drawImage(graphic, numberGraphicRocket, 1201, 132, 140, playerX, playerY, rocketWidthUsed, rocketHeightUsed);
    if (cheangeAnimation >= 10) {
        numberGraphicRocket += 132;
        if (numberGraphicRocket >= 396) {
            numberGraphicRocket = 0;
        }
        cheangeAnimation = 0;
    }
    cheangeAnimation++;
};



//################ Poruszanie sie ###############
//KEYDOWN wciskane
function going(e) {
    // console.log('[klawisz]',e.keyCode );
    if (menuSwith) {
        switch (e.keyCode) {
            case 65: //lewo  32strzałki 65wsad
                left = true;
                break;
            case 87: //góra 38strzałki 87wsad
                up = true;
                break;
            case 68: //prawo 39strzałki 68wsad  
                right = true;
                break;
            case 83: //dół 40strzałki 83wsad
                down = true;
                break;
            case 32: //strzał  $SPACE$
                   keySpace = true;
                // shoting();
                break;
            case 82: //przeładowanie $R$
                if (ammoStatus == true && numberAmmo < 7) {
                    setTimeout(reloadAmmo, 1600);
                    ammoStatus = false;
                }
                break;
        }
    } else {
        switch (e.keyCode) {
            case 13: //rozpoczęcie gry  $Enter$
                menuSwith = true;
                clearInterval(menuWhile);
                engineWhile = setInterval(start, 1000 / 60);
                meteorsWhile = setInterval(createMeteor, speedRespMeteor);
                break;
        }

    }
}
//KEYUP puszczane
function staying(e) {
    if (menuSwith) {
        switch (e.keyCode) {
            case 65: //lewo
                left = false;
                break
            case 87: //góra
                up = false;
                break
            case 68: //prawo
                right = false;
                break
            case 83: //dół
                down = false;
                break
            case 32:
                keySpace = false;
                break
        }
    } else {
        switch (e.keyCode) {
            case 13: //rozpoczęcie gry  $Enter$
                menuSwith = true;
                clearInterval(menuWhile);
                engineWhile = setInterval(start, 1000 / 60);
                meteorsWhile = setInterval(createMeteor, speedRespMeteor);
                break;
        }

    }
}
//MOVE poruszanie się





function move() {
    if (skySpeed < 4) { //przyśpieszenie po kliknięciu enter w menu
        skySpeed += 0.02;
    }
    if (right && playerX <= cw - rocketWidthUsed) {
        playerX += playerSpeed
    }
    if (left && playerX >= 0) {
        playerX -= playerSpeed
    }
    if (up && playerY >= ch / 4) {
        playerY -= playerSpeed
    }
    if (down && playerY <= ch - rocketHeightUsed) {
        playerY += playerSpeed
    }
    if (ammoStatus == true && shotStatus == true && keySpace == true) {
        createBullet();
        shotStatus = false;
        setTimeout(() =>{
            shotStatus = true;
        }, 400);
    }
}



window.addEventListener("keydown", going);
window.addEventListener("keyup", staying);
//################ Poruszanie sie ##############@

function createMeteor() {
    Meteors.push({
        x: Math.floor(Math.random() * (cw-30*windowSize - 1) + 1),
        y: -60*3,
        speedX: windowSize *(Math.random()),
        speedY:windowSize*1.4 *(Math.random() * ( 2) + 1),
        size: Math.random() * (2 - 1) + 1,
        sign: Math.floor(Math.random() * (2) + 1),
    })
}
function drowMeteor() {
    if (!Meteors.length == 0) {
        let i = 0;
        Meteors.forEach(function (meteor) {
            ctx.drawImage(graphic, 405, 1201, 30, 30, meteor.x, meteor.y, 30 * meteor.size * windowSize, 30 * meteor.size * windowSize);
            if(meteor.sign == 1){
                meteor.x -= meteor.speedX;
            }
            if(meteor.sign == 2){
            meteor.x += meteor.speedX;
            }
            meteor.y += meteor.speedY;
            if (meteor.y > ch || meteor.x < -50*windowSize || meteor.x > cw) {
                Meteors.splice(i, 1);
            }
            i++;
        })
    }
}


function colisionMeteorPlayer() {
    if (!Meteors.length == 0 && protection == false) {
        let i = 0;
        Meteors.forEach(function (meteor) {
            if(!(meteor.x + 30*meteor.size*windowSize < playerX+rocketWidthUsed/5*2 ||
                playerX+rocketWidthUsed/5*2 + rocketWidthUsed/5 < meteor.x ||
               meteor.y + 30*meteor.size*windowSize < playerY ||
               playerY + rocketHeightUsed < meteor.y)){
                protection = true;
                playSound(sound.explosion);
                playSound(sound.hit);
                createExplosion(meteor.x+30*meteor.size*windowSize/2, meteor.y+30*meteor.size*windowSize, meteor.size)
                        lives--;
                        Meteors.splice(i,1);
                        if(lives <= 0){
                            playSound(sound.heroDeath);
                            setTimeout(function() {
                                restartGame();
                            }, 200) 
                        }
                        setTimeout(function() {
                            protection = false;
                        }, 500);
            }
            if(!(meteor.x + 30*meteor.size*windowSize < playerX ||
                playerX + rocketWidthUsed < meteor.x ||
                meteor.y + 30*meteor.size*windowSize < playerY+rocketHeightUsed/5*3 ||
                playerY+rocketHeightUsed/5*3 + rocketHeightUsed/5 < meteor.y)){
                protection = true;
                playSound(sound.explosion);
                playSound(sound.hit);
                createExplosion(meteor.x+30*meteor.size*windowSize/2, meteor.y+30*meteor.size*windowSize, meteor.size)
                        lives--;
                        Meteors.splice(i,1);
                        if(lives <= 0){
                            playSound(sound.heroDeath);
                            setTimeout(function() {
                                restartGame();
                            }, 200) 
                        }
                        setTimeout(function() {
                            protection = false;
                        }, 500);
            }
        })
            
    }
}

function restartGame() {
    clearInterval(engineWhile);
    clearInterval(meteorsWhile);
    menuWhile = setInterval(menu, 1000 / 60);
    menuSwith = false;
    left = false;
    right = false;
    up = false;
    down = false;
    playerX = cw / 2 - rocketWidthUsed/2;
    playerY = ch / 6 *4;
    lives = 3;
    numberAmmo = 7;
    reloadStatus = 0;
    Meteors = [];
    score = Math.floor(numberScore);
    numberScore = 0;
    skySpeed = 2;
    speedRespMeteor = 1000;
    if(score > bestScore){
        bestScore = score;
    }
    
}

function createBullet() {
    if (!numberAmmo <= 0) {
        playSound(sound.laserGunShot)
        Bullets.push({
            x: playerX + rocketWidthUsed / 2 - bulletWidthUsed / 2,
            y: playerY + rocketHeightUsed / 2 - bulletWidthUsed,
        })
        numberAmmo--;
    }
}

function shotBullet() {
    if (!Bullets.length == 0) {
        let i = 0;
        Bullets.forEach(function (bullet) {
            ctx.drawImage(graphic, 400, 1201, 4, 9, bullet.x, bullet.y, bulletWidthUsed, bulletHeightUsed);
            bullet.y -= bulletSpeed;
            if (bullet.y < 0) {
                Bullets.splice(i, 1);
            }
            i++;
        })
    }
}
function createExplosion(x,y,size) {
    Explosions.push({
        x: x,
        y: y,
        size: size,
        width: 1,
        height: 1,
        animate: 467,
    })
}

function drowExplosion() {
    if(!Explosions.length == 0){
        Explosions.forEach(function(explosion){
            let i = 0;
            ctx.drawImage(graphic, explosion.animate, 1201, 49, 49, explosion.x-explosion.width*windowSize/2, explosion.y-explosion.height*windowSize/2, explosion.width*windowSize, explosion.height*windowSize);
            explosion.width += 10*windowSize;
            explosion.height += 10*windowSize;
            if(explosion.width*windowSize >= 60*explosion.size*windowSize || explosion.height >= 60*explosion.size){
            Explosions.splice(i,1)
            }
        })
        explosionAnimate = 467
    }
}

function colisionMeteorBullet() {
    if (!Bullets.length == 0) {
        let i = 0;
        Bullets.forEach(function (bullet) {
            let ii = 0;
            Meteors.forEach(function (meteor) {
                if(bullet.x >= meteor.x && bullet.x <= meteor.x+30*meteor.size*windowSize){
                    if(bullet.y >= meteor.y && bullet.y <= meteor.y+30*meteor.size*windowSize){
                        playSound(sound.explosion);
                        createExplosion(bullet.x, bullet.y, meteor.size);
                        Bullets.splice(i, 1);
                        Meteors.splice(ii, 1);
                        numberScore += 20;
                    }
                }
                ii++;
            })
            i++;
        })
    }
}



function reloadAmmo() {
    playSound(sound.reload)
    numberAmmo = 7;
    ammoStatus = true;
}

function ammoShow() {
    ctx.fillStyle = 'white'
    ctx.font = `${cw/20}px Bowlby One SC`;
    ctx.textAlign = 'left';
    ctx.strokeText(`ammo: ${numberAmmo}`, cw - cw / 4, ch / 14);
    ctx.fillText(`ammo: ${numberAmmo}`, cw - cw / 4, ch / 14);
}
function livesShow() {

    for(let i = 0; i < lives; i++){
        
    ctx.drawImage(graphic, 437, 1201, 29, 29, 5*windowSize + 35*i*windowSize, ch / 14 *1.2, 29*windowSize, 29*windowSize);
    }
};

function scoreShow() {
    ctx.fillStyle = 'white'
    ctx.font = `${cw/20}px Bowlby One SC`;
    ctx.textAlign = 'left';
    ctx.strokeText(`score: ${Math.floor(numberScore)}`, 5*windowSize, ch / 14);
    ctx.fillText(`score: ${Math.floor(numberScore)}`, 5*windowSize, ch / 14);
}

function reloadDrow() {
    ctx.fillStyle = 'white'
    ctx.fillRect(cw - cw / 4 - 3 * windowSize, ch / 14 + 5 * windowSize, reloadStatus * windowSize, 5 * windowSize)
}

function reloadShow() {
    if (ammoStatus == false) {
        reloadStatus++;
        cheangeReloade = 0;
        if (reloadStatus >= 100) {
            reloadStatus = 0;
        }
        reloadDrow();
    }
}
function checking(){
    numberScore += 0.1;
    if(speedRespMeteor > 600);
    speedRespMeteor -= 0.1;
}

function start() {
    sky();
    drowRocket();
    move();
    shotBullet();
    colisionMeteorBullet();
    colisionMeteorPlayer();
    drowMeteor();
    ammoShow();
    scoreShow();
    livesShow();
    reloadShow();
    checking();
    drowExplosion();
    
}
function textMenu(name, variable, y){
    if(variable == 0){
        variable = '';}
    ctx.strokeText(`${name} ${variable}`, cw / 2, y);
    ctx.fillText(`${name} ${variable}`, cw / 2, y);
}
function menu() {
    sky()
    ctx.fillStyle = 'white'
    ctx.textAlign = 'center';
    ctx.font = `${cw/10}px Bowlby One SC`;
    textMenu('Best Score:', bestScore, ch/10*2);
    ctx.font = `${cw/15}px Bowlby One SC`;
    textMenu('Score:', score, ch/10*3.5);
    ctx.font = `${cw/20}px Bowlby One SC`;
    textMenu('Latanie:  W A S D', 0, ch/2);
    textMenu('Strzelanie:  SPACE', 0, ch/2+cw/15);
    textMenu('Przeładowanie:  R', 0, ch/2+2*cw/15);
    textMenu('Start:  ENTER', 0, ch/2+4*cw/15);
}
menuWhile = setInterval(menu, 1000 / 60)
