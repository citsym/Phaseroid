'use strict';
var w = 1920/2;
var h = 1080/2;

//var w = window.innerWidth * window.devicePixelRatio,
//    h = window.innerHeight * window.devicePixelRatio;

var controller = new Phaser.Game(w, h, Phaser.AUTO, 'controller_div');
var controller_state = {};

// Creates a new 'main' state that wil contain the game
controller_state.main = function() { };  
controller_state.main.prototype = new function(){
    
    var self = this;
    var id;
    
    var game = controller;
    
    var button1 = false;
    var button2 = false;
    
    var alpha, beta, gamma;
   
    self.preload = function() {
        id = getGetParameter("id");
		if (!id)
			id = game.rnd.integerInRange(0, 1000);
				
		gameClient.connect("localhost", 8081, id, self.clientConnected);
		
	
	
        window.addEventListener('deviceorientation', deviceOrientationHandler, false);
       
		
    }
    
    var deviceOrientationHandler = function(eventData){
        //orientation = eventData;
        
        //console.log(eventData);
        
        //console.log();
        
        alpha = eventData.alpha;
        beta = eventData.beta;
        gamma = eventData.gamma;
      
      
    }
    
    self.render = function() {
    
        //if(orientation != undefined)
         //   game.debug.text( orientation.alpha, game.world.height/2, game.world.height/2 );
    
    
    }
    
    self.create = function(){
        
        //game.stage.backgroundColor = '#4d4d4d';

        // Stretch to fill
        game.scale.fullScreenScaleMode = Phaser.ScaleManager.EXACT_FIT;
        //Phaser.StageScaleMode.EXACT_FIT = 0;
        game.stage.disableVisibilityChange = true;
        
        var radius = 80;
        
        this.joystick = this.game.plugins.add(new Phaser.Plugin.VirtualJoystick(this));
        this.joystick.init(game.world.width/4, game.world.height - game.world.height/2,  radius*2, radius/3*4);
        this.joystick.start();
        //this.joystick.setVelocity(player, minSpeed, maxSpeed) {
        
       
        var color = 'rgba(255, 0, 0, 0.5)';
        var buttonBmd = this.game.make.bitmapData(radius*2, radius*2);

         buttonBmd.circle(buttonBmd.width/2, buttonBmd.height/2, radius, color);
        
        
        this.button = game.add.button(7*game.world.width/10, game.world.height - game.world.height/2, buttonBmd, null, this);
        this.button.anchor.set(0.5);
        this.button.onInputUp.add(buttonUp, this);
        this.button.onInputDown.add(buttonDown, this);
        
        this.button2 = game.add.button(9*game.world.width/10, game.world.height - game.world.height/2, buttonBmd, null, this);
        this.button2.anchor.set(0.5);
        this.button2.onInputUp.add(buttonUp2, this);
        this.button2.onInputDown.add(buttonDown2, this);
    }
    
    var buttonDown = function(){
        console.log("buttondown");
        button1 = true;
    }
    
    var buttonUp = function(){
        console.log("buttonup");
        button1 = false;
    }
    
    var buttonDown2 = function(){
        console.log("buttondown");
        button2 = true;
    }
    
    var buttonUp2 = function(){
        console.log("buttonup");
        button2 = false;
    }
    
    
    self.update = function(){
    var input = {X:this.joystick.deltaX, Y:this.joystick.deltaY, button1:button1, button2:button2};
        
        gameClient.callScreenRpc(1, "setPlayerInput", [id, input],  self, null);
        
        
        if(alpha != undefined)
            gameClient.callScreenRpc(1, "setOrientation", [alpha, beta, gamma],  self, null);
    }
    
			
	self.setStickPosition = function(position)
		{
		console.log("DemoController::setStickPosition() "+position);
		};
	
	self.getStickPosition = function(connectionId, callback)
		{
		console.log("DemoController::getStickPosition() ");
		callback(null, [666,667]);
		};
		
	self.clientConnected = function()
		{
		
		gameClient.exposeRpcMethod("setStickPosition", self, self.setStickPosition);
		gameClient.exposeRpcMethod("getStickPosition", self, self.getStickPosition);
		
		// The first parameter is the screen id
		// The last parameter is the callback, which must be null
		// if the call expects no return value. 
		// The second-last parameter is the object the callback should be 
		// invoked in. 
		
		/*
		gameClient.callScreenRpc(1, "sayHi", ["Terve teille!"],  self, null);	
		
		gameClient.callScreenRpc(1, "getGameState", [],  self, function(err, data)
			{
			console.log(data.winner);
			});
		*/			
		};
    
}

controller.state.add('main', controller_state.main);  
controller.state.start('main'); 

