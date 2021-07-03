// Please play using https://editor.p5js.org/ryan.gohca2006/present/Jnm8g-Kpe, the preview section is too small for the whole game.
// Testing, don't change.
var testing = false;

// Constants
var allCards;
var allSeries;
var rarityThreshold = {
  'common': 0,
  'uncommon': 47,
  'rare': 79,
  'ultra rare': 99
};
var rarityColours = {
  "common": "green",
  "uncommon": "blue",
  "rare": "red",
  "ultra rare": "black",
  "exclusive": "rainbow"
};

// Game states
var availableCards = [];
var selectedCards = [];
var collectedCards;
var newCards = [];
var drawnNewCards = [];
var gameTimer = new timer.Timer();
var matchedPairs = 0;

// Concurrency States
var blockingThread = false;
var prevTime;

// DOM elements
var newGameButton;
var newCardsText;
var rarityScale;
var rarityScaleText;
var allCardsButton;
var coverBg;
var cardsPage;
var closeCollectionButton;
var seriesTitleDiv;
var cardsDiv;
var leftButtonDiv;
var rightButtonDiv;
var leftButton;
var rightButton;
var titleDiv;
var timeLeftDiv;
var claimPrizeButton;
var wonDiv;
var youWonTextDiv;
var wonCardDiv;
var wonCard;
var closeWonScreenButton;


// Collection Viewing States
var currentSeriesIdx = 0;
var viewingSeriesCards = [];


const sleep = (milliseconds) => {
  return new Promise(resolve => setTimeout(resolve, milliseconds))
}

function getRarity(num) {
  if (num >= rarityThreshold['ultra rare']) return 'ultra rare';
  else if (num >= rarityThreshold['rare']) return 'rare';
  else if (num >= rarityThreshold['uncommon']) return 'uncommon';
  else return 'common';

}

function createCloseButton() {
  newCloseButton = createButton("X");
  newCloseButton.size(50, 50);
  newCloseButton.style("background-color", "white");
  newCloseButton.style("font-size", "40px");
  newCloseButton.style("border-width", "medium");
  newCloseButton.style("border-radius", "50%");
  newCloseButton.style("cursor", "pointer");
  newCloseButton.style("font-weight", "bold");
  newCloseButton.style("outline", "none");
  newCloseButton.style("z-index", "100050");
  newCloseButton.style("float", "right");
  newCloseButton.style("position", "relative");
  newCloseButton.style("bottom", "25px");
  newCloseButton.style("left", "25px");
  return newCloseButton;
}

function setup() {
  createCanvas(1450, 735);
  
  prevTime = millis();
  allCards = images.loadAllImages();
  allSeries = images.allSeriesSortedByRarity();

  collectedCards = getItem("collectedCards");
  console.log(collectedCards);
  if (testing || collectedCards === null || !(collectedCards instanceof Array)) {
    collectedCards = new Set();
  } else {
    collectedCards = new Set(collectedCards);
  }

  newGameButton = createButton('Start new game');
  newGameButton.size(200, 50);
  newGameButton.position(0, 0);
  newGameButton.mouseClicked(startMemoryCards);
  newGameButton.style("background-color", "green");
  newGameButton.style("font-size", "23px");
  newGameButton.style("color", "white");
  newGameButton.style("cursor", "pointer");

  titleDiv = createDiv("Memory Cards");
  titleDiv.size(300, 50);
  titleDiv.position(400, 5);
  titleDiv.style("font-size", "40px");
  titleDiv.style("line-height", "50px");

  timeLeftDiv = createDiv("Time Left: ");
  timeLeftDiv.size(300, 50);
  timeLeftDiv.position(800, 5);
  timeLeftDiv.style("font-size", "30px");
  timeLeftDiv.style("line-height", "50px");

  rarityScaleText = createDiv("Rarity Scale: ");
  rarityScaleText.size(150, 50);
  rarityScaleText.style("font-size", "20px");
  rarityScaleText.style("line-height", rarityScaleText.style("height"));
  rarityScaleText.position(20, height - 50);
  rarityScale = createImg("images/rarity_scale.png", "rarity scale");
  rarityScale.position(150, height - 55);

  claimPrizeButton = createButton("Claim Your Prize");
  claimPrizeButton.size(200, 50);
  claimPrizeButton.position(850, height - 55);
  claimPrizeButton.style("font-size", "23px");
  claimPrizeButton.style("border-radius", "10px");
  claimPrizeButton.style("outline", "none");
  claimPrizeButton.attribute("disabled", "true");
  claimPrizeButton.style("cursor", "default");
  claimPrizeButton.mouseClicked(showWonCard);

  newCardsText = createDiv("New Cards Collected");
  newCardsText.position(1080, 0);
  newCardsText.size(1450 - 1080, 75);
  newCardsText.style("font-size", "25px");
  newCardsText.style("text-align:center;")
  newCardsText.style("line-height", newCardsText.style("height"));
  newCardsText.style("text-decoration:underline;");

  allCardsButton = createButton("View All Cards");
  allCardsButton.position(1080 + (width - 1080 - 200) / 2, 75);
  allCardsButton.size(200, 50);
  allCardsButton.id("allCardsButton");
  allCardsButton.style("font-size", "18px");
  allCardsButton.style("background", "linear-gradient(to bottom, #ededed 5%, #bab1ba 100%)");
  allCardsButton.style("background-color", "#ededed");
  allCardsButton.style("border-width", "medium");
  allCardsButton.style("border-radius", "15px");
  allCardsButton.style("outline", "none");
  allCardsButton.style("cursor", "pointer");
  allCardsButton.mouseOver(function() {
    allCardsButton.style("background", "linear-gradient(to bottom, #bab1ba 5%, #ededed 100%");
    allCardsButton.style("background-color", "#bab1ba");
  });
  allCardsButton.mouseOut(function() {
    allCardsButton.style("background", "linear-gradient(to bottom, #ededed 5%, #bab1ba 100%)");
    allCardsButton.style("background-color", "#ededed");
  });
  allCardsButton.mouseClicked(showCollection);
  allCardsButton.show();

  coverBg = createDiv();
  coverBg.position(0, 0);
  coverBg.size(width, height);
  coverBg.style("background: rgba(0, 0, 0, 0.5); z-index: 100000;");
  coverBg.hide();

  cardsPage = createDiv();
  cardsPage.size(1000, 600);
  cardsPage.position((width - cardsPage.size().width) / 2, height + 60);
  cardsPage.style("background-color", "silver");
  cardsPage.style("z-index", "100001");
  cardsPage.style("background", "linear-gradient(to bottom, #ededed 5%, #bab1ba 100%)");
  cardsPage.style("background-color", "#ededed");

  closeCollectionButton = createCloseButton();
  cardsPage.child(closeCollectionButton);
  closeCollectionButton.mouseClicked(hideCollection);

  seriesTitleDiv = createDiv("");
  seriesTitleDiv.size(cardsPage.size().width, 100);
  seriesTitleDiv.style("font-size", "50px");
  seriesTitleDiv.style("text-align", "center");
  seriesTitleDiv.style("line-height", seriesTitleDiv.style("height"));

  cardsPage.child(seriesTitleDiv);

  cardsDiv = createDiv("");
  cardsDiv.size(cardsPage.size().width - 100, cardsPage.size().height - seriesTitleDiv.size().height);

  cardsPage.child(cardsDiv);
  cardsDiv.style("position", "relative");
  cardsDiv.style("left", "50px");

  leftButtonDiv = createDiv("");
  leftButtonDiv.size(50, cardsPage.size().height);

  cardsPage.child(leftButtonDiv);
  leftButtonDiv.position(0, 0);

  leftButton = createButton("");
  leftButton.size(0, 0);
  leftButton.style("background", "transparent");
  leftButton.style("border-top", "20px solid transparent");
  leftButton.style("border-right", "40px solid #555");
  leftButton.style("border-bottom: 20px solid transparent");
  leftButton.style("border-left", "none");
  leftButton.style("cursor", "pointer");
  leftButton.style("outline", "none");
  leftButton.style("position", "absolute");
  leftButton.style("top", "50%");
  leftButton.style("transform", "translateY(-50%)");
  leftButton.mouseClicked(prevCollection);

  leftButtonDiv.child(leftButton);

  rightButtonDiv = createDiv("");
  rightButtonDiv.size(50, cardsPage.size().height);

  cardsPage.child(rightButtonDiv);
  rightButtonDiv.position(cardsPage.size().width - 50, 0);

  rightButton = createButton("");
  rightButton.size(0, 0);
  rightButton.style("background", "transparent");
  rightButton.style("border-top", "20px solid transparent");
  rightButton.style("border-left", "40px solid #555");
  rightButton.style("border-bottom: 20px solid transparent");
  rightButton.style("border-right", "none");
  rightButton.style("cursor", "pointer");
  rightButton.style("outline", "none");
  rightButton.style("position", "absolute");
  rightButton.style("top", "50%");
  rightButton.style("transform", "translateY(-50%)");
  rightButton.mouseClicked(nextCollection);

  rightButtonDiv.child(rightButton);

  cardsPage.hide();

  wonDiv = createDiv("");
  wonDiv.size(250, 400);
  wonDiv.position((width - wonDiv.size().width) / 2, height + 60);
  wonDiv.style("background-color", "silver");
  wonDiv.style("z-index", "100001");
  wonDiv.style("background", "linear-gradient(to bottom, #ededed 5%, #bab1ba 100%)");
  wonDiv.style("background-color", "#ededed");
  
  closeWonScreenButton = createCloseButton();
  wonDiv.child(closeWonScreenButton);
  closeWonScreenButton.mouseClicked(hideWonCard);

  youWonTextDiv = createDiv("You won: ");
  youWonTextDiv.size(wonDiv.size().width - 15, 100);
  youWonTextDiv.position(15, 0);
  youWonTextDiv.style("font-size", "50px");
  youWonTextDiv.style("text-align", "center");
  youWonTextDiv.style("line-height", youWonTextDiv.style("height"));

  wonDiv.child(youWonTextDiv);

  wonCardDiv = createDiv("");
  wonCardDiv.size(wonDiv.size().width, wonDiv.size().height - 100);

  wonDiv.child(wonCardDiv);

  wonDiv.hide();

}

function prevCollection() {
  if (currentSeriesIdx == 0) currentSeriesIdx = allSeries.length - 1;
  else currentSeriesIdx -= 1;
  drawCollectedCards(...allSeries[currentSeriesIdx]);
}

function nextCollection() {
  currentSeriesIdx = (currentSeriesIdx + 1) % allSeries.length;
  drawCollectedCards(...allSeries[currentSeriesIdx]);
}

async function showWonCard() {
  claimPrizeButton.attribute("disabled", "true");
  claimPrizeButton.style("cursor", "default");
  coverBg.show();
  wonDiv.show();
  var rarity = random(1, 101) <= 20 ? "exclusive" : "ultra rare";
  var wonCardImg = gameCards.randomCard(rarity);
  collectedCards.add(wonCardImg);
  wonCard = new gameCards.Card((wonDiv.size().width - (125 + 35)) / 2, 100, wonCardImg, false);
  wonCard.changeSizeBy(35);
  wonCard.draw();
  wonCard.card.attribute("disabled", "true");
  wonCard.card.style("cursor", "default");
  if (rarity === "exclusive"){
    wonCard.card.style("background", "linear-gradient(to right, orange , yellow, green, cyan, blue, violet)");
    wonCard.nameDiv.style("font-size:20px;color:black;");
  } else {
    wonCard.card.style("background-color", rarityColours[wonCard.rarity]);
    wonCard.nameDiv.style("font-size:20px;color:white;");
  }
  wonCardDiv.child(wonCard.card);
  await moveElementUpTo(wonDiv, (height - wonDiv.size().height) / 2);

}

async function hideWonCard(){
  if (blockingThread) return;
  await moveElementUpTo(wonDiv, -wonDiv.size().height);
  wonDiv.position((width - wonDiv.size().width) / 2, height + 60);
  wonCard.destroy();
  wonDiv.hide();
  coverBg.hide();
}
async function startMemoryCards() {
  for (var card of availableCards) card.destroy();
  claimPrizeButton.style("cursor", "default");
  claimPrizeButton.attribute("disabled", "true");
  matchedPairs = 0;
  availableCards = gameCards.generate18Cards();
  selectedCards = [];
  newCards = [];
  for (card of drawnNewCards) {
    card.destroy();
  }
  drawnNewCards = [];
  allCardsButton.position(1080 + (width - 1080 - 200) / 2, 75);
  await gameTimer.stopTimer();
  gameTimer.startTimer(200, function(timeLeft) {
    timeLeftDiv.html("Time Left: " + timeLeft + "s");
  }, function() {
    timeLeftDiv.html("Time Left: Time's Up!");
    for (var card of availableCards) card.destroy();
    availableCards = [];
    selectedCards = [];
  });
}

async function moveElementUpTo(elem, desty) {
  while (elem.position().y > desty) {
    elem.position(elem.position().x, elem.position().y - 13);
    elem.show();
    blockingThread = true;
    await sleep(10).then(() => {
      blockingThread = false;
    });
  }
  elem.position(elem.position().x, desty);
}

function drawCollectedCards(rarity, series) {
  for (var card of viewingSeriesCards) card.destroy();
  seriesTitleDiv.html(series + " (" + rarity + ")");
  var seriesCards = allCards[rarity][series];
  var cardx = 125,
    cardy = 0;
  for (var i = 1; i <= seriesCards.length; i++) {
    var collected = collectedCards.has(seriesCards[i - 1]);
    var resultantCard = new gameCards.Card(cardx, cardy, seriesCards[i - 1], !collected);
    resultantCard.card.attribute("disabled", "true");
    cardsDiv.child(resultantCard.card);
    resultantCard.draw();
    if (collected){
      if (rarity === "exclusive"){
        resultantCard.card.style("background", "linear-gradient(to right, orange , yellow, green, cyan, blue, violet)");
        resultantCard.nameDiv.style("font-size:20px;color:black;");
      } else {
        resultantCard.card.style("background-color", rarityColours[rarity]);
        resultantCard.nameDiv.style("font-size:20px;color:white;");
      }
    }
    resultantCard.card.style("cursor", "default");
    viewingSeriesCards.push(resultantCard);
    cardx += resultantCard.length + 50;
    if (i % 4 == 0) {
      cardx = 125;
      cardy += resultantCard.breadth + 35;
    }
  }
}
async function hideCollection() {
  if (blockingThread) return;
  await moveElementUpTo(cardsPage, -cardsPage.size().height);
  cardsPage.position(cardsPage.position().x, height + 60);
  cardsPage.hide();
  coverBg.hide();
}

async function showCollection() {
  coverBg.show();
  cardsPage.show();
  currentSeriesIdx = 0;
  drawCollectedCards(...allSeries[currentSeriesIdx]);
  await moveElementUpTo(cardsPage, (height - cardsPage.size().height) / 2);
}

async function mouseClicked() {
  if (blockingThread) return;
  for (var card of availableCards) {
    if (!card.show || coverBg.style("display") == "block") continue;
    if (card.isTouchingMouse() && !card.flipped() && selectedCards.length < 2) {
      await card.flip(true);
      selectedCards.push(card);
      if (selectedCards.length == 2) {
        if (selectedCards[0].equalTo(selectedCards[1])) {
          selectedCards[0].disappear();
          await selectedCards[1].disappear();
          matchedPairs++;
          selectedCards[0].show = selectedCards[1].show = false;
          var cardId = selectedCards[0].img.attribute("src");
          if (!collectedCards.has(cardId)) {
            collectedCards.add(cardId);
            newCards.push(cardId);
            updateNewCards();
          }
          selectedCards = [];
        } else {
          selectedCards[0].flip(true);
          selectedCards[1].flip(true);
          selectedCards = [];
        }
        return;
      } else {
        return;
      }
    }
  }
}

function updateNewCards() {
  var cardx = 1080,
    cardy = 75;
  for (var i = 1; i <= newCards.length; i++) {
    if (i > drawnNewCards.length) {
      card = new gameCards.Card(cardx, cardy, newCards[i - 1], false);
      card.changeSizeBy(-20);
      card.card.attribute("disabled", "true");
      if (card.rarity == "exclusive"){
        card.card.style("background", "linear-gradient(to right, orange , yellow, green, cyan, blue, violet)");
        card.nameDiv.style("font-size:20px;color:black;");
      } else {
        card.card.style("background-color", rarityColours[card.rarity]);
        card.nameDiv.style("font-size:20px;color:white;");
      }
      card.card.style("cursor", "default");
      
      card.draw();
      drawnNewCards.push(card);
    }
    cardx += drawnNewCards[0].length + 20;
    if (i % 3 == 0) {
      cardx = 1080;
      cardy += drawnNewCards[0].breadth + 30;
    }
  }
  var buttony;
  if (i == 0 || i % 3 == 1) {
    buttony = cardy;
  } else {
    buttony = cardy + drawnNewCards[0].breadth + 30;
  }
  var buttonx = 1080 + (width - 1080 - allCardsButton.size().width) / 2;
  allCardsButton.position(buttonx, buttony);
  allCardsButton.show();
}

function draw() {
  if (blockingThread) return;
  background(235);
  for (var card of availableCards) {
    card.draw();
  }
  if (millis() > prevTime + 1000) {
    prevTime = millis();
    storeItem("collectedCards", Array.from(collectedCards));
  }
  if (matchedPairs == 9) {
    gameTimer.stopTimer();
    timeLeftDiv.html("Time Left: You Win!");
    claimPrizeButton.removeAttribute("disabled");
    claimPrizeButton.style("cursor", "pointer");
    matchedPairs = 0; // stop this from running too many times
  }
}