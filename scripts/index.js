/**
 * This document contains the JS / jQuery for the Card Flip Memory Match Game. Comments are in JSDoc form.
 * Here are some of the articles I read while making this game:
 https://hackernoon.com/object-oriented-programming-in-vanilla-javascript-f3945b15f08a
 https://addyosmani.com/blog/essential-js-namespacing/#beginners
 https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch13s04.html
 * @author: Kira Miller
 */
 
;(function($) {

	/**
	 * My namespace for this app. This checks for conflicting namespace names and will use the one that already exists if there is a conflict. See option 4 (best practice) of https://addyosmani.com/blog/essential-js-namespacing/#beginners I'm using the jQuery namespace pattern. See: https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch13s04.html
	 * @namespace
	 */
	$.KirasMatchGameNamespace || ($.KirasMatchGameNamespace = {});

	/**
	 * Nested namespace for setting up and starting this app. This checks for conflicting namespace names and will use the one that already exists if there is a conflict. See option 4 (best practice) of https://addyosmani.com/blog/essential-js-namespacing/#beginners I'm using the jQuery namespace pattern. See: https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch13s04.html
	 * @namespace
	 */
	$.KirasMatchGameNamespace.SetupAndStartGame = function(gameBoardElement, relativeUrisOfUniquePicturesArray) {
		
		console.log("Setting up game board.");
			
		var numberOfCards = 0;
		var hiddenCardUriPicture = "";
			
		// Setup access to the jQuery version of this game board element:
		context.$gameBoardElement = $(gameBoardElement);
		
		// Setup access to the DOM version of this game board element:
		context.gameBoardElement = gameBoardElement;

		// Add a reverse reference to the DOM object:
		context.$gameBoardElement.data("KirasMatchGameNamespace", context);
		
		if(relativeUrisOfUniquePicturesArray === undefined || relativeUrisOfUniquePicturesArray === null) {
			// TODO: test this:
			console.error("The pictures array was undefined. Cannot start game.");
			return;
		}
		
		var numberOfUniquePictures = relativeUrisOfUniquePicturesArray.length;
		
		console.log(numberOfUniquePictures);
		
		
		if(numberOfUniquePictures < 2) {
			// TODO: test this:
			console.log("uh oh");
			return;
		}
			
			hiddenCardUriPicture
			
			context.relativeUrisOfUniquePicturesArray = relativeUrisOfUniquePicturesArray;
			
			// set up and add the cards to DOM:
			var htmlForCards = "<div id='cardsContainer'>";
			htmlForCards += "<div><img id='' src='' onClick='' /></div>";
			$("#gameBoardContainer").html(htmlForCards);
			
			
			
		};
		
	};  


	$.KirasMatchGameNamespace.MemoryMatchGame = function (gameBoardElement, relativeUriOfBackPicture, relativeUrisOfUniqueFacePictures) {
	
		// To avoid scope issues, use "base" instead of "this" to reference this class from internal events and functions.
        var base = this;

		// Setup access to the jQuery version of this game board element:
        base.$gameBoardElement = $(gameBoardElement);
		
		// Setup access to the DOM version of this game board element:
        base.gameBoardElement = gameBoardElement;

        // Add a reverse reference to the DOM object:
        base.$gameBoardElement.data("KirasMatchGameNamespace.MemoryMatchGame", base);

		// Setup an initialization function:
        base.init = function () {
			
			
			
			
            // Put our initialization code here
			
			// set up and add the cards to DOM:
			var htmlForCards = "<div id='cardsContainer'>";
			htmlForCards += "<div><img id='' src='' onClick='' /></div>";
			$("#gameBoardContainer").html(htmlForCards);
			
			
			
			
			
        };

        // Sample Function, Uncomment to use
        // base.functionName = function( parameters ){
        // 
        // };
		
        // Run the initializer to setup the game:
        base.init();
	};
	
    $.KirasMatchGameNamespace.MemoryMatchGame.defaultSetupKeyValuePairs = {
        picturesJsonFile: "scripts/pictures.json"
    };

    $.fn.KirasMatchGameNamespace_MemoryMatchGame = function(gameSetupObjectLiterals, gameSetupValues) {
		console.log('hi');
        return this.each(function() {
			console.log(gameSetupObjectLiterals);
            (new $.KirasMatchGameNamespace.MemoryMatchGame(this, gameSetupObjectLiterals, gameSetupValues));
        });
    };
	 
	 
	/**
	 * Asynchronous function which attempts to load the pictures.json file and returns a Promise with either the successfully acquired array of relative image URLs or an error.
	 *
	 * @author: Kira Miller
	 * @return: {Promise} containing the successfully acquired array of relative image URLs if no error was encountered.
	 * @throws: {Error} if there was an error.
	 */
	 /*
	 
	async function promiseToGetPictureURLs() {
		return new Promise(function (resolve, reject) {
			
			// Asynchronously load the json file containing all of the card pictures 
			// (jQuery's $.getJSON has issues with local JSON files and assumes the wrong type) :
			$.ajax({
				dataType: "json",
				url: "scripts/pictures.json", 
				mimeType: "application/json",
				type: "GET"
			}).done(function (data, textStatus, jqXHR) {
				var arrayToReturn = [];
				
				// Go through each of the pictures:
				$.each(data.pictures, function(key, val) {
					// Add the image's relative URL to the array:
					arrayToReturn.push(val.image);
				});
				
				// Return the array:
				resolve(arrayToReturn);
				
			}).fail(function (jqXHR, textStatus, errorDetails) {
				// Log the error:
				console.log("There was an error with loading pictures. The status of the error was: " + textStatus);
				
				// Throw a new error containing the status of the error encountered:
				reject(new Error("An error occurred during the attempt to load the pictures.json: " + textStatus));
				
			}).always(function (jqXHR, textStatus) {
				// Log the error:
				console.log("Completed loading pictures with status: " + textStatus);
				
			});
		});
	}
	
	
var _prototypeProperties = function (child, staticProps, instanceProps) { if (staticProps) Object.defineProperties(child, staticProps); if (instanceProps) Object.defineProperties(child.prototype, instanceProps); };


	var _classCallCheck = function (instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } };

	
	
	var Card = (function () {
		// Constructor:
		function Card (relativeUrlOfFace, relativeUrlOfBack, idForDOM) {
			// Check for constructor abuse:
			_classCallCheck(this, Card);

			// Setup the variables of this card:
			this.relativeUrlOfFace = relativeUrlOfFace;
			this.relativeUrlOfBack = relativeUrlOfBack;
			this.isHidden = true;
			this.idForDOM = idForDOM;
			
			// Log the success:
			console.log("created a new card.");
		}
		
		_prototypeProperties(Card, null, {
			getHtmlOfFace: {
				value: function getHtmlOfFace() {
					return this.relativeUrlOfFace;
				}
			},
			getHtmlOfHidden: {
				value: function getHtmlOfHidden() {
					return this.relativeUrlOfBack;
				}
			},
			getDisplayHTML: {
				value: function getDisplayHTML() {
					string htmlString = "<div><img id='" + this.idForDOM + "' src='" + this.relativeUrlOfBack + "' onClick='' /></div>";
					
					if (this.isHidden) {
						
					}
					string htmlString = "<div><img id='" + this.idForDOM + "' src='" + this.relativeUrlOfBack + "' onClick='' /></div>";
					return this.relativeUrlOfBack;
				}
			}
		});
		
		return Card;
		
	}) ();
	
	var GameBoard = {
		setup: function (allFaceUpPictureFileNames) {
			// Double the array to create pairs:
			var allPairsOfFaceUpImageUrls = allFaceUpPictureFileNames.concat(allFaceUpPictureFileNames);
			
			// Get the total number of cards to create:
			var numberOfCards = allPairsOfFaceUpImageUrls.length;
			
			// Set up an array which will indicate whether an image URL has been used or not:
			var imageHasBeenAssigned = new Array(numberOfCards);
			
			// At first set all to false:
			for (var i = 0; i < numberOfCards; i++) {
				imageHasBeenAssigned[i] = false;
			}
			
			// Set up the array of all the cards:
			var arrayOfCards = [];
			
			for (var i = 0; i < numberOfCards; i++) {				
				// Pick an unassigned image:
				var indexOfImageUrl = 0;
				do {
					indexOfImageUrl = Math.floor(Math.random() * Math.floor(numberOfCards));
				} while (imageHasBeenAssigned[indexOfImageUrl]);
				
				// Add the new card to the array:
				arrayOfCards.push(new Card(allPairsOfFaceUpImageUrls[indexOfImageUrl], "images/backOfCard.svg"));
				
				// Mark the image as assigned:
				imageHasBeenAssigned[indexOfImageUrl] = true;
			}
			
			// Clear the contents of the game board to remove the loading symbol:
			gameBoardContainer.html("");
			
			
			
			console.log("Cards have been set up");
			
			console.log(arrayOfCards[0].getHtmlOfFace());
			console.log(arrayOfCards[0].getHtmlOfHidden());
		},
		display: function () {
		}
	};
	*/
	/**
	 * Asynchronous function which attempts to load all the pictures into the GameBoard's setup function.
	 *
	 * @author: Kira Miller
	 * @throws: {Error} containing the error message if the json load failed.
	 */
	async function getAndSetUpAllPicturesInGame() {
		// Load the pictures:
		var allPictureUrls = await promiseToGetPictureURLs();
		
		// Send the array of pictures to the GameBoard and set it up to start the game:
		GameBoard.setup(allPictureUrls);
	}


	async function startGame() {
		try {
			getAndSetUpAllPicturesInGame();
			
		} catch (error) {
			// Log the error:
			console.error("There was an error while the program tried to set up game: " + error.message);
			
			// TODO Show an error message to the user:
			
		}
	}


	// Setup and start the game:
	//startGame();

	// Set the element with this ID as the gameboard. Use this json file for the pictures. Setup and start the game:
	$("#gameBoardContainer").KirasMatchGameNamespace_MemoryMatchGame({
		picturesJsonFile: "scripts/pictures.json"
	});
	
	// TODO:
	// Maybe make a generic class that returns an array of picture urls
	//// it can have subclasses which have a static array
	//// another can have async loads of a json file with the list of urls
	//// the first picture in the array is always the back of the card
	// then feed this into the game.

}(jQuery));

