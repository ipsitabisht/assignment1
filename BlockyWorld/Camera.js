class Camera {


    constructor (aspectratio, near, far) {
        this.type = "camera";
        this.fov = 60;
        this.eye = new Vector3([0,1.55,0]);
        this.at = new Vector3([0,0,-1]);
        this.up = new Vector3([0,1,0]);
        this.speed = 2;
        this.alpha = 5;

        this.viewMatrix = new Matrix4();

        this.updateView();
        this.projectionMatrix = new Matrix4();

        // Initialize viewMatrix and projectionMatrix
        
        this.projectionMatrix.setPerspective(this.fov, aspectratio,near, far);

    }

 
    moveForward() {

        let f = new Vector3();
        f.set(this.at);
        f.sub(this.eye);
        f.normalize();
        f.mul(this.speed);
        this.at.add(f);
        this.eye.add(f);



    }


    moveBackward() {

        let b = new Vector3();
        b.set(this.eye);
        b.sub(this.at);
        b.normalize();
        b.mul(this.speed);
        this.at.add(b);
        this.eye.add(b);

    }


    moveLeft() {

        var l = new Vector3();
        l.set(this.at);
        l.sub(this.eye);
        l.normalize();
        l.mul(this.speed);
        var s = Vector3.cross(this.up, l);
        this.at.add(s);
        this.eye.add(s);

    }

    moveRight() {

        var r = new Vector3();
        r.set(this.eye);
        r.sub(this.at);
        r.normalize();
        r.mul(this.speed);
        var s = Vector3.cross(this.up, r);
        this.at.add(s);
        this.eye.add(s);

    }

    panLeft() {
        var atP = new Vector3;
        atP.set(this.at);
        atP.sub(this.eye);
        var r = Math.sqrt(atP.elements[0]*atP.elements[0] + atP.elements[2]*atP.elements[2]);
        var theta = Math.atan2(atP.elements[2], atP.elements[0]);
        theta -= (5 * Math.PI / 180);
        atP.elements[0] = r * Math.cos(theta);
        atP.elements[2] = r * Math.sin(theta);
        this.at.set(atP);
        this.at.add(this.eye);
    }
    
    panRight() {
        var atP = new Vector3;
        atP.set(this.at);
        atP.sub(this.eye);
        var r = Math.sqrt(atP.elements[0]*atP.elements[0] + atP.elements[2]*atP.elements[2]);
        var theta = Math.atan2(atP.elements[2], atP.elements[0]);
        theta += (5 * Math.PI / 180);
        atP.elements[0] = r * Math.cos(theta);
        atP.elements[2] = r * Math.sin(theta);
        this.at.set(atP);
        this.at.add(this.eye);
    }

    updateView() {
        this.viewMatrix.setLookAt(this.eye.elements[0], this.eye.elements[1], this.eye.elements[2], 
            this.at.elements[0], this.at.elements[1], this.at.elements[2], 
            this.up.elements[0], this.up.elements[1], this.up.elements[2]);
    }

}