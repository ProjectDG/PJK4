fetch('data.json')
.then(response => {
  if (!response.ok) throw new Error('Network response was not ok');
  return response.json();
})
.then(data => {
  var elem = document.getElementsByTagName("BODY")[0];

  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) {
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) {
      elem.msRequestFullscreen();
    }
  }

  $('body').on('click', 'button', function() {
    openFullscreen();
  });

  $(document).ready(function() {

    function sanitizeIngredient(str) {
      return str.toLowerCase()
        .replace(/\b(topped with|top with|drops|dashes|dash|float|floated|splash|pinch|to taste|to|as needed|garnish(ed)?( with)?)\b/g, '')
        .replace(/\d+(\.\d+)?\s*(oz|ml|tsp|tbsp|teaspoon|tablespoon|parts)?/gi, '')
        .replace(/\(.*?\)/g, '')
        .replace(/[^\w\s]/g, '')
        .replace(/\s+/g, ' ')
        .trim();
    }

    function toCamelCase(str) {
      return str.toLowerCase().split(' ').map(function(word, index) {
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      }).join('');
    }

    function toTitleCase(str) {
      return str.replace(/\w\S*/g, txt => txt.charAt(0).toUpperCase() + txt.substr(1));
    }

    function initialize() {
      d3.select("body").append("div").attr("id", "topNav");
      d3.select("#topNav").append("button").text("Cocktails").attr("class", "button nav-buttons").attr("id", "cocktails");
      d3.select("#topNav").append("button").text("Originals").attr("class", "button nav-buttons").attr("id", "originals");
      d3.select("body").append("div").attr("id", "mainContainer");
      d3.select("body").append("div").attr("id", "bottomNav");
      d3.select("#bottomNav").append("button").text("Search Drinks").attr("class", "button nav-buttons").attr("id", "searchDrinks");
    }

    initialize();

    let drinkInfo = data[0].drinks;

    // Flatten inventory structure
    let inventoryRaw = data[0].inventory;
    let inventoryItems = [];
    let missingItems = [];

    inventoryRaw.forEach(group => {
      if (group.category === "Missing Ingredients") {
        group.items.forEach(item => missingItems.push(item));
      } else {
        group.items.forEach(item => inventoryItems.push(item));
      }
    });

    const allInventoryItems = inventoryItems.concat(missingItems);

    const inventoryNamesCamel = inventoryItems.map(i => toCamelCase(sanitizeIngredient(i.name)));
    const missingItemNamesCamel = missingItems.map(i => toCamelCase(sanitizeIngredient(i.name)));

    function renderDrinkButton(drink, containerSelector) {
      let missingItemsFound = [];

      Object.keys(drink).forEach(key => {
        if (["wine", "liquor", "liqueur", "vermouth", "mixers"].includes(key) && Array.isArray(drink[key])) {
          const missing = drink[key].filter(item => {
            const normalizedItem = toCamelCase(sanitizeIngredient(item));
            return !inventoryNamesCamel.includes(normalizedItem);
          });
          missingItemsFound = missingItemsFound.concat(missing);
        }
      });

      const button = d3.select(containerSelector)
        .append("button")
        .text(drink.name)
        .attr("class", "button drink-buttons")
        .attr("id", drink.name);

      if (missingItemsFound.length > 0) {
        button.classed("missing", true);
      }

      const strippedMissing = missingItemsFound.map(item => sanitizeIngredient(item));
      console.log(`${drink.name} missing:`, strippedMissing);
    }

    function createButtons(navID) {
      drinkInfo.forEach(drink => {
        if (navID !== drink.section && !(navID === "searchDrinks" && drink.section === "searchDrinks")) return;

        const container = navID === "searchDrinks" ? "#searchListDiv" : "#mainContainer";
        renderDrinkButton(drink, container);
      });
    }

    createButtons("cocktails");

    $('body').on('click', '#cocktails, #originals', function() {
      $("#mainContainer").empty();
      createButtons(this.id);
    });

    $('#searchDrinks').on('click', function() {
      $("#mainContainer").empty();
      d3.select("#mainContainer").append("div").attr("id", "searchDiv");
      d3.select("#searchDiv").append("input").attr("id", "searchInput").attr("placeholder", "search...");
      d3.select("#searchDiv").append("button").attr("id", "clearButton").text("Clear");
      d3.select("#mainContainer").append("div").attr("id", "searchListDiv");
      createButtons(this.id);
    });

    $('body').on('click', '.drink-buttons', function() {
      $("#mainContainer").empty();
      const drinkID = this.id;
      const drink = drinkInfo.find(x => x.name === drinkID);
      if (!drink) return;

      d3.select("#mainContainer").append("div").attr("id", "drinkInfoContainer");
      d3.select("#drinkInfoContainer").append("div").attr("id", "cardTitle").text(drink.name);
      d3.select("#drinkInfoContainer").append("div").attr("id", "drinkInfo");
      d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkPhoto");

      if (drink.photo !== null) {
        d3.select("#drinkPhoto").append("img").attr("class", "drink-photo").attr("src", "./images/" + drink.photo + ".png");
      } else {
        d3.select("#drinkPhoto").append("p").text("Please Upload Photo").style("color", "antiquewhite").style("font-size", "3vh").style("margin", "3%");
      }

      d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkRecipeDiv");
      d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkInstructionsDiv");

      Object.keys(drink).forEach(key => {
        if (["instructions", "batch", "alt. batch"].includes(key) && drink[key] !== null) {
          d3.select("#drinkInstructionsDiv").append("div").attr("class", "instructions-title").attr("id", "drinkInstructionsTitle").text(key.toUpperCase());
          drink[key].forEach(instruction => {
            d3.select("#drinkInstructionsDiv").append("li").attr("class", "instructions").text(instruction);
          });
        }

        if (["name", "section", "photo", "instructions", "batch", "alt. batch"].includes(key)) return;

        if (drink[key] !== null) {
          d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", key + "Title");
          d3.select("#" + key + "Title").append("div").attr("class", "recipe-title-div").attr("id", key);
          d3.select("#" + key).append("p").attr("class", "recipe-title").text(key.toUpperCase() + ":");
          d3.select("#" + key).append("div").attr("class", "drink-recipe").attr("id", key + "Recipe");

          drink[key].forEach(val => {
            const sanitized = toCamelCase(sanitizeIngredient(val));
            const isMissing = !inventoryNamesCamel.includes(sanitized);

            d3.select("#" + key + "Recipe")
              .append("p")
              .attr("id", val)
              .attr("class", "recipe")
              .style("color", key !== "glass" && key !== "garnish" && isMissing ? "red" : null)
              .text(val);
          });
        }
      });
    });

    document.addEventListener("input", (e) => {
      let value = e.target.value;
      if (value && value.trim().length > 0) {
        value = value.trim().toLowerCase().replace(/[^\w\s]/gi, "");
        $("#searchListDiv").empty();
        let filteredDrinks = drinkInfo.filter(x => x.name.toLowerCase().replace(/[^\w\s]/gi, "").includes(value));

        if (filteredDrinks.length > 0) {
          filteredDrinks.forEach(x => {
            renderDrinkButton(x, "#searchListDiv");
          });
        } else {
          d3.select("#searchListDiv")
            .append("p")
            .text("...No drinks found...")
            .attr("class", "error-message");
        }
      } else {
        $("#searchListDiv").empty();
        drinkInfo.forEach(x => {
          if (x.section === "searchDrinks") {
            renderDrinkButton(x, "#searchListDiv");
          }
        });
      }
    });

    $('body').on('click', '#clearButton', function() {
      $("#searchInput").val("");
      $("#searchListDiv").empty();
      const searchDrinks = drinkInfo.filter(drink => drink.section === "searchDrinks");
      searchDrinks.forEach(drink => {
        renderDrinkButton(drink, "#searchListDiv");
      });
    });

    $('body').on("click", ".recipe", function () {
      const parentId = $(this).closest(".drink-recipe").attr("id");
      const ignoredCategories = ["glassRecipe", "garnishRecipe", /*"mixersRecipe"*/];
      if (ignoredCategories.includes(parentId)) return;

      const clickedIngredient = this.id;
      const sanitizedClicked = sanitizeIngredient(clickedIngredient);
      const camelClicked = toCamelCase(sanitizedClicked);

      let matchedItem = null;
      let matchedData = null;

      for (let i of allInventoryItems) {
        const sanitizedInventory = sanitizeIngredient(i.name);
        const camelInventory = toCamelCase(sanitizedInventory);
        if (camelInventory === camelClicked || camelInventory.includes(camelClicked)) {
          matchedItem = i.name;
          matchedData = i;
          break;
        }
      }

      const itemName = toTitleCase(matchedItem || sanitizeIngredient(clickedIngredient));

      d3.select("body").append("div").attr("id", "modalBG");

      const modal = d3.select("#modalBG")
        .append("div")
        .attr("id", "modalContent")
        .attr("class", "modal-content");

      const modalTitleDiv = d3.select(".modal-content")
        .append("div")
        .attr("id", "modalTitleDiv")
        .attr("class", "modal-title-div");

      modalTitleDiv.append("h2").attr("class", "modal-title").text(itemName);

      const modalFlex = modal.append("div").attr("class", "modal-flex");

      modalFlex.append("img")
        .attr("class", "modal-image")
        .attr("src", "./images/" + camelClicked + ".png")
        .on("error", function () {
          d3.select(this).attr("src", "./images/placeholder.png");
        });

      const modalRight = modalFlex.append("div").attr("class", "modal-right");

      const altDiv = modalRight.append("div").attr("class", "modal-alternatives");
      altDiv.append("p").attr("class", "modal-alt-title").text("Similar or Alternative Options:");
      const altList = altDiv.append("ul").attr("class", "modal-alt-list");

      if (matchedData?.alternatives?.length > 0) {
        altList.selectAll("li").data(matchedData.alternatives).enter().append("li").attr("class", "modal-li").text(d => d);
      } else {
        altList.append("li").text("No alternatives available.");
      }

      const descDiv = modalRight.append("div").attr("class", "modal-alternatives");
      descDiv.append("p").attr("class", "modal-alt-title").text("Description:");
      const descList = descDiv.append("ul").attr("class", "modal-alt-list");

      if (matchedData?.description?.length > 0) {
        descList.selectAll("li").data(matchedData.description).enter().append("li").attr("class", "modal-li").text(d => d);
      } else {
        descList.append("li").text("No description available.");
      }
    });

    

    $('body').on('click', '#modalBG', function() {
      $("#modalBG").remove();
    });

  });
})
.catch(error => {
  console.error('There was a problem fetching the mainSections:', error);
});
