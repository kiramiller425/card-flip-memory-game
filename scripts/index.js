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
         * This is a custom delay method. Credit: https://stackoverflow.com/questions/6921895/synchronous-delay-in-code-execution
         *
         * @param {number} numberOfMillisecondsToWait is the number of milliseconds to delay before returning from this method.
         */
        waitFor: function(numberOfMillisecondsToWait) {
            console.log("Delay method called. Waiting for " + numberOfMillisecondsToWait + "ms.");
            var beginTime = Date.now();
            var currentTime = beginTime;
            
            while((currentTime - beginTime) < numberOfMillisecondsToWait) {
                // Update current time:
                currentTime = Date.now();
            }            
            
            console.log("Delay method complete.");
        },
        
        /**
         * This forces the passed in element to be redrawn. Credit: https://stackoverflow.com/questions/8840580/force-dom-redraw-refresh-on-chrome-mac
         *
         * @param {Object} jQueryElement is the jquery element to be redrawn.
         */
        forceRedraw: function(jQueryElement) {
            
            if (!jQueryElement) { return; }

            var n = document.createTextNode(' ');
            //var disp = jQueryElement.style.display;  // don't worry about previous display style

            jQueryElement.append(n);//.appendChild(n);
            jQueryElement.hide();//.style.display = 'none';

            setTimeout(function(){
                jQueryElement.show();//.style.display = disp;
                n.parentNode.removeChild(n);
            },20); // you can play with this timeout to make it as short as possible
        },
        
        /**
         * This sets up the game for the first time after the page loads.
         *
         * @param {string} gameBoardElementId is the id name of the element on the HTML page which this function will set up the game elements into.
         * @param {string[]} relativeUrisOfUniquePicturesArray is the array containing all unique card images. The first one is the back of each card.
         */
        setupGame: function(gameBoardElementId, pageLoadingMessageContainerId, relativeUrisOfUniquePicturesArray) {
            
            // Log that we are setting up the game:
            console.log("Setting up the game.");
			
            // Add these variables to the game, and set them up with defaults for now:
            $.KirasCardMatchMemoryGame.backOfCardPictureUri = "";
			
            $.KirasCardMatchMemoryGame.cardBorderThickness = 1;
            $.KirasCardMatchMemoryGame.cardMarginWidth = 2;
            $.KirasCardMatchMemoryGame.cardWidthFullSize = 200;
            $.KirasCardMatchMemoryGame.cardWidthTabletSize = 120;
            $.KirasCardMatchMemoryGame.cardWidthMobileSize = 50;
			
            $.KirasCardMatchMemoryGame.hasOneCardBeenClicked = false;
            $.KirasCardMatchMemoryGame.hasSetupError = true; // Leave it as true in case this function returns due to a setup error. This will change to false at the end of this function.
            $.KirasCardMatchMemoryGame.isGameOver = false;
            $.KirasCardMatchMemoryGame.maxPointsGivenPerCorrectMatch = 1000;
            $.KirasCardMatchMemoryGame.maxNumberOfMatchesPossible = 0;
            $.KirasCardMatchMemoryGame.numberOfCards = 0;
            $.KirasCardMatchMemoryGame.numberOfMatchesFound = 0;
            $.KirasCardMatchMemoryGame.numberOfUniquePictures = 0;
            $.KirasCardMatchMemoryGame.pointsToDockDuringMisMatch = 1;
            $.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound = $.KirasCardMatchMemoryGame.maxPointsGivenPerCorrectMatch;
            $.KirasCardMatchMemoryGame.previousCardsValue = "";
            $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = true; // Ignore any user input right now until we're done setting up the game.
            $.KirasCardMatchMemoryGame.totalPointsScoredSoFar = 0;
                        
            // Arrays:
            $.KirasCardMatchMemoryGame.allCardValues = [];
            $.KirasCardMatchMemoryGame.allCardPictureUris = relativeUrisOfUniquePicturesArray;
            $.KirasCardMatchMemoryGame.allIdsOfFaceUpCards = [];
            
            // These variables will hold jQuery elements eventually:
            $.KirasCardMatchMemoryGame.$cardsContainerElement;
            $.KirasCardMatchMemoryGame.$gameBoardElement;
            $.KirasCardMatchMemoryGame.$matchesFoundCountContainerElement;
            $.KirasCardMatchMemoryGame.$messageToUserContainerElement;
            $.KirasCardMatchMemoryGame.$pageLoadingElement = $("#" + pageLoadingMessageContainerId);
            $.KirasCardMatchMemoryGame.$pointsContainerElement;
            $.KirasCardMatchMemoryGame.$statsDashboardElement;
            
            // First do some validation of the inputs:
            
            // If the gameBoardElementId is null or undefined:
            if (gameBoardElementId === undefined || gameBoardElementId === null) {
            
                // Log this error:
                console.error("The game board element id was " + gameBoardElementId + ". Cannot start game.");
                
                return;
            }
            
            // Setup access to the jQuery version of this game board element:
            $.KirasCardMatchMemoryGame.$gameBoardElement = $("#" + gameBoardElementId);

            // If the element doesn't exist:
            if ($.KirasCardMatchMemoryGame.$gameBoardElement === undefined || $.KirasCardMatchMemoryGame.$gameBoardElement === null) {
                
                // Log this error:
                console.error("The game board element doesn't exist on the page. Cannot start game.");
                
                return;
            }
            
            // Hide the gameboard, and display the loading image for now while we set it up:
            $.KirasCardMatchMemoryGame.$gameBoardElement.hide();
            $.KirasCardMatchMemoryGame.$pageLoadingElement.show();
            
            // Add a reverse reference to the DOM object:
            $.KirasCardMatchMemoryGame.$gameBoardElement.data("KirasCardMatchMemoryGame", $.KirasCardMatchMemoryGame);
            
            // If the pictures array is null or undefined:
            if (relativeUrisOfUniquePicturesArray === undefined || relativeUrisOfUniquePicturesArray === null) {
                
                // Log this error:
                console.error("The pictures array was " + relativeUrisOfUniquePicturesArray + ". Cannot start game.");
                
                return;
            }
            
            // If the number of pictures is less than 2, then we cannot have a game:
            if (relativeUrisOfUniquePicturesArray.length < 2) {
                
                // Log this error:
                console.error("There were too few pictures in the array. Cannot start game.");
                                
                return;
            }
            
            // Log that the input parameters passed validation:
            console.log("Input parameters passed validation.");
            
            // Set the number of unique pictures (minus the back-of-card picture):
            $.KirasCardMatchMemoryGame.numberOfUniquePictures = relativeUrisOfUniquePicturesArray.length - 1;

            // Set the total possible number of matches:
            $.KirasCardMatchMemoryGame.maxNumberOfMatchesPossible = $.KirasCardMatchMemoryGame.numberOfUniquePictures;

            // Set the total number of cards:
            $.KirasCardMatchMemoryGame.numberOfCards = $.KirasCardMatchMemoryGame.numberOfUniquePictures * 2;

            // Add the stats dashboard (with points, match count, and message containers) and cards container to the page:
            $.KirasCardMatchMemoryGame.$gameBoardElement.html("<div class='game-board__stats-dashboard'>"
                +     "<div class='game-board__title'>Card Match</div>"
                +     "<div class='game-board__points'></div>"
                +     "<div class='game-board__matches-found-count'></div>"
                +     "<div class='game-board__message-to-user'></div>"
                + "</div>"
                + "<div class='game-board__cards'></div>"
                );
            
            // Store these jQuery objects for future reference:
            $.KirasCardMatchMemoryGame.$statsDashboardElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find(".game-board__stats-dashboard");
            $.KirasCardMatchMemoryGame.$pointsContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find(".game-board__points");
            $.KirasCardMatchMemoryGame.$matchesFoundCountContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find(".game-board__matches-found-count");
            $.KirasCardMatchMemoryGame.$messageToUserContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find(".game-board__message-to-user");
            $.KirasCardMatchMemoryGame.$cardsContainerElement = $.KirasCardMatchMemoryGame.$gameBoardElement.find(".game-board__cards");

            // Constrain the cards container to make the cards fit into as close a rectangle grid as possible:
            window.addEventListener("resize", $.KirasCardMatchMemoryGame.recalculateAfterResize(), false);

            // For each card:
            var cardsHTML = "";
            for (var i = 0; i < $.KirasCardMatchMemoryGame.numberOfCards; i++) {
                
                // Set up the HTML for the card. (The first URI in the array is the back of the card):
                cardsHTML += "<div id='cardId" + i 
					+ "' class='game-board__single-card' onclick='$.KirasCardMatchMemoryGame.cardClicked(" + i
					+ ")'><img src='" + relativeUrisOfUniquePicturesArray[0] + "' /></div>";
            
                // Set up the card's face value into the array. At first, this will be in order; first two cards match, next two cards match, etc. They will be shuffled by the reset function:
                $.KirasCardMatchMemoryGame.allCardValues.push(relativeUrisOfUniquePicturesArray[Math.floor((i + 2)/2)]);
            }
            
            // Add all cards to the page, within the cards container:
            $.KirasCardMatchMemoryGame.$cardsContainerElement.html(cardsHTML);

            // When it gets to this point, it means no errors were encountered:
            $.KirasCardMatchMemoryGame.hasSetupError = false;

            // Log that we are done setting up the game:
            console.log("Finished setting up the game.");
            
            // Reset (to shuffle cards and set up messages) to start the game:
            $.KirasCardMatchMemoryGame.resetGame();            
        },

        /**
         * This recalculates the width of the cards container upon a screen / window resize event to ensure the cards form an asthetically pleasing rectangular shape.
         */
        recalculateAfterResize: function() {
			
			// TODO: move most css for this game to this JS. Alternative is to use SASS since CSS doesn't do loops / conditionals. But for this project, I want to focus on jQuery.
			// TODO: fix this. Currently it's stuck in a loop:
			return;
            
            let cardsContainerWidth = 0;
            let screenWidth = screen.width;
            let totalCardWidth = 206;
            
			$.KirasCardMatchMemoryGame.cardWidthFullSize
			
            if (screen.width <= 400) {
                // Then it's a tiny mobile size screen:
                totalCardWidth = 206;
                
            } else if (401 <= screen.width && screen.width <= 1350) {
                // Then it's a tablet size
                totalCardWidth = 206;
                
            } else {
                // Then it's wider than 1350px:
                totalCardWidth = 206;
            }
			
			// Start off considering the longest possible container with all the cards in a straight line:
			cardsContainerWidth = totalCardWidth * $.KirasCardMatchMemoryGame.numberOfCards + 1;
			
			// As long as this container width is larger than the screen width:
			while (cardsContainerWidth >= screenWidth) {
				cardsContainerWidth = cardsContainerWidth / 2;
				// cut it in half? or make it fit a rectangle as best as possible.
				// maybe half at first, and if its still too big, cut that in half. If too small, ?
			}
			
			$.KirasCardMatchMemoryGame.$cardsContainerElement.css("width", cardsContainerWidth);
			
            
            ;
            
            // TODO
            // sense the width of the screen
            // calc the width of each card img + margin + border
            // find the max width of cardscontainer possible to make as close a rectangle with the cards
            
            // examples:
            
            // screenWidth = 1351
            // cardWidth = 206
            // numCards = 2
            // cardsContainerWidth = cardWidth*numCards + 1
            
            // screenWidth = 1351
            // cardWidth = 206
            // numCards = 4
            // cardsContainerWidth = cardWidth*numCards + 1
            
            // screenWidth = 1351
            // cardWidth = 206
            // numCards = 6
            // cardsContainerWidth = cardWidth*numCards + 1
            
            // screenWidth = 1351
            // cardWidth = 206
            // numCards = 8
            // cardsContainerWidth = cardWidth*numCards / 2 + 1
            
            // screenWidth = 1351
            // cardWidth = 206
            // numCards = 10
            // cardsContainerWidth = cardWidth*numCards / 2 + 1
            
        },
        
        /**
         * This resets the game; shuffles the cards, sets the points accumulated to 0, resets the messages, and re/starts the game.
         */
        resetGame: function() {
            // Log that we are resetting the game:
            console.log("Resetting the game.");
            
            // Ignore any user input right now until we're done setting up the game:
            $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = true; 
           
            // Hide the gameboard for now while we set it up:
            $.KirasCardMatchMemoryGame.$gameBoardElement.hide();
            $.KirasCardMatchMemoryGame.$pageLoadingElement.show();
            
            // If there was a problem during setup:
            if($.KirasCardMatchMemoryGame.hasSetupError) {
                
                // Log the error and quit the game:
                console.error("Cannot start game due to a setup error.");
                
                // Display an error to the user:
                $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html("Sorry, something went wrong. Please go back and try again.");
                    
                // Show the gameboard:
                $.KirasCardMatchMemoryGame.$gameBoardElement.show();
                
                // Hide the loader:
                $.KirasCardMatchMemoryGame.$pageLoadingElement.hide();
                
                return;
            }
            
            // Reset points to 0:
            $.KirasCardMatchMemoryGame.totalPointsScoredSoFar = 0;
            
            // Reset the points display to user:
            $.KirasCardMatchMemoryGame.$pointsContainerElement.html("Total points: " + $.KirasCardMatchMemoryGame.totalPointsScoredSoFar);
            
            // Reset next possible points to highest possible. (The game subtracts points from this for each mismatch the user does, until a correct match is found):
            $.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound = $.KirasCardMatchMemoryGame.maxPointsGivenPerCorrectMatch; 
            
            // Reset the array that keeps track of all face-up cards:
            $.KirasCardMatchMemoryGame.allIdsOfFaceUpCards = [];
            
            // Reset the number of matches the user found to 0:
            $.KirasCardMatchMemoryGame.numberOfMatchesFound = 0;
            
            // Reset the matches display to the user:
            $.KirasCardMatchMemoryGame.$matchesFoundCountContainerElement.html("Total number of matches found: " + $.KirasCardMatchMemoryGame.numberOfMatchesFound);
            
            // Set all cards to their face-down display:
            $.KirasCardMatchMemoryGame.$cardsContainerElement.find("img").attr("src", $.KirasCardMatchMemoryGame.allCardPictureUris[0]);
            
            // For each card:
            for(var i = 0; i < $.KirasCardMatchMemoryGame.numberOfCards; i++) {
           
                // Randomly shuffle their face value with another card's:
                var j = Math.floor(Math.random() * $.KirasCardMatchMemoryGame.numberOfCards);
                
                // Swap:
                var temporaryFaceUpPictureUri = $.KirasCardMatchMemoryGame.allCardValues[i];
                $.KirasCardMatchMemoryGame.allCardValues[i] = $.KirasCardMatchMemoryGame.allCardValues[j];
                $.KirasCardMatchMemoryGame.allCardValues[j] = temporaryFaceUpPictureUri;
            }
            
            // Set the initial message:
            $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html("Let's begin! Click on a card to turn it over.");
                                
            // Show the gameboard:
            $.KirasCardMatchMemoryGame.$gameBoardElement.show();
            $.KirasCardMatchMemoryGame.$pageLoadingElement.hide();
            
            // We're done resetting, so pay attention to user input now:
            $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = false; 
            
            // Log that we are done resetting the game:
            console.log("Finished resetting the game. Game has started.");
        },
        
        /**
         * This handles when a card is clicked on.
         *
         * @param {number} clickedCardId is the id of the card which was clicked on.
         */
        cardClicked: function(clickedCardId) {
            
            // Log action:
            console.log("Card with Id " + clickedCardId + " was clicked.");
            
            // If the game had a setup error:            
            if($.KirasCardMatchMemoryGame.hasSetupError) {
                
                // Then ignore this click:
                console.log("Ignoring click; game had a setup error.");
                
                return;
            }
            
            // If the game isn't ready for user input (due to setup or transition, etc.):
            if($.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks) {
                
                // Then ignore this click:
                console.log("Ignoring click; game isn't ready for user input yet.");
                
                return;
            }
            
            // Otherwise, set this to ignore subsequent clicks for now:
            console.log("Set to ignore subsequent clicks.");
            $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = true;
            
            // If the game is over:
            if($.KirasCardMatchMemoryGame.isGameOver) {
                
                // Then ignore this click:
                console.log("Ignoring click; game is over.");
                
                return;
            }
            
            // If the card that was clicked is already face-up:
            if($.KirasCardMatchMemoryGame.allIdsOfFaceUpCards.includes(clickedCardId)) {
                
                // Then ignore this click:
                console.log("Ignoring click; this card is already face up.");
                
                // We're done, so pay attention to user input again:
                console.log("Paying attention to clicks again now.");
                $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = false;
                
                return;
            }
            
            console.log("Showing card's face.");
            
            // Otherwise, mark this card as face up now:
            $.KirasCardMatchMemoryGame.allIdsOfFaceUpCards.push(clickedCardId);
            
            var thisCardsValue = $.KirasCardMatchMemoryGame.allCardValues[clickedCardId];
            
            // Display the face-up value on this clicked card:
            $("#cardId" + clickedCardId + " img").attr("src", thisCardsValue);
            
            // If this is the first card they've turned over in this match round:
            if($.KirasCardMatchMemoryGame.previousCardsValue === "") {
                
                // Make this the previous card for next time:
                $.KirasCardMatchMemoryGame.previousCardsValue = thisCardsValue;
                
                // Update the message to the user:
                $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html("Now pick a matching card.");
                
                // We're done, so pay attention to user input again:
                console.log("Paying attention to clicks again now.");
                $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = false;
                
            } else {
                
                // If this card's value is the same as the previously clicked card:
                if(thisCardsValue === $.KirasCardMatchMemoryGame.previousCardsValue) {
                
                    // Then it's a match:
                    console.log("Cards did match.");
                    
                    // Keep both cards face up and add reward to total points:
                    $.KirasCardMatchMemoryGame.totalPointsScoredSoFar += $.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound;
                    
                    // Reset possible points for the next match:
                    $.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound = $.KirasCardMatchMemoryGame.maxPointsGivenPerCorrectMatch;
                    
                    // Reset previous card for next match:
                    $.KirasCardMatchMemoryGame.previousCardsValue = "";
                    
                    // Increment the number of matches the user has found:
                    $.KirasCardMatchMemoryGame.numberOfMatchesFound++;
                    
                    // Display this message to the user:
                    $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html("Great! You found a match! Choose another face-down card to find another match.");
                    
                    // Update the points display to user:
                    $.KirasCardMatchMemoryGame.$pointsContainerElement.html("Total points: " + $.KirasCardMatchMemoryGame.totalPointsScoredSoFar);
                    
                    // Update matches found display:
                    $.KirasCardMatchMemoryGame.$matchesFoundCountContainerElement.html("Total number of matches found: " + $.KirasCardMatchMemoryGame.numberOfMatchesFound);
            
                    // If the user has found all possible matches:
                    if($.KirasCardMatchMemoryGame.numberOfMatchesFound >= $.KirasCardMatchMemoryGame.maxNumberOfMatchesPossible) {
            
                        // Then the game is over:
                        $.KirasCardMatchMemoryGame.isGameOver = true;
                        
                        // Display this message to the user:
                        $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html("Congratulations! You found all the matches!");
                    }

                    // We're done, so pay attention to user input again:
                    console.log("Paying attention to clicks again now.");
                    $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = false;
                    
                } else {
                    
                    // It's not a match:
                    console.log("Cards did not match.");
                    
                    // So dock some points from the possible prize:
                    $.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound -= $.KirasCardMatchMemoryGame.pointsToDockDuringMisMatch;
                    
                    // If it's less than 1:
                    if($.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound < 1) {
                        
                        // Keep it at 1 so they get at least 1 point for finding a match:
                        $.KirasCardMatchMemoryGame.pointsToBeAwardedAfterNextMatchFound = 1;
                    }
                    
                    // Display this message to the user:
                    $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html(":( Sorry, those cards do not match.");
                    
                    // Wait 3 seconds and then flip both cards back over:
                    setTimeout(function(){
                        
                        // Remove both cards from the face-up card tracker stack:
                        $.KirasCardMatchMemoryGame.allIdsOfFaceUpCards.pop();
                        var previousCardId = $.KirasCardMatchMemoryGame.allIdsOfFaceUpCards.pop();
                        
                        // Re-hide both cards:
                        $("#cardId" + clickedCardId + " img").attr("src", $.KirasCardMatchMemoryGame.allCardPictureUris[0]);
                        $("#cardId" + previousCardId + " img").attr("src", $.KirasCardMatchMemoryGame.allCardPictureUris[0]);
                        
                        // Reset previous card for next match:
                        $.KirasCardMatchMemoryGame.previousCardsValue = "";
                            
                        // Display this message to the user:
                        $.KirasCardMatchMemoryGame.$messageToUserContainerElement.html(":( Sorry, those cards did not match. Pick another face-down card to try again.");
                                    
                        // We're done, so pay attention to user input again:
                        console.log("Paying attention to clicks again now.");
                        $.KirasCardMatchMemoryGame.shouldIgnoreAnyClicks = false;
                    
                    }, 3000);
                }
            }                        
        }
        
    });
    
    // temporary array for testing:
    var relativeUrisOfUniquePicturesArray = [ "images/backOfCard.svg", "images/appleGreen.svg", "images/cherriesRed.svg", "images/peachOrange.svg", "images/pearYellow.svg", "images/plumPurple.svg" ];
    
    // Setup and start the game:
    $.KirasCardMatchMemoryGame.setupGame("game-board", "loading-message-container", relativeUrisOfUniquePicturesArray);
    
    
    // TODO: read in and parse JSON, see method drafts below;
    
    

     
     
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
