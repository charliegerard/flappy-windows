const startButton = document.getElementsByClassName('play')[0];
const intro = document.getElementsByTagName('main')[0];
const scoreDiv = document.getElementsByClassName('score')[0];

const resolutionWidth = screen.width;
const resolutionHeight = screen.availHeight + 23; // screen doesn't actually start at 0;

var firstObstacleWindow;
var secondObstacleWindow;
var flappyWindow;
let flappyInitialPosition;
let base;
let currentScore = 0;

window.onload = () => {
    let isMobile = checkDevice();

    if(isMobile){
        const mobileMessage = document.getElementById('mobile-message')
        mobileMessage.className += " mobile";
        intro.style.display = 'none';
    }

    flappyInitialPosition = resolutionHeight - (resolutionHeight/2);

    if(window.name === ""){
        base = window;

        startButton.onclick = () => {
            firstObstacleWindow = window.open("./firstObstacle/firstObstacle.html", "firstObstacleWindow", "menubar=no,location=no,status=1,scrollbars=no,width=100,height=400,screenX=700,screenY=0");
            secondObstacleWindow = window.open("./secondObstacle/secondObstacle.html", "secondObstacleWindow", `menubar=no,location=no,status=1,scrollbars=no,width=100,height=200,screenX=${resolutionWidth - 100},screenY=${resolutionHeight - 150}`);
            flappyWindow = window.open("./flappy/index.html", "flappyWindow", `menubar=no,location=no,status=1,scrollbars=no,width=10,height=100,screenX=10,screenY=${flappyInitialPosition}`);

            startGame();
        }
    } else {
        base = window.opener;
        flappyWindow = base.flappyWindow;
        firstObstacleWindow = base.firstObstacleWindow;
        secondObstacleWindow = base.secondObstacleWindow; 
    }

    window.addEventListener('keydown', e => {
        switch(e.keyCode){
            case 81: // q
                quit();
                break;
            case 32: // space
                upFlappy();
                break;
            case 82: // r
                restartGame();
            default:
                break;
        }
    })
}

const quit = () => {
    flappyWindow && flappyWindow.close();
    firstObstacleWindow && firstObstacleWindow.close();
    secondObstacleWindow && secondObstacleWindow.close();

    base.document.getElementsByTagName('main')[0].style.display = 'block';
    base.document.getElementsByClassName('score')[0].style.display = 'none';
}

const upFlappy = () => {
    flappyWindow.moveBy(0, -70); 
    flappyWindow.document.getElementsByClassName('jump')[0].play();
};

const moveFlappy = () => {
    flappyWindow.moveBy(0, 3);
    checkForCollision();
    calculateScore();
}

const startGame = () => {
    hideIntro();
    flappyWindow.lost = false;
    moveObstacle();
}

const hideIntro = () => {
    intro.style.display = 'none';
    scoreDiv.style.display = 'block';
}

const restartGame = () => {
    if(flappyWindow.lost){
        flappyWindow.moveTo(10, flappyInitialPosition);
        firstObstacleWindow.moveTo(700, 0);
        secondObstacleWindow.moveTo(resolutionWidth - 100, resolutionHeight - 150);
        flappyWindow.lost = false;
        displayScore(0);
        window.requestAnimationFrame(moveObstacle);
    }
}

const getRandomWindowHeight = (min, max) => {
    min = Math.ceil(min);
    max = Math.floor(max);
    return Math.floor(Math.random() * (max - min) + min)
}

const moveObstacle = () => {
    (!flappyWindow.lost) ? window.requestAnimationFrame(moveObstacle) : window.cancelAnimationFrame(moveObstacle);

    moveFlappy();
    let windows = [firstObstacleWindow, secondObstacleWindow];

    const maxHeight = resolutionHeight - 100 - 100 - 50; //height of flappy, minimum height of obstacle, extra space;
    const minHeight = 100;

    windows.forEach(singleWindow => {
        let currentXPosition = singleWindow.screenX;
        let currentYPosition = singleWindow.screenY;
    
        if(currentXPosition > 0){
            if(singleWindow.name === "secondObstacleWindow"){
                singleWindow.moveTo(currentXPosition-=3, currentYPosition);
            } else if (singleWindow.name === "firstObstacleWindow"){
                singleWindow.moveTo(currentXPosition-=3, 0);
            }
        } else {
            singleWindow.resizeTo(100, getRandomWindowHeight(minHeight, maxHeight));
            
            if(singleWindow.name === "secondObstacleWindow"){
                let currentYPosition = resolutionHeight;
                singleWindow.moveTo(resolutionWidth, currentYPosition);
            } else if (singleWindow.name === "firstObstacleWindow"){
                singleWindow.moveTo(resolutionWidth, 0);
            }
        }
    })
}

const checkForCollision = () => {
    let flappyWindowBottom = flappyWindow.screenY + flappyWindow.outerHeight;
    let flappyWindowRight = flappyWindow.screenX + flappyWindow.outerWidth;
    let firstObstacleWindowBottom = firstObstacleWindow.screenY + firstObstacleWindow.outerHeight;
    let firstObstacleWindowLeft = firstObstacleWindow.screenX;
    let secondObstacleWindowLeft = secondObstacleWindow.screenX;
    let secondObstacleWindowTop = secondObstacleWindow.screenY;

    if(flappyWindowBottom >= resolutionHeight){
        flappyWindow.lost = true;
        flappyWindow.document.getElementsByClassName('die')[0].play();
    }

    if(flappyWindow.screenY <= firstObstacleWindowBottom && firstObstacleWindowLeft <= flappyWindowRight){
        flappyWindow.lost = true;
        flappyWindow.document.getElementsByClassName('hit')[0].play();
    }

    if(flappyWindowBottom >= secondObstacleWindowTop && flappyWindowRight >= secondObstacleWindowLeft){
        flappyWindow.lost = true;
        flappyWindow.document.getElementsByClassName('hit')[0].play();
    }
}

const calculateScore = () => {
    let firstObstacleWindowLeft = firstObstacleWindow.screenX;
    let secondObstacleWindowLeft = secondObstacleWindow.screenX;
   
    if(firstObstacleWindowLeft <= 0 && !flappyWindow.lost || secondObstacleWindowLeft <= 0 && !flappyWindow.lost){
        currentScore += 1;
        displayScore(currentScore);
    }
}

const displayScore = score => {
    if(scoreDiv){
        scoreDiv.innerHTML = score;
    } else {
        base.document.getElementsByClassName('score')[0].innerHTML = score;
    }
}

const checkDevice = () => {
    let check = false;
    (function(a){if(/(android|bb\d+|meego).+mobile|avantgo|bada\/|blackberry|blazer|compal|elaine|fennec|hiptop|iemobile|ip(hone|od)|iris|kindle|lge |maemo|midp|mmp|mobile.+firefox|netfront|opera m(ob|in)i|palm( os)?|phone|p(ixi|re)\/|plucker|pocket|psp|series(4|6)0|symbian|treo|up\.(browser|link)|vodafone|wap|windows ce|xda|xiino|android|ipad|playbook|silk/i.test(a)||/1207|6310|6590|3gso|4thp|50[1-6]i|770s|802s|a wa|abac|ac(er|oo|s\-)|ai(ko|rn)|al(av|ca|co)|amoi|an(ex|ny|yw)|aptu|ar(ch|go)|as(te|us)|attw|au(di|\-m|r |s )|avan|be(ck|ll|nq)|bi(lb|rd)|bl(ac|az)|br(e|v)w|bumb|bw\-(n|u)|c55\/|capi|ccwa|cdm\-|cell|chtm|cldc|cmd\-|co(mp|nd)|craw|da(it|ll|ng)|dbte|dc\-s|devi|dica|dmob|do(c|p)o|ds(12|\-d)|el(49|ai)|em(l2|ul)|er(ic|k0)|esl8|ez([4-7]0|os|wa|ze)|fetc|fly(\-|_)|g1 u|g560|gene|gf\-5|g\-mo|go(\.w|od)|gr(ad|un)|haie|hcit|hd\-(m|p|t)|hei\-|hi(pt|ta)|hp( i|ip)|hs\-c|ht(c(\-| |_|a|g|p|s|t)|tp)|hu(aw|tc)|i\-(20|go|ma)|i230|iac( |\-|\/)|ibro|idea|ig01|ikom|im1k|inno|ipaq|iris|ja(t|v)a|jbro|jemu|jigs|kddi|keji|kgt( |\/)|klon|kpt |kwc\-|kyo(c|k)|le(no|xi)|lg( g|\/(k|l|u)|50|54|\-[a-w])|libw|lynx|m1\-w|m3ga|m50\/|ma(te|ui|xo)|mc(01|21|ca)|m\-cr|me(rc|ri)|mi(o8|oa|ts)|mmef|mo(01|02|bi|de|do|t(\-| |o|v)|zz)|mt(50|p1|v )|mwbp|mywa|n10[0-2]|n20[2-3]|n30(0|2)|n50(0|2|5)|n7(0(0|1)|10)|ne((c|m)\-|on|tf|wf|wg|wt)|nok(6|i)|nzph|o2im|op(ti|wv)|oran|owg1|p800|pan(a|d|t)|pdxg|pg(13|\-([1-8]|c))|phil|pire|pl(ay|uc)|pn\-2|po(ck|rt|se)|prox|psio|pt\-g|qa\-a|qc(07|12|21|32|60|\-[2-7]|i\-)|qtek|r380|r600|raks|rim9|ro(ve|zo)|s55\/|sa(ge|ma|mm|ms|ny|va)|sc(01|h\-|oo|p\-)|sdk\/|se(c(\-|0|1)|47|mc|nd|ri)|sgh\-|shar|sie(\-|m)|sk\-0|sl(45|id)|sm(al|ar|b3|it|t5)|so(ft|ny)|sp(01|h\-|v\-|v )|sy(01|mb)|t2(18|50)|t6(00|10|18)|ta(gt|lk)|tcl\-|tdg\-|tel(i|m)|tim\-|t\-mo|to(pl|sh)|ts(70|m\-|m3|m5)|tx\-9|up(\.b|g1|si)|utst|v400|v750|veri|vi(rg|te)|vk(40|5[0-3]|\-v)|vm40|voda|vulc|vx(52|53|60|61|70|80|81|83|85|98)|w3c(\-| )|webc|whit|wi(g |nc|nw)|wmlb|wonu|x700|yas\-|your|zeto|zte\-/i.test(a.substr(0,4)))check = true})(navigator.userAgent||navigator.vendor||window.opera);
    return check;
}