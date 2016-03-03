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

var gameWidth = 1024;
var gameHeight = 1024;


var game = new Phaser.Game(gameWidth, gameHeight, Phaser.AUTO, 'game_div');
var game_state = {};

// Creates a new 'main' state that wil contain the game
game_state.main = function() { };  
game_state.main.prototype = new function(){
    
    var self = this;
    var cursors, player, emitter, enemies, box, collectables;
    var players = {};
    var playerGroup;
    
    var debugPlayer;
    
    self.bullets;
     
    var filter, sprite;

    const objectSize = 64;
    const glowSize = 8;
    const numberOfEnemies = 8;
    const numberOfCollectables = 16;

    var gameClient;

    this.preload = function() {
		// Function called first to load all the assets
        game.load.image('hello', 'assets/Phaser-Logo-Small.png');
        game.load.image('player', 'assets/diamond.png');
        game.load.image('star', 'assets/star.png');

        gameClient = new GameClient("screen", "owngroup");
         

        //gameClient.exposeRpcMethod( "onButtonPressed", self, self.onButtonPressed);         
        gameClient.connect(SERVER_ADDRESS.host, SERVER_ADDRESS.port, self.clientConnected);   

        /*
        var id = getGetParameter("id");
			if (!id)
				id = 1;
			
			//Note the port, it is one bigger for the screens!
				
			gameClient.connect("localhost", 8082, id, self.clientConnected);	
			
        */
			
	    
         
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
    	
        cursors = game.input.keyboard.createCursorKeys();
       
        playerGroup = game.add.group();

        createEnemies();
        createCollectables();

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

       
        
    };

    var createEnemies = function(){
        
        enemies = game.add.group();
        enemies.physicsBodyType = Phaser.Physics.ARCADE;
        enemies.enableBody = true;
  
        var bmd = game.add.bitmapData(objectSize,objectSize);
        
        bmd.ctx.lineWidth="4";
        bmd.ctx.strokeStyle='#ff0000';

        bmd.ctx.beginPath();
        bmd.ctx.rect(glowSize,glowSize,objectSize-glowSize*2,objectSize-glowSize*2);
        bmd.ctx.fillStyle = '#ff0000';
        //bmd.ctx.fill();
        bmd.ctx.stroke();
        
        for (var i = 0; i < numberOfEnemies; i++)
        {
            //  This creates a new Phaser.Sprite instance within the group
            //  It will be randomly placed within the world and use the 'baddie' image to display
            var enemy =enemies.create(Math.random() * game.width,  Math.random() * game.height, bmd);
            
            enemy.filters = [ game.add.filter('Glow') ];
            
            var tween = game.add.tween(enemy).to( { angle: 360 }, 4000, "Linear", true, 0, -1);
            
        }
        
        enemies.setAll('anchor.x', 0.5);
        enemies.setAll('anchor.y', 0.5);
    };
    
    var createCollectables = function(){
        
        collectables = game.add.group();
        collectables.physicsBodyType = Phaser.Physics.ARCADE;
        collectables.enableBody = true;
        
         var bmd2 = game.add.bitmapData(objectSize,objectSize);

        // draw to the canvas context like normal
        ///bmd.ctx.lineWidth = 2;
        bmd2.ctx.beginPath();
        bmd2.ctx.rect(glowSize,glowSize,objectSize-glowSize*2,objectSize-glowSize*2);
        bmd2.ctx.fillStyle = '#00ff00';
        bmd2.ctx.fill();

        for (var i = 0; i < numberOfCollectables; i++)
        {
            //  This creates a new Phaser.Sprite instance within the group
            //  It will be randomly placed within the world and use the 'baddie' image to display
            var collect = collectables.create(Math.random() * game.width,  Math.random() * game.height, bmd2);
            collect.filters = [ game.add.filter('Glow') ];
            
        }
        
        collectables.setAll('anchor.x', 0.5);
        collectables.setAll('anchor.y', 0.5);

        collectables.forEach(function(c){
            var tween = game.add.tween(c.scale).to( { x: .5, y:.5 }, 1000, "Linear", true, 0, -1);

        //  And this tells it to yoyo, i.e. fade back to zero again before repeating.
        //  The 3000 tells it to wait for 3 seconds before starting the fade back.
            tween.yoyo(true, 1000);
        });
        
    };
    
    var reset = function(){
        
        
        collectables.forEach(function(c){
            c.revive();
            c.position.x = Math.random() * game.width;  
            c.position.y = Math.random() * game.height;
        });
        
        enemies.forEachDead(function(e){
            e.revive();
            e.position.x = Math.random() * game.width;  
            e.position.y = Math.random() * game.height;
        });
        
    }

    self.getEnemies = function(){
        return enemies;
    }
    

    self.setPlayerInput = function(input, callerId, connectionId, callback) {
        players[callerId].setInput(input);
        //console.log(input);
    }
    
    this.update = function() {
		// Function called 60 times per second
      

        if(collectables.countLiving() == 0)
            reset();
       
         
        filter.update(playerGroup);
        
        playerGroup.setAll('body.gravity', new Phaser.Point());
        
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
    
    
    var collisionHandler = function(player, box){
        box.kill();
    };
    
    var enemyCollisionHandler = function(player, enemy){
        player.damage(5);
        enemy.kill();
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
		//console.log("Currently connected controllers: " + gameClient.getConnectedClientIds());
		
		players[id] = new Player(game, game.world.width/2, game.world.height/2);
		
		playerGroup.add(players[id]);
        //game.add.existing(players[id]);
		
		};
	
	self.onControllerDisconnected = function(id)
		{
		console.log("OwnScreen::onControllerDisconnected() "+id);
		//console.log("Currently connected controllers: " + gameClient.getConnectedClientIds());
		
		playerGroup.remove(players[id]);
		//players[id].kill();
		delete players[id];
		
	
		
		};	
	
	self.onScreenConnected = function(id)
		{
		console.log("OwnScreen::onScreenConnected() "+id);
		//console.log("Currently connected screens: " + gameClient.getConnectedScreenIds());
		//gameClient.callServerRpc(1, "method", ["hello server"],  self, null);
		};
	
	self.onScreenDisconnected = function(id)
		{
		console.log("OwnScreen::onScreenDisconnected() "+id);
		//console.log("Currently connected screens: " + gameClient.getConnectedScreenIds());
		};	
	
	
	self.clientConnected = function()
		{
		console.log("DemoScreen::screenConnected()"+self);


		
		gameClient.setControllerConnectionListener(self, self.onControllerConnected);
		gameClient.setControllerDisconnectionListener(self, self.onControllerDisconnected);
		gameClient.setScreenConnectionListener(self, self.onScreenConnected);
		gameClient.setScreenDisconnectionListener(self, self.onScreenDisconnected);
		
		//gameClient.exposeRpcMethod("sayHi", self, self.sayHi);
		//gameClient.exposeRpcMethod("getGameState", self, self.getGameState);
		
		gameClient.exposeRpcMethod("setPlayerInput", self, self.setPlayerInput);
		
		//gameClient.exposeRpcMethod("setOrientation", self, self.setOrientation);
		
        /*
		gameClient.callClientRpc(1, "setStickPosition", [211,100],  self, null);			
		gameClient.callClientRpc(1, "getStickPosition", [],  self, function(err, data)
			{
			console.log("Stick position received: "+data);
			});
		
        */
		};
        
    
};

// Add and start the 'main' state to start the game
game.state.add('main', game_state.main);  
game.state.start('main'); 
