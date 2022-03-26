# license-plate-game-aurelia

This is a web-app for a license-plate word game.  
This was built with the [Aurelia](https://aurelia.io/) application framework.  
_The server is under development and is not open source._

Here is a [development deployment](http://radiant-hamlet-54079.herokuapp.com/).  
This server may be sleeping, in which case it will take 20 seconds to restart.

This video shows an example puzzle session:

https://user-images.githubusercontent.com/940931/160249859-00d26f0b-ba52-48e5-a1b5-80cbb583d4ec.mov

# Game Rules
- Words must contain the original three characters, in the order in which they were given.  
- Words may consist of only letters.  
Punctuation is not supported yet.  
For example, words such as "don't", "check-in", or "full moon" are not accepted as solutions.
- Words may only be single words, and not compounds.
- Words may be up to 15 characters long.  
Longer words are not supported due to UI contraints.

# Game Features
- The server only provides puzzles with known solutions.
- All puzzles are graded for difficulty.
- The server provides simple puzzles, until directed by the web-app to provide more difficult ones.
- The server is stateless.
- The server doesn't track the user.
- The web-app doesn't collect any user data, and doesn't use cookies.

# Web-App Features

- The web-app uses a compact UI on a realistic license plate.
- Character input supports normal key entry and navigation, along with drag-and-drop.
- If the user attempts to delete one of the original three puzzle characters, the web-app prevents the change and signals the error with an animated color change.
-The communication status with the server is shown in the top section of page.  
These messages time-out as appropriate.
- The user may request a new game, optionally specifying the characters for the puzzle.
- The user may request hints.  
Each hint randomly shows the pattern for a single known solution.
- Recent answer results and hints are displayed in the bottom portion of the license plate, just below the main text input area.  
These messages time-out as appropriate.
- Answers are lised in a separate view displayed over the same license plate image.
- Answers are scored with Boggle and Scrabble scores.
- The difficulty of the correct answers for the current puzzle is used to select the difficulty of the following puzzle.
- A menu button (in the upper left) contains:
  - An about button that allows the user to pick a version of the web-app built with a different application framework.  
  Currently there are four versions of this web-app, each built with a different framework.  
  They are: plain HTML+CSS+JS (no framework), React JS, Vue.js, and this one with Aurelia.
  - A feedback button allows the user to pick a version of the web-app built with a different application framework.


# Known Errors

- The background doesn't display correctly on mobile devices.
- Duplicate messages may be displayed in either message area.
- The hamburger menu has inconsistent style.
- The New Game Controls should display a completion messgae for a few seconds immediately after a new game is started.
- There is no way for the user to contest a word.


