
// Fetch the JSON data
fetch('data.json')
.then(response => {
  // Check if the response is ok, else throw an error
  if (!response.ok) {
    throw new Error('Network response was not ok');
  }
  return response.json();
})

.then(data => {



  var elem = document.getElementsByTagName("BODY")[0];
  function openFullscreen() {
    if (elem.requestFullscreen) {
      elem.requestFullscreen();
    } else if (elem.webkitRequestFullscreen) { /* Safari */
      elem.webkitRequestFullscreen();
    } else if (elem.msRequestFullscreen) { /* IE11 */
      elem.msRequestFullscreen();
    }
  }
  
  $(document).ready(function(){

    // function toCamelCase(str) {
    //   return str.toLowerCase().split(' ').map(function(word, index) {
    //     return index === 0 ? word : word.charAt(0).toUpperCase() + word.slice(1);
    //   }).join('');
    // }

    // d3.select("body").append("div").attr("id", "topNav");
    // d3.select("#topNav").append("button").text("Cocktails").attr("class", "button nav-buttons").attr("id", "cocktails");
    // d3.select("#topNav").append("button").text("Originals").attr("class", "button nav-buttons").attr("id", "originals");


    // d3.select("body").append("div").attr("id", "mainContainer");

    // let list = data[0].drinks;
    // console.log(list);

    // let list2 = data[0].inventory[0].items;   // -----------------------------------------------------------------------  To access ingredients in stock but this is only specific to liquor
    // console.log(list2);


    // list.sort((a, b) => a.name.localeCompare(b.name));       //  What does this do.............???????????????????????



    list.map(x => {

      // console.log(Object.keys(x));
      let keys = Object.keys(x);
      let subSet = "";

      keys.map(l => {
        if(l === "name" || l === "photo" || l === "section" || l === "batch" || l === "altBatch" || l === "instructions"){
          return
        }
        subSet = "x." + l;
        // console.log("x." + l);
      })

  
      let wine = x.wine;
      // console.log(wine);                             //         This may be the key to consolidating your code.... freecodecamps rpg tutorial is helping. use variables better to store values that can change depending on needs!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
 
      function missingIngBtn(){
        function isSubset(arr1, arr2){
          return arr1.every(item => arr2.includes(item));
        }
        
        let liquorArr = [];

        if(x.liquor !== null){                                        // missing liquor
          x.liquor.map(x => {
            // console.log(x)
            let a = x.replace(/[^a-zA-Z]|oz|float|dashes|\d/gi, ' ');
            // console.log(a);
            let b = a.trim();
            liquorArr.push(b);
          })
        }

        
        

        if (liquorArr.length !== 0) {
          let result = isSubset(liquorArr, list2);
          let button = d3.select("#mainContainer")
            .append("button")
            .text(x.name)
            .attr("class", "button drink-buttons")
            .attr("id", x.name);
        
          if (result !== true) {
            button.text(x.name).append("p").text("( Missing Ingredient )").attr("class", "missing-ingredient");
          }
        }

        if(x.liquor === null){
          d3.select("#mainContainer").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);
        };

      }



      if(x.section === "cocktails"){
        // d3.select("#mainContainer").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);             // Just this if it stops working
        missingIngBtn()
      }
    })


    // d3.select("body").append("div").attr("id", "bottomNav");
    // d3.select("#bottomNav").append("button").text("Search Drinks").attr("class", "button nav-buttons").attr("id", "searchDrinks");
  

    $('body').on('click', '.button', function(){

      openFullscreen();
      $("#mainContainer").empty();

      // console.log(this.id);

      if(this.id === "clearButton"){
        return;  // Because the clear button function is located somewhere else
      }
      

      // if(this.id === "searchDrinks"){
      //     d3.select("#mainContainer").append("div").attr("id", "searchDiv");
      //     d3.select("#searchDiv").append("input").attr("id", "searchInput").attr("placeholder", "search...");
      //     d3.select("#searchDiv").append("button").attr("id", "clearButton").text("Clear");
      //     d3.select("#mainContainer").append("div").attr("id", "searchListDiv");
      //   }

      // list.map(x => {


      //   if(this.id !== "searchDrinks"){
      //     if(this.id === x.section){
      //       d3.select("#mainContainer").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);
      //     }
      //   } else{
      //     if(this.id === "searchDrinks" && x.section === "searchDrinks"){
      //       d3.select("#searchListDiv").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);
      //     }
      //   }

   
        

        // Recipe Information ..............................................................................................................................
        if(this.id === x.name){
          // console.log(x.name);
          // console.log(x.photo);
          
          // Main Container
          d3.select("#mainContainer").append("div").attr("id", "drinkInfoContainer");
          
          // Title Card
          d3.select("#drinkInfoContainer").append("div").attr("id", "cardTitle").text(x.name);

          // Info Container for Each Section 
          d3.select("#drinkInfoContainer").append("div").attr("id", "drinkInfo");

          // Photo Section Div
          d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkPhoto");

          // Retrieves Photo
          // d3.select("#drinkPhoto").append("img").attr("class", "drink-photo").attr("src", "./images/" + x.photo + ".png");

          if(x.photo !== null){
            d3.select("#drinkPhoto").append("img").attr("class", "drink-photo").attr("src", "./images/" + x.photo + ".png")
          } else{
            // d3.select("#drinkPhoto").append("img").attr("class", "drink-photo").attr("src", "./images/noPhoto.png").style("max-width", "40%")
            d3.select("#drinkPhoto").append("p").text("Please Upload Photo").style("color", "antiquewhite").style("font-size", "3vh").style("margin","3%");
          }

          // Recipe Section Div
          d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkRecipeDiv");

          d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "glassTitle");
          d3.select("#glassTitle").append("div").attr("class", "recipe-title-div").attr("id", "glass");
          d3.select("#glass").append("p").attr("class", "recipe-title").text("Glass: ");
          d3.select("#glass").append("div").attr("class", "drink-recipe").attr("id", "glassRecipe");
          d3.select("#glassRecipe").append("p").attr("class", "recipe").text(x.glass);

          if(x.rim !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "rimTitle");
            d3.select("#rimTitle").append("div").attr("class", "recipe-title-div").attr("id", "rim");
            d3.select("#rim").append("p").attr("class", "recipe-title").text("Rim:");
            d3.select("#rim").append("div").attr("class", "drink-recipe").attr("id", "rimRecipe");
            d3.select("#rimRecipe").append("p").attr("class", "recipe").text(x.rim);
          }

          if(x.wine !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "wineTitle");
            d3.select("#wineTitle").append("div").attr("class", "recipe-title-div").attr("id", "wine");
            d3.select("#wine").append("p").attr("class", "recipe-title").text("Wine:");
            d3.select("#wine").append("div").attr("class", "drink-recipe").attr("id", "wineRecipe");


            let wine = x.wine;
            console.log(wine);
            wine.map(l => {
              d3.select("#wineRecipe").append("p").attr("id", l).attr("class", "recipe").text(l);
            })
          }

          if(x.liquor !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "liquorTitle");
            d3.select("#liquorTitle").append("div").attr("class", "recipe-title-div").attr("id", "liquor");
            d3.select("#liquor").append("p").attr("class", "recipe-title").text("Liquor:");
            d3.select("#liquor").append("div").attr("class", "drink-recipe").attr("id", "liquorRecipe");


            let liquors = x.liquor;
            console.log(liquors);
            liquors.map(l => {
              d3.select("#liquorRecipe").append("p").attr("id", l).attr("class", "recipe").text(l);          //Added id to this p element but may want tto rethink how to select it
            })
          }

          if(x.liqueur !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "liqueurTitle");
            d3.select("#liqueurTitle").append("div").attr("class", "recipe-title-div").attr("id", "liqueur");
            d3.select("#liqueur").append("p").attr("class", "recipe-title").text("liqueur:");
            d3.select("#liqueur").append("div").attr("class", "drink-recipe").attr("id", "liqueurRecipe");


            let liqueurs = x.liqueur;
            console.log(liqueurs);
            liqueurs.map(l => {
              d3.select("#liqueurRecipe").append("p").attr("id", l).attr("class", "recipe").text(l);
            })
          }

          if(x.vermouth !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "vermouthTitle");
            d3.select("#vermouthTitle").append("div").attr("class", "recipe-title-div").attr("id", "vermouth");
            d3.select("#vermouth").append("p").attr("class", "recipe-title").text("Vermouth:");
            d3.select("#vermouth").append("div").attr("class", "drink-recipe").attr("id", "vermouthRecipe");


            let vermouth = x.vermouth;
            console.log(vermouth);
            vermouth.map(l => {
              d3.select("#vermouthRecipe").append("p").attr("id", l).attr("class", "recipe").text(l);
            })
          }

          if(x.mixers !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "mixersTitle");
            d3.select("#mixersTitle").append("div").attr("class", "recipe-title-div").attr("id", "mixers");
            d3.select("#mixers").append("p").attr("class", "recipe-title").text("Mixers: ");
            d3.select("#mixers").append("div").attr("class", "drink-recipe").attr("id", "mixersRecipe");


            let mixers = x.mixers;
            console.log(mixers);
            mixers.map(l => {
              d3.select("#mixersRecipe").append("p").attr("id", l).attr("class", "recipe").text(l);
            })
          }

          if(x.garnish !== null){
            d3.select("#drinkRecipeDiv").append("div").attr("class", "recipe-div").attr("id", "garnishTitle");
            d3.select("#garnishTitle").append("div").attr("class", "recipe-title-div").attr("id", "garnish");
            d3.select("#garnish").append("p").attr("class", "recipe-title").text("Garnish: ");
            d3.select("#garnish").append("div").attr("class", "drink-recipe").attr("id", "garnishRecipe");


            let garnish = x.garnish;
            console.log(garnish);
            garnish.map(l => {
              d3.select("#garnishRecipe").append("p").attr("id", l).attr("class", "recipe").text(l);
            })
          }
         

          d3.select("#drinkInfo").append("div").attr("class", "info-divs").attr("id", "drinkInstructionsDiv");

          if(x.instructions !== null){
            d3.select("#drinkInstructionsDiv").append("div").attr("class", "instructions-title").attr("id", "drinkInstructionsTitle").text("Instructions");
            
            let instructions = x.instructions;

            console.log(instructions);
            instructions.map(l => {
              d3.select("#drinkInstructionsDiv").append("li").attr("class", "instructions").text(l);
            })
          }

          if(x.batch !== null){
            d3.select("#drinkInstructionsDiv").append("div").attr("class", "instructions-title").attr("id", "drinkInstructionsTitle").text("Batch").style("border-top", ".25vh inset rgb(227, 191, 127)");
            
            let batch = x.batch;

            console.log(batch);
            batch.map(l => {
              d3.select("#drinkInstructionsDiv").append("li").attr("class", "instructions").text(l);
            })
          }

          if(x.altBatch !== null){
            d3.select("#drinkInstructionsDiv").append("div").attr("class", "instructions-title").attr("id", "drinkInstructionsTitle").text("Batch").style("border-top", ".25vh inset rgb(227, 191, 127)");
            
            let altBatch = x.altBatch;

            console.log(altBatch);
            altBatch.map(l => {
              d3.select("#drinkInstructionsDiv").append("li").attr("class", "instructions").text(l);
            })
          }

        }

      })

    
    }); // End of Button Click

    
/* Search Input */
document.addEventListener("input", (e) => {
  let value = e.target.value;

  if (value && value.trim().length > 0) {
      value = value.trim().toLowerCase().replace(/[^\w\s]/gi, ""); // Remove punctuation
      $("#searchListDiv").empty(); // Clear the current list

      // Filter drinks based on the sanitized search query
      let filteredDrinks = list.filter(x => 
          x.name.toLowerCase().replace(/[^\w\s]/gi, "").includes(value)
      );

      if (filteredDrinks.length > 0) {
          filteredDrinks.forEach(x => {
              d3.select("#searchListDiv")
                  .append("button")
                  .text(x.name)
                  .attr("class", "button drink-buttons")
                  .attr("id", x.name);
          });
      } else {
          // Display an error message if no drinks match the search
          d3.select("#searchListDiv")
              .append("p")
              .text("...No drinks found...")
              .attr("class", "error-message");
      }
  } else {
      // If input is empty, repopulate with all drinks in the "searchDrinks" section
      $("#searchListDiv").empty();
      list.forEach(x => {
          if (x.section === "searchDrinks") {
              d3.select("#searchListDiv")
                  .append("button")
                  .text(x.name)
                  .attr("class", "button drink-buttons")
                  .attr("id", x.name);
          }
      });
  }
});




    
    $('body').on('click', '#clearButton', function(){

      $("#searchInput").val("");
      $("#searchListDiv").empty();

      list.map(x => {
        if(x.section === "searchDrinks"){
          d3.select("#searchListDiv").append("button").text(x.name).attr("class", "button drink-buttons").attr("id", x.name);
        }
      });


    });  // End of Clear Button




    $('body').on('click', 'p', function(){

      let thisID = this.id.toLowerCase();
      // console.log(thisID);
      
      list2.map(x =>{
        let a = thisID.replace(/[^a-zA-Z]|oz|float|dashes|\d/gi, ' ');
        let b = x.toLowerCase().replace(/[^a-zA-Z]|oz|float|dashes|\d/gi, ' ');
        
        const camelCaseStringA = toCamelCase(a);
        const camelCaseStringB = toCamelCase(b);

        console.log(camelCaseStringA);
        console.log(camelCaseStringB);

        if(camelCaseStringA === camelCaseStringB){
          // console.log(camelCaseStringA);
          // console.log(camelCaseStringB);

          d3.select("body").append("div").attr("id", "modalBG");
          d3.select("#modalBG").append("div").attr("id", "modalContent");
          d3.select("#modalContent").append("img").attr("class", "inventory-photo").attr("src", "./images/" + camelCaseStringA + ".png")
        }
      })
    });  // End of "p"  click


    $('body').on('click', '#modalBG', function(){
      $("#modalBG").remove();
    });
    




    // list.map(x => {
    //   console.log(x.liquor);
    // })
    

    // list.map(x => {
    //   console.log(x.liqueur);
    // })

    // list.map(x => {
    //   console.log(x.mixers);
    // })


  }); // End of jQuery

})

.catch(error => {
  console.error('There was a problem fetching the mainSections:', error);
});

