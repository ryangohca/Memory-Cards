var images = (function() {
  var allCards = {
    "common": {
      "spoon": 4,
      "sofa": 7,
    },
    "uncommon": {
      "phone": 4,
      "garden": 4,
    },
    "rare": {
      "family": 4,
      "childhood games": 8,
    },
    "ultra rare": {
      "toilet bowl": 4,
      "sink": 5,
      "money": 8,
    },
    "exclusive": {
      "badge": 6, 
    }
  };

  function loadAllImages() {
    // There is a better way to do this, just not online.
    var images = {};
    for (var rarity in allCards) {
      images[rarity] = {};
      for (var name in allCards[rarity]) {
        images[rarity][name] = [];
        for (var i = 1; i <= allCards[rarity][name]; i++) {
          images[rarity][name].push("images/" + rarity + "/" + name + i + ".jpg");
        }
      }
    }
    return images;
  }

  function allSeriesSortedByRarity() {
    var sortedSeries = [];
    for (var rarity in allCards) {
      var thisRaritySeries = [];
      for (var series in allCards[rarity]) {
        thisRaritySeries.push([rarity, series]);
      }
      thisRaritySeries.sort(function(a, b) {
        if (a[1] < b[1]) return -1;
        else if (a[1] > b[1]) return 1;
        else return 0;
      });
      sortedSeries.push(...thisRaritySeries);
    }
    return sortedSeries;
  }

  return {
    "loadAllImages": loadAllImages,
    "allSeriesSortedByRarity": allSeriesSortedByRarity,
  };
})();