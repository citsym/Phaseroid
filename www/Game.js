'use strict';
var fragmentSrc = [

        "precision mediump float;",

        "uniform float     time;",
        "uniform vec2      resolution;",
        "uniform vec2      mouse;",

        "float noise(vec2 pos) {",
            "return fract(sin(dot(pos, vec2(12.9898 - time,78.233 + time))) * 43758.5453);",
        "}",

        "void main( void ) {",

            "vec2 normalPos = gl_FragCoord.xy / resolution.xy;",
            "float pos = (gl_FragCoord.y / resolution.y);",
            "float mouse_dist = length(vec2((mouse.x - normalPos.x) * (resolution.x / resolution.y) , mouse.y - normalPos.y));",
            "float distortion = clamp(1.0 - (mouse_dist + 0.1) * 3.0, 0.0, 1.0);",

            "pos -= (distortion * distortion) * 0.1;",

            "float c = sin(pos * 400.0) * 0.4 + 0.4;",
            "c = pow(c, 0.2);",
            "c *= 0.2;",

            "float band_pos = fract(time * 0.1) * 3.0 - 1.0;",
            "c += clamp( (1.0 - abs(band_pos - pos) * 10.0), 0.0, 1.0) * 0.1;",

            "c += distortion * 0.08;",
            "// noise",
            "c += (noise(gl_FragCoord.xy) - 0.5) * (0.09);",


            "gl_FragColor = vec4( 0.0, c, 0.0, 0.1 );",
        "}"
    ];

//var Player = require("prefabs/player");


var gameWidth = 500;
var gameHeight = 500;


var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game_div');
var game_state = {};

// Creates a new 'main' state that wil contain the game
game_state.main = function() { };  
game_state.main.prototype = new function(){
    
    var self = this;
    var cursors, player, emitter, enemies, box, collectables, pointer;
    var players = {};
    var playerGroup;
    
    var debugPlayer;
    
    self.bullets;
    
    var well;
    
    var filter, sprite;

    this.preload = function() {
		// Function called first to load all the assets
        game.load.image('hello', 'assets/Phaser-Logo-Small.png');
         game.load.image('player', 'assets/diamond.png');
         game.load.image('star', 'assets/star.png');
         
        var id = getGetParameter("id");
			if (!id)
				id = 1;
			
			//Note the port, it is one bigger for the screens!
				
			gameClient.connect("phaser-citsym.c9.io", 8082, id, self.clientConnected);	
			
			
	    
         
    };
    
   
    this.create = function() { 
        
        game.stage.disableVisibilityChange = true;
         
         
        
        filter = new Phaser.Filter(game, null, fragmentSrc);
        filter.setResolution(gameWidth, gameHeight);

        sprite = game.add.sprite();
        sprite.width = gameWidth;
        sprite.height = gameHeight;

        sprite.filters = [ filter ];
        
    	game.physics.startSystem(Phaser.Physics.ARCADE);
    	
    	//game.physics.startSystem(Phaser.Physics.P2JS);
    	//game.physics.p2.defaultRestitution = 0.8;
    	
        //this.hello_sprite = game.add.sprite(250, 300, 'hello');
       
       // this.player = game.add.sprite(250, 300, 'hello');
       cursors = game.input.keyboard.createCursorKeys();
       
        var bmd = game.add.bitmapData(32,32);

        bmd.ctx.beginPath();
        bmd.ctx.rect(0,0,32,32);
        bmd.ctx.fillStyle = '#ff0000';
        bmd.ctx.fill();
        
         var bmd2 = game.add.bitmapData(32,32);

        // draw to the canvas context like normal
        ///bmd.ctx.lineWidth = 2;
        bmd2.ctx.beginPath();
        bmd2.ctx.rect(0,0,32,32);
        bmd2.ctx.fillStyle = '#0000ff';
        bmd2.ctx.fill();
    
        // use the bitmap data as the texture for the sprite
        //var box  = game.add.sprite(200, 200, bmd);
        playerGroup = game.add.group();
        
        enemies = game.add.group();
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        enemies.enableBody = true;
        
        self.bullets = game.add.group();
        self.bullets.enableBody = true;
        self.bullets.physicsBodyType = Phaser.Physics.ARCADE;
    
    
        var color = 'rgba(255, 0, 0, 1)';
        var bulletBmd = this.game.make.bitmapData(16, 16);
        bulletBmd.circle(bulletBmd.width/2, bulletBmd.height/2, 8, color);
        //  All 40 of them
         self.bullets.createMultiple(40, bulletBmd);
         self.bullets.setAll('anchor.x', 0.5);
         self.bullets.setAll('anchor.y', 0.5);
        
       // box  = game.add.sprite(200, 200, bmd2);
        
        

        //game.physics.arcade.enable(box);
        //box.body.immovable      = true;

        for (var i = 0; i < 8; i++)
        {
            //  This creates a new Phaser.Sprite instance within the group
            //  It will be randomly placed within the world and use the 'baddie' image to display
            enemies.create(Math.random() * game.width,  Math.random() * game.height, bmd);
        }
        
        enemies.setAll('anchor.x', 0.5);
        enemies.setAll('anchor.y', 0.5);
        
        
        collectables = game.add.group();
        collectables.physicsBodyType = Phaser.Physics.ARCADE;
        collectables.enableBody = true;
        
        for (var i = 0; i < 16; i++)
        {
            //  This creates a new Phaser.Sprite instance within the group
            //  It will be randomly placed within the world and use the 'baddie' image to display
            collectables.create(Math.random() * game.width,  Math.random() * game.height, bmd2);
            
        }
        
        collectables.setAll('anchor.x', 0.5);
        collectables.setAll('anchor.y', 0.5);
        
        
        collectables.forEach(function(c){
            var tween = game.add.tween(c.scale).to( { x: .5, y:.5 }, 1000, "Linear", true, 0, -1);

        //  And this tells it to yoyo, i.e. fade back to zero again before repeating.
        //  The 3000 tells it to wait for 3 seconds before starting the fade back.
            tween.yoyo(true, 1000);
        });
        
        
        pointer =  game.add.sprite(game.width/2, game.height/2, 'star');
        pointer.anchor.setTo(0.5, 0.5);
        
        var color = 'rgba(0,255, 0, 0.3)';
        var radius = 80;
        var circleBmd = this.game.make.bitmapData(radius*2, radius*2);
        circleBmd.circle(circleBmd.width/2, circleBmd.height/2, radius, color);
        well  = game.add.sprite(100,100, circleBmd);
        well.anchor.setTo(0.5, 0.5);
        game.physics.arcade.enable(well);
        
    };
    
    self.getEnemies = function(){
        return enemies;
    }
    
    self.setOrientation = function(alpha, beta, gamma){
        
        var x = beta;  // In degree in the range [-180,180]
        var y = gamma; // In degree in the range [-90,90]
        
        // Because we don't want to have the device upside down
        // We constrain the x value to the range [-90,90]
        if (x >  90) { x =  90};
        if (x < -90) { x = -90};
        
        // To make computation easier we shift the range of 
        // x and y to [0,180]
        x += 90;
        y += 90;
        
        // 10 is half the size of the ball
        // It center the positioning point to the center of the ball
        //ball.style.top  = (maxX*x/180 - 10) + "px";
        //ball.style.left = (maxY*y/180 - 10) + "px";
            
        pointer.x = game.width*x/180;
        
        pointer.y = game.height*y/180;
        
        console.log(alpha + " "+beta +" " +gamma);
        
        //console.log(event);
    }
    
    
    self.setPlayerInput = function(id, input) {
        players[id].setInput(input);
        //console.log(input);
    }
    
    this.update = function() {
		// Function called 60 times per second
       
        enemies.forEach(function(e){
            e.angle += 2;
        });
       
        //filter.update(player);
        
        filter.update(playerGroup);
        
        //playerGroup.body.gravity = new Phaser.Point();
        playerGroup.setAll('body.gravity', new Phaser.Point());
        
        game.physics.arcade.overlap(playerGroup, well, gravity, null, this);
        
       
        game.physics.arcade.overlap(playerGroup, collectables, collisionHandler, null, this);
        
         game.physics.arcade.overlap(playerGroup, enemies, enemyCollisionHandler, null, this);
        
        game.physics.arcade.overlap(self.bullets, enemies, collisionHandler, null, this);
        
        game.physics.arcade.collide(playerGroup, box);

        self.bullets.forEachExists(function(b){
            game.world.wrap(b, 0, true);
        });
       
        if(debugPlayer != undefined){
            var input = {X:0, Y:0, button1:false, button2:false};
            
            if (cursors.up.isDown)
            {
               
                    input.Y = -1;
            }
            else
            {
               
                input.Y = 0;
            }
        
            if (cursors.left.isDown)
            {
               input.X = -1;
            }
            else if (cursors.right.isDown)
            {
                input.X = 1;
            }
            
            
           if (game.input.keyboard.isDown(Phaser.Keyboard.SPACEBAR))
            {
                input.button1 = true;
            }
            
            debugPlayer.setInput(input);
        }
        
        
        var nKey = game.input.keyboard.addKey(Phaser.Keyboard.N);
        nKey.onDown.add(addDebugPlayer, this);

 
       // game.world.wrap(player, 0, true);

    };
    
    this.render = function() {

        if(debugPlayer != undefined)
        game.debug.body(debugPlayer);

    }
    
    var addDebugPlayer = function()
    {
        if(debugPlayer == undefined){
        
            debugPlayer = new Player(game, game.world.width/2, game.world.height/2);
    		
    		playerGroup.add(debugPlayer);
        }
    }
    
    function drawBox(){
        
    };

    var collisionHandler = function(player, box){
        box.kill();
    };
    
    var enemyCollisionHandler = function(player, enemy){
        player.damage(5);
        enemy.kill();
    };
    
    var gravity = function(well, player){
        
       //game.physics.arcade.accelerateToObject(well, player, 50, 100, 100);
       
       //player.body.velocity -= Phaser.Point.subtract(well.body.position, player.body.position).setMagnitude(.001);
       //Phaser.Point.subtract(well.body.position, player.body.position);
       
       player.body.gravity = new Phaser.Point(well.body.x - player.body.x, well.body.y - player.body.y);
    // Normalize and multiply by actual strength of gravity desired
        player.body.gravity = player.body.gravity.normalize().multiply(300, 300);
       
    };
   
			
	self.sayHi = function(message)
		{
		alert(message);
		}
	
	self.getGameState = function(connectionId, callback)
		{
		console.log("DemoScreen::getGameState()");
		
		callback(null, {winner: "superkai", coordinates: [1,2,3]});
		}
	
	
	self.onControllerConnected = function(id)
		{
		console.log("OwnScreen::onControllerConnected() "+id);
		console.log("Currently connected controllers: " + gameClient.getConnectedClientIds());
		
		players[id] = new Player(game, game.world.width/2, game.world.height/2);
		
		playerGroup.add(players[id]);
        //game.add.existing(players[id]);
		
		};
	
	self.onControllerDisconnected = function(id)
		{
		console.log("OwnScreen::onControllerDisconnected() "+id);
		console.log("Currently connected controllers: " + gameClient.getConnectedClientIds());
		
		playerGroup.remove(players[id]);
		//players[id].kill();
		delete players[id];
		
	
		
		};	
	
	self.onScreenConnected = function(id)
		{
		console.log("OwnScreen::onScreenConnected() "+id);
		console.log("Currently connected screens: " + gameClient.getConnectedScreenIds());
		//gameClient.callServerRpc(1, "method", ["hello server"],  self, null);
		};
	
	self.onScreenDisconnected = function(id)
		{
		console.log("OwnScreen::onScreenDisconnected() "+id);
		console.log("Currently connected screens: " + gameClient.getConnectedScreenIds());
		};	
	
	
	self.clientConnected = function()
		{
		console.log("DemoScreen::screenConnected()");
		
		gameClient.setClientConnectionListener(self, self.onControllerConnected);
		gameClient.setClientDisconnectionListener(self, self.onControllerDisconnected);
		gameClient.setScreenConnectionListener(self, self.onScreenConnected);
		gameClient.setScreenDisconnectionListener(self, self.onScreenDisconnected);
		
		gameClient.exposeRpcMethod("sayHi", self, self.sayHi);
		gameClient.exposeRpcMethod("getGameState", self, self.getGameState);
		
		gameClient.exposeRpcMethod("setPlayerInput", self, self.setPlayerInput);
		
		gameClient.exposeRpcMethod("setOrientation", self, self.setOrientation);
		
		gameClient.callClientRpc(1, "setStickPosition", [211,100],  self, null);			
		gameClient.callClientRpc(1, "getStickPosition", [],  self, function(err, data)
			{
			console.log("Stick position received: "+data);
			});
		
		};
    
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 