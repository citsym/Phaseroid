Phaseroid
=========
Asteroids style public screen game.

Prequisities
------------
* git
* Node.js (tested with v4.2.6): https://nodejs.org
* npm (Node package manager, usually comes with the node installation, if not install separately)

Installing
----------
These instruction apply in the command-line with working git, node.js and npm. In Windows it's probably usefull to install [Git for Windows](https://git-for-windows.github.io/).

Checkout the code from Github

        git clone https://github.com/citsym/Phaseroid

Install dependencies with npm

        cd Phaseroid
        npm install

        cd spaceifyapplication/api
        npm install
        cd ../..

Running
-------
        node gameserver.js

This starts a http server for serving files and websocket communication server.

Big screen is served at: [http://localhost:8080/screen.html](http://localhost:8080/screen.html)

Mobile clients area served at: [http://localhost:8080/](http://localhost:8080/)


