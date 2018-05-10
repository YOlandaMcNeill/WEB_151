// (Frogger like)create a new scene named "Game"
let gameScene = new Phaser.Scene('Game');


// some parameters for our scene
gameScene.init = function() {
  this.playerSpeed = 2.7;
  this.enemySpeed = 4.8;
  this.enemyMaxY = 580;
  this.enemyMinY = 80;
}

// load asset files for our game
gameScene.preload = function() {

  // load images
  this.load.image('background', 'assets/underwater_night.png');
  this.load.spritesheet('player', 'assets/SB_wave.png', {frameWidth: 400, frameHeight: 250});
  this.load.spritesheet('plankton', 'assets/planktonLaugh.png',{frameWidth: 480, frameHeight: 360});
  this.load.image('treasure', 'assets/treasure.png');
};

// executed once, after assets were loaded
gameScene.create = function() {

  // background
  let bg = this.add.sprite(0, 0, 'background');

  // change origin to the top-left of the sprite
  bg.setOrigin(0, 0);
  
  //
  bg.setScale(1.0, 1.0);

  // player
  this.player = this.add.sprite(40, this.sys.game.config.height / 2, 'player');
  
  //player animation
  this.anims.create({
	  key: 'walk',
	  frames: this.anims.generateFrameNumbers('player', { start: 0, end: 16}),
	  frameRate: 17,
	  repeat: -1 //always repeat
  });
  
  this.anims.create({
	  key: 'stand',
	  frames: this.anims.generateFrameNumbers('player', { start: 7, end: 9}),
	  frameRate: 2,
	  repeat: -1
  });
  
  //
  this.player.anims.play('walk', true);

  // scale down
  this.player.setScale(0.2);

  // goal
  this.treasure = this.add.sprite(this.sys.game.config.width - 80, this.sys.game.config.height / 2, 'treasure');
  this.treasure.setScale(0.6);

  // group of enemies
  this.enemies = this.add.group({
    key: 'plankton',
    repeat: 3,
    setXY: {
      x: 110,
      y: 100,
      stepX: 200,
      stepY: 20
    }
  });

  // scale enemies
  Phaser.Actions.ScaleXY(this.enemies.getChildren(), -0.9, -0.9);
  
  //animate enemy
  this.anims.create({
	  key: 'laugh',
	  frames: this.anims.generateFrameNumbers('plankton', { start: 0, end: 26}),
	  frameRate: 8,
	  repeat: -1 //always repeat
  });   
   let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {
  enemies[i].anims.play('laugh', true);}
  

  // set speeds
  Phaser.Actions.Call(this.enemies.getChildren(), function(enemy) {
    enemy.speed = Math.random() * 2 + 1;
  }, this);

  // player is alive
  this.isPlayerAlive = true;

  // reset camera
  this.cameras.main.resetFX();
};

// executed on every frame (60 times per second)
gameScene.update = function() {

  // only if the player is alive
  if (!this.isPlayerAlive) {
    return;
  }

  // check for active input
  if (this.input.activePointer.isDown) {

    // player walks
    this.player.x += this.playerSpeed;
	
	this.player.anims.play('walk', true);
  }
  else
  {
	  this.player.anims.play('stand', true);
  }

  // treasure collision
  if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), this.treasure.getBounds())) {
    this.gameOver();
  }

  // enemy movement and collision
  let enemies = this.enemies.getChildren();
  let numEnemies = enemies.length;

  for (let i = 0; i < numEnemies; i++) {

    // move enemies
    enemies[i].y += enemies[i].speed;

    // reverse movement if reached the edges
    if (enemies[i].y >= this.enemyMaxY && enemies[i].speed > 0) {
      enemies[i].speed *= -1;
    } else if (enemies[i].y <= this.enemyMinY && enemies[i].speed < 0) {
      enemies[i].speed *= -1;
    }

    // enemy collision
    if (Phaser.Geom.Intersects.RectangleToRectangle(this.player.getBounds(), enemies[i].getBounds())) {
      this.gameOver();
      break;
    }
  }
};

gameScene.gameOver = function() {

  // flag to set player is dead
  this.isPlayerAlive = false;

  // shake the camera
  this.cameras.main.shake(500);

  // fade camera
  this.time.delayedCall(250, function() {
    this.cameras.main.fade(250);
  }, [], this);

  // restart game
  this.time.delayedCall(500, function() {
    this.scene.restart();
  }, [], this);
};


// our game's configuration
let config = {
  type: Phaser.AUTO,
  width: 1000,
  height: 580,
  scene: gameScene
};

// create the game, and pass it the configuration
let game = new Phaser.Game(config);
