/**
 * This document contains the JS / jQuery for the Card Flip Memory Match Game. Comments are in JSDoc form.
 * Here are some of the articles I read while making this game:
 *    https://hackernoon.com/object-oriented-programming-in-vanilla-javascript-f3945b15f08a
 *    https://addyosmani.com/blog/essential-js-namespacing/#beginners
 *    https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch13s04.html
 *    https://devdocs.io/jsdoc/
 *    https://devhints.io/jsdoc
 *
 * @author: Kira Miller
 */
 
;(function($) {

	/**
	 * My namespace for this app. This checks for conflicting namespace names and will use the one that already exists if there is a conflict. See option 4 (best practice) of https://addyosmani.com/blog/essential-js-namespacing/#beginners I'm using the jQuery namespace pattern. See: https://www.oreilly.com/library/view/learning-javascript-design/9781449334840/ch13s04.html I've also set up the object literal here.
	 *
	 * @namespace
	 */
	$.KirasCardMatchMemoryGame || ($.KirasCardMatchMemoryGame = {
		
		/**
		 * This sets up the game for the first time after the page loads.
		 *
		 * @param {string} gameBoardElementId is the id name of the element on the HTML page which this function will set up the game elements into.
		 * @param {string[]} relativeUrisOfUniquePicturesArray is the array containing all unique card images. The first one is the back of each card.
		 */
		setupGame: function(gameBoardElementId, relativeUrisOfUniquePicturesArray) {
			// Log that we are setting up the game:
			console.log("Setting up the game.");
			
			// todo: hide the gameboard for now until we're done
			// display: none / in jquery
				
			// Add these variables to the game, and set up with defaults for now:
			$.KirasCardMatchMemoryGame.backOfCardPictureUri = "";
			$.KirasCardMatchMemoryGame.hasOneCardBeenClicked = false;
			$.KirasCardMatchMemoryGame.hasSetupError = true; // Leave it as true in case this function returns due to a setup error. This will change to false at the end of this function.
			$.KirasCardMatchMemoryGame.idOfPreviousClickedCard = "";
			$.KirasCardMatchMemoryGame.isGameOver = false;
			$.KirasCardMatchMemoryGame.maxPointsGivenPerCorrectMatch = 1000;
			$.KirasCardMatchMemoryGame.numberOfCards = 0;
			$.KirasCardMatchMemoryGame.numberOfUniquePictures = 0;
			$.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound = $.KirasCardMatchMemoryGame.maxPointsGivenPerCorrectMatch; // Game subtracts points from this for each mismatch until match is found.
			$.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = true; // Ignore any user input right now until we're done setting up the game.
			$.KirasCardMatchMemoryGame.totalPointsScoredSoFar = 0;
						
			// Arrays:
			$.KirasCardMatchMemoryGame.allCardValues;
			$.KirasCardMatchMemoryGame.allFaceUpPictureUris = relativeUrisOfUniquePicturesArray;
			
			// These variables will hold jQuery elements eventually:
			$.KirasCardMatchMemoryGame.$cardsContainerElement;
			$.KirasCardMatchMemoryGame.$gameBoardElement;
			$.KirasCardMatchMemoryGame.$matchCountContainerElement;
			$.KirasCardMatchMemoryGame.$messageContainerElement;
			$.KirasCardMatchMemoryGame.$pointsContainerElement;
			$.KirasCardMatchMemoryGame.$statsDashboardElement;
			
			// First do some validation of the inputs:
			
			// If the gameBoardElementId is null or undefined:
			if(gameBoardElementId === undefined || gameBoardElementId === null) {
				// Log this error:
				console.error("The game board element id was " + gameBoardElementId + ". Cannot start game.");
				
				return;
			}
			
			// Setup access to the jQuery version of this game board element:
			$.KirasCardMatchMemoryGame.$gameBoardElement = $("#" + gameBoardElementId);

			// If the element doesn't exist:
			if($.KirasCardMatchMemoryGame.$gameBoardElement === undefined || $.KirasCardMatchMemoryGame.$gameBoardElement === null) {
				// Log this error:
				console.error("The game board element doesn't exist on the page. Cannot start game.");
				
				return;
			}
			
			// Add a reverse reference to the DOM object:
			$.KirasCardMatchMemoryGame.$gameBoardElement.data("KirasCardMatchMemoryGame", $.KirasCardMatchMemoryGame);
			
			// If the pictures array is null or undefined:
			if(relativeUrisOfUniquePicturesArray === undefined || relativeUrisOfUniquePicturesArray === null) {
				// Log this error:
				console.error("The pictures array was " + relativeUrisOfUniquePicturesArray + ". Cannot start game.");
				
				return;
			}
			
			// If the number of pictures is less than 2, then we cannot have a game:
			if(relativeUrisOfUniquePicturesArray.length < 2) {
				// Log this error:
				console.error("There were too few pictures in the array. Cannot start game.");
								
				return;
			}
			
			// Log that the input parameters passed validation:
			console.log("Input parameters passed validation.");
			
			// Set the number of unique pictures (minus the back-of-card picture):
			$.KirasCardMatchMemoryGame.numberOfUniquePictures = relativeUrisOfUniquePicturesArray.length - 1;

			// Set the total number of cards:
			$.KirasCardMatchMemoryGame.numberOfCards = $.KirasCardMatchMemoryGame.numberOfUniquePictures * 2;

			// Add the stats dashboard (with points, match count, and message containers) and cards container to the page:
			$.KirasCardMatchMemoryGame.$gameBoardElement.html("<div id='statsDashboard'>"
				+ 	"<div id='pointsContainer'></div>"
				+ 	"<div id='matchCountContainer'></div>"
				+ 	"<div id='messageContainer'></div>"
				+ "</div>"
				+ "<div id='cardsContainer'></div>"
				);
			
			// Store these jQuery objects for future reference:
			$.KirasCardMatchMemoryGame.$statsDashboardElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find("#statsDashboard");
			$.KirasCardMatchMemoryGame.$pointsContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find("#pointsContainer");
			$.KirasCardMatchMemoryGame.$matchCountContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find("#matchCountContainer");
			$.KirasCardMatchMemoryGame.$messageContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find("#messageContainer");
			$.KirasCardMatchMemoryGame.$cardsContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find("#cardsContainer");

			// Add all cards to the page, within the cards container:
			var cardsHTML = "";
			for(var i = 0; i < $.KirasCardMatchMemoryGame.numberOfCards; i++) {
				// The first URI in the array is the back of the card:
				cardsHTML += "<div id='cardId" + i + "' class='gameCard' onclick='$.KirasCardMatchMemoryGame.cardClicked("+ i + ")'><img src='" + relativeUrisOfUniquePicturesArray[0] + "' /></div>";
			}
			$.KirasCardMatchMemoryGame.$cardsContainerElement.html(cardsHTML);

			// Set up the array which will contain all the cards' values:
			$.KirasCardMatchMemoryGame.allCardValues = new Array($.KirasCardMatchMemoryGame.numberOfCards);

			// When it gets to this point, it means no errors were encountered:
			$.KirasCardMatchMemoryGame.hasSetupError = false;

			// Log that we are done setting up the game:
			console.log("Finished setting up the game.");
			
			// Reset (to shuffle cards and set up messages) to start the game:
			$.KirasCardMatchMemoryGame.resetGame();			
		},
		
		/**
		 * This resets the game; shuffles the cards, sets the points accumulated to 0, resets the messages, and re/starts the game.
		 */
		resetGame: function() {
			// Log that we are resetting the game:
			console.log("Resetting the game.");
			
			// todo: hide gameboard
			
			// If there was a problem during setup:
			if($.KirasCardMatchMemoryGame.hasSetupError) {
				// Log the error and quit the game:
				console.error("Cannot start game due to a setup error.");
				
				// Display an error to the user:
				$.KirasCardMatchMemoryGame.$messageContainerElement.html("Sorry, something went wrong. Please go back and try again.");
				
				
			// todo: show gameboard
				
				return;
			}
			
			// Reset points to 0:
			$.KirasCardMatchMemoryGame.totalPointsScoredSoFar = 0;
			
			// Reset display to user:
			$.KirasCardMatchMemoryGame.$pointsContainerElement.html("Total points: " + $.KirasCardMatchMemoryGame.totalPointsScoredSoFar);
			
			// Set initial match count display:
			
			// set initial message:
			
			// Set all cards to their face-down display:
			
			// shuffle cards (randomly assign values)
			var countsOfFaceValuesUsed = [];
			for(var i = 0; i < $.KirasCardMatchMemoryGame.numberOfCards; i++) {
			}
			
			//$.KirasCardMatchMemoryGame.allFaceUpPictureUris
			//$.KirasCardMatchMemoryGame.allCardValues
			
			
			// todo: show gameboard to user
			
			// Log that we are done resetting the game:
			console.log("Finished resetting the game. Game has started.");
		},
		
		/**
		 * This handles when a card is clicked on.
		 *
		 * @param {number} clickedCardId is the id of the card which was clicked on.
		 */
		cardClicked: function(clickedCardId) {
			
			// TODO: replace this with actual content:
			console.log("hi from card number " + clickedCardId);
		}
		
		
	});
	
	// temporary array for testing:
	var relativeUrisOfUniquePicturesArray = [ "images/backOfCard.svg", "images/appleGreen.svg", "images/cherriesRed.svg", "images/peachOrange.svg", "images/pearYellow.svg", "images/plumPurple.svg" ];
	
	// Setup and start the game:
	$.KirasCardMatchMemoryGame.setupGame("gameBoardContainer", relativeUrisOfUniquePicturesArray);
	
	
	
	
	

	 
	 
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

	
	// TODO:
	// Maybe make a generic class that returns an array of picture urls
	//// it can have subclasses which have a static array
	//// another can have async loads of a json file with the list of urls
	//// the first picture in the array is always the back of the card
	// then feed this into the game.

}(jQuery));

