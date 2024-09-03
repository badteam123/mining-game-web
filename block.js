class Block {
    constructor(x, y, z, type) {

        this.x = x;
        this.y = y;
        this.z = z;
        this.type = type;
        this.lx;
        this.hx;
        this.ly;
        this.hy;

        switch (type) {
            case "grass":
                this.lx = 0.0;
                this.ly = 0.9;
                break;
            case "dirt":
                this.lx = 0.1;
                this.ly = 0.9;
                break;
            case "stone":
                this.lx = 0.2;
                this.ly = 0.9;
                break;
        }

        this.hx = this.lx + 0.1;
        this.hy = this.ly + 0.1;

    }

    collideFloor(){

      if(this.type != "air"){

        let inside;
        
        if(player.x - halfWidth < this.x + 0.5 && player.x + halfWidth > this.x - 0.5 && player.z - halfWidth < this.z + 0.5 && player.z + halfWidth > this.z - 0.5){
          inside = true;
        }
    
        if(inside){
          
          if(player.y - halfHeight > this.y + 0.5 && player.y - halfHeight + (player.yVel*deltaTime) < this.y + 0.5){
            //above, but hit ground next frame
            player.y = this.y + 0.5 + halfHeight + 0.0000001;
            player.yVel = 0;
            player.onGround = true;
          }
    
          if(player.y + halfHeight < this.y - 0.5 && player.y + halfHeight + (player.yVel*deltaTime) > this.y - 0.5){
            //under, but hit head next frame
            player.y = this.y - 0.5 - halfHeight - 0.0000001;
            player.yVel = 0;
          }
          
        }

      }
        
      }
    
    collide(h){

      if(this.type != "air"){

        let inY = false;
        let canStep = false;
        if(player.y - halfHeight + (player.yVel*deltaTime) < this.y + 0.5 && player.y + halfHeight + (player.yVel*deltaTime) > this.y - 0.5){
          inY = true;
          if( (this.y + 0.5) - (player.y - halfHeight) <= stepHeight){
            canStep = true;
          }
        }
    
        if(inY){
          
          let inX = false;
          let inXNext = false;
          let inZ = false;
          let inZNext = false;
    
          if(player.x + halfWidth > this.x - 0.5 && player.x - halfWidth < this.x + 0.5){
            inX = true;
          }
          if(player.z + halfWidth > this.z - 0.5 && player.z - halfWidth < this.z + 0.5){
            inZ = true;
          }
          if(player.x + halfWidth + (player.xVel*deltaTime) > this.x - 0.5 && player.x - halfWidth + (player.xVel*deltaTime) < this.x + 0.5){
            inXNext = true;
          }
          if(player.z + halfWidth + (player.zVel*deltaTime) > this.z - 0.5 && player.z - halfWidth + (player.zVel*deltaTime) < this.z + 0.5){
            inZNext = true;
          }
    
          if(inZ && !inX && inXNext){
            if(canStep && player.onGround){
              player.y = this.y + 0.5 + halfHeight + 0.0000001;
            } else {
              if(player.x < this.x){
                player.x = this.x - 0.5 - halfWidth;
                player.xVel = 0;
              }
              if(player.x > this.x){
                player.x = this.x + 0.5 + halfWidth;
                player.xVel = 0;
              }
            }
          }
    
          if(inX && !inZ && inZNext){
            if(canStep && player.onGround){
              player.y = this.y + 0.5 + halfHeight + 0.0000001;
            } else {
              if(player.z < this.z){
                player.z = this.z - 0.5 - halfWidth;
                player.zVel = 0;
              }
              if(player.z > this.z){
                player.z = this.z + 0.5 + halfWidth;
                player.zVel = 0;
              }
            }
          }
    
          //bugfix
          if(!inX && !inZ && inXNext && inZNext){
            if(Math.abs(player.xVel) > Math.abs(player.zVel)){
              if(player.z < this.z){
                player.z = this.z - 0.5 - halfWidth;
                player.zVel = 0;
              }
              if(player.z > this.z){
                player.z = this.z + 0.5 + halfWidth;
                player.zVel = 0;
              }
            } else {
              if(player.x < this.x){
                player.x = this.x - 0.5 - halfWidth;
                player.xVel = 0;
              }
              if(player.x > this.x){
                player.x = this.x + 0.5 + halfWidth;
                player.xVel = 0;
              }
            }
          }
          
        }

      } 
        
      }

}