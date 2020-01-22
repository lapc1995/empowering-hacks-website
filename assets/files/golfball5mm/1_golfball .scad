// name of module
golfball();
// size of the golfball
module golfball(size=50, hole = 5, $fn=100) {
    // to get the position of the hole 
    difference() {
    // diameter of golfball    
    sphere(d=50);
    // positioning of the hole    
    translate([0,0,-25])
    // dimensions of the cylinder that made the hole    
    cylinder (d=hole, h=50, center = true);     
    }
}
