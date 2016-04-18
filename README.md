#*Neighborhood Map*

##Intro

This single page application provides a view of selected bars and restaurants worth visiting around my home neighborhood of Astoria, Queens. The application is divided into three sections. The `FourSquare Recommendations` section displays restaurant listings in the drop down menu and on the map as markers from the 30 most popular restaurants in Astoria at the time of the search.

The `My Saved Locations` section displays any restaurants or bars the user saves through interaction with the map. Locations can be saved by clicking on the `Save Location!` button on a venue's map marker. All saved locations are held in the local storage of a user's browser.

The `Jeremy's Recommendations` section displays bars and restaurants that I recommend should people come to Astoria.

##How To Run

The application can be run in your browser. Download the zip file from github. Once on your machine, open `index.html` with your favorite web browser to run locally.

The application can also be run online [here](http://dooster.github.io/Neighborhood-Map/).

##Gulp Files and The Dist Index

I used Gulp to automate the minifcation of CSS and Javascript for 'index.html.' All the original files can be found at the 'src' directory. All the modified files are located in the 'dist' directory.

###Gulp and Dependencies

To run Gulp, it must be installed at the upper file level for the project. Once Gulp is installed, its various dependencies, indicated within the 'gulpfile' must also be installed locally at the project level. All required resources can be found marked as 'required' at the top of the 'gulpfile.'

To run gulp, navigate to the project folder through the command line. Once at the project level, you can run the gulp build with the command `gulp critical`. This will delete all files in the 'dist' folder, except the cached optimized images. The gulp command will then minify CSS and JavaScript, optimize images on the first run, inline all critical CSS into index.html, and it will overwrite the current index.html with the latest version.

##JavaScript Frameworks and Libraries

This application makes use of Knockout.JS and jQuery to effectively run. A minified version of jQuery and of knockout.js can be found in the `dist` directory. These frameworks allowed the application to more effectively interact with the DOM, and Knockout provides observable data allowing for easy DOM updates for just select elements.

Knockout's computed observables are also used to provide the filter functionality for the app. This filter compares a user input against the category property of the selected restaurants displayed on the screen. The filter then hides venues that do not contain parts of the user input.