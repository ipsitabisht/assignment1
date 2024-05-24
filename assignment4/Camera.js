class Camera {


    constructor (aspectratio, near, far) {
        this.type = "camera";
        this.fov = 100;
        this.eye = new Vector3([0,0.5,2]);
        this.at = new Vector3([0,0,0]);
        this.up = new Vector3([0,1,0]);
        this.speed = 0.7;
        this.alpha = 10;

        this.viewMatrix = new Matrix4();

        this.updateView();
        this.projectionMatrix = new Matrix4();

        // Initialize viewMatrix and projectionMatrix
        
        this.projectionMatrix.setPerspective(this.fov, aspectratio,near, far);

    }
    moveForward(speed) {
        let f = new Vector3().set(this.at).sub(this.eye).normalize().mul(this.speed);
        this.eye.add(f);
        this.at.add(f);
    }

    moveBackwards(speed) {
        let b = new Vector3().set(this.eye).sub(this.at).normalize().mul(this.speed);
        this.eye.add(b);
        this.at.add(b);
    }

    moveLeft(speed) {
        var l = new Vector3();
        l.set(this.at);
        l.sub(this.eye);
        l.normalize();
        l.mul(this.speed);
        var s = Vector3.cross(this.up, l);
        this.at.add(s);
        this.eye.add(s);
    }

    moveRight(speed) {
        var r = new Vector3();
        r.set(this.eye);
        r.sub(this.at);
        r.normalize();
        r.mul(this.speed);
        var s = Vector3.cross(this.up, r);
        this.at.add(s);
        this.eye.add(s);
    }
    panLeft(alpha) {
        let direction = new Vector3().set(this.at).sub(this.eye);
      
        let rotationMatrix = new Matrix4().setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
        let directionPrime = rotationMatrix.multiplyVector3(direction);
      
        // Update both eye and at vectors
        // this.eye.add(directionPrime);
        this.at.set(this.eye)
        this.at.add(directionPrime);
      
        // Update the view matrix
        this.updateView();
      }
      
      panRight(alpha) {
        let direction = new Vector3().set(this.at).sub(this.eye);
      
        let rotationMatrix = new Matrix4().setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
      
        let directionPrime = rotationMatrix.multiplyVector3(direction);
      
        // Update both eye and at vectors
        // this.eye.add(directionPrime);
        this.at.set(this.eye)
        this.at.add(directionPrime);
      
        // Update the view matrix
        this.updateView();
      }

    // panLeft(alpha) {
    //     let direction = new Vector3().set(this.at).sub(this.eye).normalize();
    
    
       
    //     let rotationMatrix = new Matrix4().setRotate(this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    

    //     let directionprime = rotationMatrix.multiplyVector3(direction);
    

    //     this.at.set(this.eye)
        
    //     this.at.add(directionprime);
    
    //     // Update the view matrix
    //     // this.updateView();
    //     // let f = new Vector3().set(this.at).sub(this.eye);
    //     // let rotationMatrix = new Matrix4().setRotate(alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    //     // let f_prime = rotationMatrix.multiplyVector3(f);
    //     // this.at.set(this.eye).add(f_prime);
    // }

    // panRight(alpha) {
    //     let direction = new Vector3().set(this.at).sub(this.eye).normalize();
    
    
       
    //     let rotationMatrix = new Matrix4().setRotate(-this.alpha, this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    

    //     let directionprime = rotationMatrix.multiplyVector3(direction);
    

    //     this.at.set(this.eye)
        
    //     this.at.add(directionprime);
    
    //     // Update the view matrix
    //     // this.updateView();
    // }

    updateView() {
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2],
                                  this.at.elements[0], this.at.elements[1], this.at.elements[2],
                                  this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

 
    // moveForward() {

    //     let f = new Vector3();
    //     f.set(this.at);
    //     f.sub(this.eye);
    //     f.normalize();
    //     f.mul(this.speed);
    //     this.at.add(f);
    //     this.eye.add(f);



    // }


    // moveBackward() {

    //     let b = new Vector3();
    //     b.set(this.eye);
    //     b.sub(this.at);
    //     b.normalize();
    //     b.mul(this.speed);
    //     this.at.add(b);
    //     this.eye.add(b);

    // }


    // moveLeft() {

    //     var l = new Vector3();
    //     l.set(this.at);
    //     l.sub(this.eye);
    //     l.normalize();
    //     l.mul(this.speed);
    //     var s = Vector3.cross(this.up, l);
    //     this.at.add(s);
    //     this.eye.add(s);

    // }

    // moveRight() {

    //     var r = new Vector3();
    //     r.set(this.eye);
    //     r.sub(this.at);
    //     r.normalize();
    //     r.mul(this.speed);
    //     var s = Vector3.cross(this.up, r);
    //     this.at.add(s);
    //     this.eye.add(s);

    // }

    // panLeft() {
    //     var p = new Vector3;
    //     p.set(this.at);
    //     this.panRight.sub(this.eye);
    //     var r = Math.sqrt(p.elements[0]*p.elements[0] + p.elements[2]*p.elements[2]);
    //     var theta = Math.atan2(p.elements[2], p.elements[0]);
    //     theta -= (5 * Math.PI / 180);
    //     p.elements[0] = r * Math.cos(theta);
    //     p.elements[2] = r * Math.sin(theta);
    //     this.at.set(p);
    //     this.at.add(this.eye);
    // }
    
    // panRight() {
    //     var p = new Vector3;
    //     p.set(this.at);
    //     p.sub(this.eye);
    //     var r = Math.sqrt(p.elements[0]*p.elements[0] + p.elements[2]*p.elements[2]);
    //     var theta = Math.atan2(p.elements[2], p.elements[0]);
    //     theta += (5 * Math.PI / 180);
    //     p.elements[0] = r * Math.cos(theta);
    //     p.elements[2] = r * Math.sin(theta);
    //     this.at.set(p);
    //     this.at.add(this.eye);
    // }

    // updateView() {
    //     this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
    //         this.at.elements[0], this.at.elements[1], this.at.elements[2], 
    //         this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    // }

}
