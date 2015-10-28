'use strict';

var Player = function(game, x, y) {  
    // The super call to Phaser.Sprite
    var self = this;
    
    self.bullet;
    self.bulletTime = 0;
    
    // set the sprite's anchor to the center
    self.playerSpriteDimension = 32;
    var bmdPlayer = game.add.bitmapData(self.playerSpriteDimension,self.playerSpriteDimension);
    drawTriangle(bmdPlayer);
    Phaser.Sprite.call(this, game, x, y, bmdPlayer);
    
    //game.world.bringToTop(bmdPlayer);
    game.world.moveDown("star");
    
    self.anchor.setTo(0.5, 0.5);
    
    self.maxHealth = 20;
    
    self.health = self.maxHealth;
   
    //  We need to enable physics on the player
    game.physics.arcade.enable(self);
    //game.physics.p2.enable(self);
    
    //  Player physics properties. Give the little guy a slight bounce.
    self.body.bounce.y = 0.2;
    self.body.bounce.x = 0.2;
    //player.body.gravity.y = 300;
    //player.body.collideWorldBounds = true;
    
    self.body.drag.set(100);
    self.body.maxVelocity.set(400);
    
    self.emitter = game.add.emitter(0, 0, 400);
    //emitter = game.add.emitter(player.body.position.x, player.body.position.y, 400);
    
     self.emitter.makeParticles( [ 'star'] );
    
    //emitter.gravity = 200;
     self.emitter.setAlpha(1, 0, 500);
    self. emitter.setScale(0.8, 0, 0.8, 0, 500);
    
    // emitter.start(false, 3000, 5);
    
     self.emitter.lifespan = 500;
     self.emitter.maxParticleSpeed = new Phaser.Point(-150,50);
     self.emitter.minParticleSpeed = new Phaser.Point(-50,-50);
    
    self.addChild(self.emitter);
    
    var bmd = this.game.add.bitmapData(self.playerSpriteDimension, self.playerSpriteDimension/4);
		bmd.ctx.beginPath();
		bmd.ctx.rect(0, 0, self.playerSpriteDimension, self.playerSpriteDimension/4);
		bmd.ctx.fillStyle = '#00685e';
		bmd.ctx.fill();
    
    this.bglife = this.game.add.sprite(self.playerSpriteDimension/2, 5, bmd);
    this.bglife.anchor.set(0.5);
    
    bmd = this.game.add.bitmapData(self.playerSpriteDimension, self.playerSpriteDimension/5);
    bmd.ctx.beginPath();
	bmd.ctx.rect(0, 0, self.playerSpriteDimension, self.playerSpriteDimension/5);
	bmd.ctx.fillStyle = '#00f910';
	bmd.ctx.fill();
    
    this.widthLife = new Phaser.Rectangle(0, 0, bmd.width, bmd.height);
    this.totalLife = bmd.width;
    
    this.life = this.game.add.sprite(-self.playerSpriteDimension/2, 0, bmd);
    this.life.anchor.y = 0.5;
    this.life.cropEnabled = true;
    this.life.crop(this.widthLife);
    
     //this.life.addChild(bglife);
     //this.life.bringToTop(); 
     
     this.bglife.addChild(this.life);
     
     //self.addChild(this.life);
     
     //this.widthLife.width = 0;
    
}
    
    Player.prototype = Object.create(Phaser.Sprite.prototype);  
    
    Player.prototype.constructor = Player;
    
    Player.prototype.update = function() {
    var self = this;
    
   self.bglife.position.x = self.position.x;// + self.playerSpriteDimension/2;
   self.bglife.position.y = self.position.y+self.playerSpriteDimension;
    
    self.widthLife.width = self.health/self.maxHealth*self.totalLife;
    self.life.updateCrop();
    
    if(self.input != undefined){
            self.body.angularVelocity = self.input.X*300;
            
            //self.body.rotateRight(self.input.X*100);
            
            if(self.input.Y < 0){
                game.physics.arcade.accelerationFromRotation(self.rotation, -self.input.Y*200, self.body.acceleration);
                
                //self.body.thrust(-self.input.Y*200);
                
                self.emitter.emitParticle();
            }
            else{
                self.body.acceleration.set(0);
                
                 //self.body.thrust(0);
            }
            
            if(self.input.button1){
                self.fire();
            }
            
        }
        
     game.world.wrap(self, 0, true);

};

 Player.prototype.setInput = function(input) {
     this.input = input;

  // write your prefab's specific update code here

};

Player.prototype.fire = function() {
    //console.log("firee");
    var self = this;
    if (game.time.now > self.bulletTime)
    {
         self.bullet = game.state.getCurrentState().bullets.getFirstExists(false);

        if ( self.bullet)
        {
             self.bullet.reset( self.body.x + 16,  self.body.y + 16);
             self.bullet.lifespan = 2000;
             self.bullet.rotation =  self.rotation;
             
             
            game.physics.arcade.velocityFromRotation( self.rotation, 400, self.bullet.body.velocity);
            
             self.bulletTime = game.time.now + 50;
        }
    }

}


function drawTriangle(bmd) {
      bmd.ctx.fillStyle = 'white';
      bmd.ctx.strokeStyle = '#999';
      bmd.ctx.lineWidth = 2;
      bmd.ctx.beginPath();
      // Start from the top-left point.
      bmd.ctx.moveTo(0, 0); // give the (x,y) coordinates
      bmd.ctx.lineTo(bmd.width, bmd.height / 2);
      bmd.ctx.lineTo(0, bmd.height);
      bmd.ctx.lineTo(0, 0);
      // Done! Now fill the shape, and draw the stroke.
      // Note: your shape will not be visible until you call any of the two methods.
      bmd.ctx.fill();
      bmd.ctx.stroke();
      bmd.ctx.closePath();
    }
   
    

/*
function drawTriangle(bmd) {
      bmd.ctx.fillStyle = 'white';
      bmd.ctx.strokeStyle = '#999';
      bmd.ctx.lineWidth = 2;
      bmd.ctx.beginPath();
      // Start from the top-left point.
      bmd.ctx.moveTo(0, bmd.height); // give the (x,y) coordinates
      bmd.ctx.lineTo(bmd.width, bmd.height);
      bmd.ctx.lineTo(bmd.width /2, 0);
      
      bmd.ctx.lineTo(0, bmd.height);
      // Done! Now fill the shape, and draw the stroke.
      // Note: your shape will not be visible until you call any of the two methods.
      bmd.ctx.fill();
      bmd.ctx.stroke();
      bmd.ctx.closePath();
    }
    */
    
    
//module.exports = Player;