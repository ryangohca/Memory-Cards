var gameCards = (function() {
  class Card {
    constructor(x, y, img = null, back = true) {
      this.length = 125;
      this.breadth = 175;
      this.insertPic(img);
      this.back = back;
      this.x = x;
      this.y = y;
      this.card = this.createCard();
      this.show = true;
      this.qnMarkHeight = 100;
    }

    insertPic(img) {
      if (img == null) {
        this.img = null;
        return;
      }
      var path = img.split('/');
      this.rarity = path[1];
      var imageName = path[path.length - 1].split('.')[0];
      this.series = imageName.substr(0, imageName.length - 1);
      this.img = createImg(img, '');
      this.img.style("max-width: 100%; max-height: 70%;");
      this.img.style("margin-left: auto; margin-right: auto;");
      this.img.hide();
    }

    createText() {
      this.qnMark = createDiv('?');
      this.qnMark.style('color', 'gray');
      this.qnMark.style("font-size", "100px");
      this.qnMark.hide();
      this.nameDiv = createDiv(this.series);
      this.nameSize = 20;
      this.nameDiv.style('font-size', "20px");
      this.nameDiv.style('word-wrap', 'break-word');
      this.nameDiv.hide();
    }

    createCard() {
      var card = createButton('');
      card.position(this.x, this.y);
      card.size(this.length, this.breadth);
      card.style("background-color", "aqua");
      card.style("border", "none");
      card.style("border-radius", "20px");
      card.style("outline", "none");
      card.style("cursor", "pointer");
      this.createText();
      card.child(this.qnMark);
      card.child(this.nameDiv);
      card.child(this.img);
      card.hide();
      return card;
    }

    draw() {
      if (this.show) {
        this.card.show();
        if (this.back) {
          this.card.style("cursor", "pointer");
          this.qnMark.show();
          this.nameDiv.hide();
          this.img.hide();
        } else {
          this.card.style("cursor", "default");
          this.qnMark.hide();
          this.nameDiv.show();
          this.img.show();
        }
      } else {
        this.card.hide();
      }
    }

    setCoordinates(nx, ny) {
      this.x = nx;
      this.y = ny;
      this.card.position(this.x, this.y);
    }

    changeSizeBy(px) {
      this.length += px;
      this.breadth += px;
      this.card.size(this.length, this.breadth);
      this.qnMarkHeight += px;
      this.qnMark.style("font-size:" + this.qnMarkHeight + "px;");
      this.nameSize += px / 5;
      this.nameDiv.style("font-size", this.nameSize + "px");
    }

    async appear() {
      for (var i = 0; i < 5; i++) {
        this.card.hide();
        this.setCoordinates(this.x - 10, this.y - 10);
        this.changeSizeBy(20);
        this.draw();
        blockingThread = true;
        await sleep(100).then(() => {
          blockingThread = false;
        });
      }
    }

    async disappear() {
      for (var i = 0; i < 5; i++) {
        this.card.hide();
        this.setCoordinates(this.x + 10, this.y + 10);
        this.changeSizeBy(-20);
        this.draw();
        blockingThread = true;
        await sleep(100).then(() => {
          blockingThread = false;
        });
      }
      this.card.hide();
    }

    async flip(animate = false) {
      if (!animate) {
        this.back = !this.back;
        this.draw();
      } else {
        await this.disappear();
        this.back = !this.back;
        await this.appear();
      }
    }

    isTouchingMouse() {
      return this.x <= mouseX && mouseX <= this.x + this.length && this.y <= mouseY && mouseY <= this.y + this.breadth;
    }

    flipped() {
      return !this.back;
    }

    equalTo(other) {
      return this.img.attribute("src") == other.img.attribute("src");
    }

    destroy() {
      this.card.remove();
    }
  }

  function randomCard(rarity) {
    var series = allCards[rarity];
    var chosenSeries = random(Object.keys(series));
    var chosenImgIdx = int(random(0, series[chosenSeries].length));
    var chosenImg = series[chosenSeries][chosenImgIdx];
    return chosenImg;
  }

  function generate18Cards() {
    var chosen = [];
    while (chosen.length < 18) {
      var isExclusive = random(1, 10000) >= 9999;
      var rarity = "exclusive";
      if (!isExclusive){
        rarity = getRarity(random(1, 100 + 1));
      } else {
        console.log("exclusive"); 
      }
      var chosenImg = randomCard(rarity);
      console.log(chosenImg);
      if (chosen.includes(chosenImg)) continue;
      chosen.push(chosenImg);
      chosen.push(chosenImg);
    }
    if (!testing) chosen = shuffle(chosen);
    createdCards = [];
    var cardx = 50,
      cardy = 75;
    for (var i = 1; i <= 18; i++) {
      var resultantCard = new Card(cardx, cardy, chosen[i - 1]);
      createdCards.push(resultantCard);
      cardx += resultantCard.length + 50;
      if (i % 6 == 0) {
        cardx = 50;
        cardy += resultantCard.breadth + 35;
      }
    }
    return createdCards;
  }

  return {
    "Card": Card,
    "randomCard": randomCard,
    "generate18Cards": generate18Cards,
  };
})();