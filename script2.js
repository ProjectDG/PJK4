// Fetch the JSON data
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
        // Remove common phrases
        .replace(/\b(topped with|top with|drops|dashes|dash|float|floated|splash|pinch|to taste|as needed|garnish(ed)?( with)?)\b/g, '')
        // Remove measurements
        .replace(/\d+(\.\d+)?\s*(oz|ml|tsp|tbsp|teaspoon|tablespoon|parts)?/gi, '')
        // Remove anything in parentheses
        .replace(/\(.*?\)/g, '')
        // Remove punctuation
        .replace(/[^\w\s]/g, '')
        // Collapse multiple spaces
        .replace(/\s+/g, ' ')
        .trim();
    }
    

    function toCamelCase(str) {
      return str.toLowerCase().split(' ').map(function(word, index) {
        return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
      }).join('');
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
    let inventory = data[0].inventory[0].items;

    function createButtons(navID) {
      const camelCaseInventory = inventory.map(item => toCamelCase(sanitizeIngredient(item)));

      drinkInfo.forEach(drink => {
        if (navID !== drink.section && !(navID === "searchDrinks" && drink.section === "searchDrinks")) return;

        let missingItems = [];

        Object.keys(drink).forEach(key => {
          if (["wine", "liquor", "liqueur", "vermouth", "mixers"].includes(key) && Array.isArray(drink[key])) {
            const missing = drink[key].filter(item => {
              const normalizedItem = toCamelCase(sanitizeIngredient(item));
              return !camelCaseInventory.includes(normalizedItem);
            });
            missingItems = missingItems.concat(missing);
          }
        });

        const container = navID === "searchDrinks" ? "#searchListDiv" : "#mainContainer";
        const button = d3.select(container)
          .append("button")
          .text(drink.name)
          .attr("class", "button drink-buttons")
          .attr("id", drink.name);

        if (missingItems.length > 0) {
          button.classed("missing", true);
        }

        const strippedMissing = missingItems.map(item => sanitizeIngredient(item));
        console.log(`${drink.name} missing:`, strippedMissing);
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
            const isMissing = !inventory.map(i => toCamelCase(sanitizeIngredient(i))).includes(sanitized);
    
            // Apply red color only for ingredients, not for glass or garnish
            if (key !== "glass" && key !== "garnish") {
              d3.select("#" + key + "Recipe")
                .append("p")
                .attr("id", val)
                .attr("class", "recipe")
                .style("color", isMissing ? "red" : null)
                .text(val);
            } else {
              d3.select("#" + key + "Recipe")
                .append("p")
                .attr("id", val)
                .attr("class", "recipe")
                .style("color", null)  // No color change for glass or garnish
                .text(val);
            }
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
            d3.select("#searchListDiv").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);
          });
        } else {
          d3.select("#searchListDiv").append("p").text("...No drinks found...").attr("class", "error-message");
        }
      } else {
        $("#searchListDiv").empty();
        drinkInfo.forEach(x => {
          if (x.section === "searchDrinks") {
            d3.select("#searchListDiv").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);
          }
        });
      }
    });

    $('body').on('click', '#clearButton', function() {
      // Clear the search input field
      $("#searchInput").val("");
    
      // Empty the search list div
      $("#searchListDiv").empty();
    
      // Filter drinks that belong to the "searchDrinks" section
      const searchDrinks = drinkInfo.filter(drink => drink.section === "searchDrinks");
    
      // Rebuild the buttons for drinks in the "searchDrinks" section
      searchDrinks.forEach(drink => {
        let missingItems = [];
        const camelCaseInventory = inventory.map(item => toCamelCase(sanitizeIngredient(item)));
    
        // Check for missing ingredients
        Object.keys(drink).forEach(key => {
          if (["wine", "liquor", "liqueur", "vermouth", "mixers"].includes(key) && Array.isArray(drink[key])) {
            const missing = drink[key].filter(item => {
              const normalizedItem = toCamelCase(sanitizeIngredient(item));
              return !camelCaseInventory.includes(normalizedItem);
            });
            missingItems = missingItems.concat(missing);
          }
        });
    
        // Create the button for each search drink
        const container = "#searchListDiv";
        const button = d3.select(container)
          .append("button")
          .text(drink.name)
          .attr("class", "button drink-buttons")
          .attr("id", drink.name);
    
        // Apply missing class if there are missing ingredients
        if (missingItems.length > 0) {
          button.classed("missing", true);
        }
    
        const strippedMissing = missingItems.map(item => sanitizeIngredient(item));
        console.log(`${drink.name} missing:`, strippedMissing);
      });
    });
    

    $('body').on("click", ".recipe", function () {
      let thisID = this.id.toLowerCase();
      let matchedItem = null;
    
      inventory.forEach(i => {
        let a = thisID.replace(/[^a-zA-Z]|oz|float|dashes|\d/gi, ' ');
        let b = i.toLowerCase().replace(/[^a-zA-Z]|oz|float|dashes|\d/gi, ' ');
        const camelCaseStringA = toCamelCase(a);
        const camelCaseStringB = toCamelCase(b);
    
        if (camelCaseStringA === camelCaseStringB) {
          matchedItem = i;
        }
      });
    
      if (matchedItem) {
        d3.select("body").append("div").attr("id", "modalBG");

        const modal = d3.select("#modalBG")
          .append("div")
          .attr("id", "modalContent")
          .attr("class", "modal-content");

        // Title above everything
        modal.append("h2")
          .attr("class", "modal-title")
          .text(matchedItem);

        // Flex container for image + side info
        const modalFlex = modal.append("div")
          .attr("class", "modal-flex");

        // Image on the left
        modalFlex.append("img")
          .attr("class", "modal-image")
          .attr("src", "./images/" + toCamelCase(sanitizeIngredient(matchedItem)) + ".png");

        // Right column for alternatives + description
        const modalRight = modalFlex.append("div")
          .attr("class", "modal-right");

        // Alternatives section
        modalRight.append("div")
          .attr("class", "modal-alternatives")
          .append("p")
          .attr("class", "modal-alt-title")
          .text("Similar or Alternative Options:");

        modalRight.append("ul")
          .attr("class", "modal-alt-list")
          .selectAll("li")
          .data(["Example Alternative 1", "Example Alternative 2"])
          .enter()
          .append("li")
          .text(d => d);

        // Description section
        modalRight.append("p")
          .attr("class", "modal-description")
          .text("Description coming soon...");

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
