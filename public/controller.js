import request from './request'
let app = new PIXI.Application(window.screen.width, window.screen.height, { backgroundColor: 0x000000 });
document.body.appendChild(app.view);

const stage1 = new PIXI.Container();
const container = new PIXI.Container();

app.stage.addChild(stage1);

let countClicks = 0;
let backCards = [];
let firstCard = null;
let secondCard = null;
let matchedPairs = 0;
let cards = [];
const options = {
    async: true,
    method: 'GET',
    requestHeader: { 'Accept': 'application/json, text/plain, */*' },
    responseType: 'json',
    url: 'http://localhost:3031/symbols'
};
const text = new PIXI.Text('Loading...', { fill: '0x009933', font: '48px Arial', wordWrap: true, wordWrapWidth: 700 });
const loadingGif = PIXI.Sprite.fromImage('images/loader.gif');
const buttonPositions = [
    10, 75,
    100, 75,
    190, 75,
    280, 75,
    360, 75,
    10, 200,
    100, 200,
    190, 200,
    280, 200,
    360, 200
];

stage1.addChild(loadingGif);
stage1.addChild(text);

const loadProgressHandler = (loader, resource) => {
    text.x = 0;
    text.y = 0;
    loadingGif.x = -50;
    loadingGif.y = -250;
    text.text = parseInt(loader.progress);
}

const completeLoading = (loader, resource) => {
    stage1.removeChild(loadingGif);
    stage1.removeChild(text);
}

stage1.x = (app.screen.width - stage1.width) / 3;
stage1.y = (app.screen.height - stage1.height) / 3;

const onAssetsLoaded = () => {
    const style = new PIXI.TextStyle({
        fontFamily: 'Arial',
        fontSize: 36,
        fontStyle: 'italic',
        fontWeight: 'bold',
        fill: ['#ffffff', '#00ff99'],
        stroke: '#4a1850',
        strokeThickness: 5,
        dropShadow: true,
        dropShadowColor: '#000000',
        dropShadowBlur: 4,
        dropShadowAngle: Math.PI / 6,
        dropShadowDistance: 6,
        wordWrap: true,
        wordWrapWidth: 440
    });

    const updateCards = (data) => {
        cards = data.symbols.map(function(elem) { return PIXI.Texture.fromImage('images/' + elem + '.jpg') });
    }

    const success = (data) => {
        updateCards(data);

        const textureButton = PIXI.Texture.fromImage('images/Red_back.jpg');

        for (let i = 0; i < cards.length; i++) {
            const backCard = new PIXI.Sprite(textureButton);
            backCard.buttonMode = true;
            backCard.id = i;

            backCard.anchor.set(0.5);

            backCard.position.x = buttonPositions[i * 2];
            backCard.position.y = buttonPositions[i * 2 + 1];
            backCard.scale.set(0.1, 0.1);

            backCard.interactive = false;
            backCard
                .on('mousedown', eventListener)
                .on('touchstart', eventListener)
            backCards.push(backCard);
            container.addChild(backCard);
        }

        const createInteractive = () => {
            backCards.forEach((elem) => {
                elem.interactive = true;
            });
            container.removeChild(btnBox);
        }

        const showResult = () => {
            const rectangle = new PIXI.Graphics();
            rectangle.lineStyle(4, 0x009933, 1);
            rectangle.beginFill(0x000000);
            rectangle.drawRect(0, 0, container.width, container.height);
            rectangle.endFill();
            rectangle.x = 0;
            rectangle.y = 0;

            const textLost = cards.length / 2 === matchedPairs ? 'You Won!' : 'You Lost';

            const playText = new PIXI.Text(textLost, style);
            rectangle.addChild(playText);
            container.addChild(rectangle);

            const closeInfo = setInterval(function() {
                container.removeChild(rectangle);
                clearInterval(closeInfo);
                backCards.forEach(function(elem) {
                    elem.texture = textureButton;
                    elem.interactive = false;
                    container.addChild(elem);
                });
                container.addChild(btnBox);
                request(options, updateCards, failure);
            }, 2000);
        }

        const createClock = () => {
            const boxClock = new PIXI.Graphics();
            boxClock.lineStyle(4, 0x009933, 1);
            boxClock.beginFill(0x66CCFF);
            boxClock.drawRect(0, 0, 100, 55);
            boxClock.endFill();
            boxClock.x = 130;
            boxClock.y = 270;

            let timer = data.time;

            const timeCounter = setInterval(function() {
                const zeroVar = (timer < 10) ? '0' : '';
                const playText = new PIXI.Text(zeroVar + timer--, style);

                if (timer < 0 || cards.length / 2 === matchedPairs) {
                    backCards.forEach(function(elem) {
                        container.removeChild(elem);
                    });
                    container.removeChild(boxClock);
                    showResult()
                    matchedPairs = 0;
                    clearInterval(timeCounter);
                } else {
                    boxClock.addChild(playText);
                    container.addChild(boxClock);
                }
            }, 1000)

            boxClock.interactive = true;
            boxClock.buttonMode = true;
        }

        const btnBox = new PIXI.Graphics();
        btnBox.lineStyle(4, 0x009933, 1);
        btnBox.beginFill(0x66CCFF);
        btnBox.drawRect(0, 0, 100, 55);
        btnBox.endFill();
        btnBox.x = 130;
        btnBox.y = 270;

        const playText = new PIXI.Text('Start', style);
        btnBox.addChild(playText);
        container.addChild(btnBox);

        btnBox.interactive = true;
        btnBox.buttonMode = true;
        btnBox.addListener('pointerdown', function() {
            createInteractive();
            createClock();
        });

        container.x = (app.screen.width - container.width) / 3;
        container.y = (app.screen.height - container.height) / 3;
        app.stage.addChild(container);
    }

    const failure = (err) => err;

    request(options, success, failure);

    const match = (firstCard, secondCard) => {

        let matching = false;
        
        if (firstCard.texture.textureCacheIds === secondCard.texture.textureCacheIds) {
            matching = true;
            matchedPairs++;
        }
        return matching;
    }

    const update = (texture) => {
        if (firstCard === null) {
            firstCard = texture;
            countClicks++;
        } else if (secondCard === null) {
            secondCard = texture;
            countClicks++;
            if (match(firstCard, secondCard)) {
                firstCard.interactive = false;
                secondCard.interactive = false;
                firstCard = null;
                secondCard = null;
                countClicks = 0;
            } else {
                const intervalCards = setInterval(function() {
                    const textureButton = PIXI.Texture.fromImage('images/Red_back.jpg');
                    firstCard.texture = textureButton;
                    secondCard.texture = textureButton;
                    firstCard = null;
                    secondCard = null;
                    countClicks = 0;
                    clearInterval(intervalCards);
                }, 2000);
            }
        }
    }

    function eventListener(e) {
        if (countClicks < 2) {
            this.isdown = true;
            this.texture = cards[this.id];
            this.alpha = 1;
            update(this);
        }
    }
}

PIXI.loader
    .add('images/Red_back.jpg', 'images/Red_back.jpg')
    .add('images/2C.jpg', 'images/2C.jpg')
    .add('images/5H.jpg', 'images/5H.jpg')
    .add('images/10D.jpg', 'images/10D.jpg')
    .add('images/AS.jpg', 'images/AS.jpg')
    .add('images/KC.jpg', 'images/KC.jpg')
    .on('progress', loadProgressHandler)
    .on('complete', completeLoading)
    .load(onAssetsLoaded);

function resize() {
    /*
        I have left this empty, because I need a little bit more time for investigating.
        I have seen how it works the mechanism of resize, but in the implementation I have had some problems.
        What I have tried is the following:
        Outside this function, to set a size and a ratio in order to give a reference for a condition and for getting some calculations.
        In this function, start with a condition dividing window.innerWidth by window.innerHeight and compare with ratio
        Depending of the result of the condition, we will use the ratio for multiplying or dividing window.innerWidth or window.innerHeight depending of the case.
        After we attach the results to the renderer view. And we use this function in onresize event handler and calling it when the solution loads.
        For containers and elements, we need to make them proportional with these measures.
    */ 
}
window.onresize = function(event) {
    resize();
};
resize();