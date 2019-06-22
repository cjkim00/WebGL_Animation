//  build the object, including geometry (triangle vertices)
//  and possibly colors and normals for each vertex
function createMiddleGear(numTeeth, numSpokes) {
    const vertices = [];
    const colors = [];
    const normals = [];


    ////////////////////////////
    // Making gear triangles
    
    var n = numTeeth;//controls the number of teeth n/2
    var rad = 1.0; //controls the size of the gear
    var outRad = 0.9; //controls the length of the teeth
    var angInc = 2 * 3.14159 / n;//controls the % of the circle
    var ang = 0;
    var z = 0.1;
    var negativeZ = -z;

    var i;
    var temp = rad * 0.88;
    var innerEdge = 0.78;
    
    
    for (i = 0; i < n; i++) {

        vertices.push(innerEdge * Math.cos(ang), innerEdge * Math.sin(ang), z,
            temp * Math.cos(ang), temp * Math.sin(ang), z,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), z)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
        normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
        ang += angInc;

    }
    ang = 0;
    for (i = 0; i < n; i++) {

        vertices.push(innerEdge * Math.cos(ang), innerEdge * Math.sin(ang), z,
            innerEdge * Math.cos(ang + angInc), innerEdge * Math.sin(ang + angInc), z,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), z)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
        normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
        ang += angInc;

    }

    //back
    for (i = 0; i < n; i++) {

        vertices.push(innerEdge * Math.cos(ang), innerEdge * Math.sin(ang), negativeZ,
            temp * Math.cos(ang), temp * Math.sin(ang), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), negativeZ)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
        normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);
        ang += angInc;

    }
    ang = 0;
    for (i = 0; i < n; i++) {

        vertices.push(innerEdge * Math.cos(ang), innerEdge * Math.sin(ang), negativeZ,
            innerEdge * Math.cos(ang + angInc), innerEdge * Math.sin(ang + angInc), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), negativeZ)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5);
        normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);
        ang += angInc;

    }



    ang = 0;                          // coin edge top
    var drawTooth = true;
    var temp = rad * 0.88;//outer edge
    for (i = 0; i < n; i++) {
        drawTooth = !drawTooth;
        var norm = [temp * Math.cos(ang + angInc / 2), temp * Math.sin(ang + angInc / 2), 0];
        //if (drawTooth) {

        vertices.push(
            temp * Math.cos(ang), temp * Math.sin(ang), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), z)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
        normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])

        vertices.push(
            temp * Math.cos(ang), temp * Math.sin(ang), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), z,
            temp * Math.cos(ang), temp * Math.sin(ang), z)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
        normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])
        //}

        ang += angInc;
    }
    
    ang = 0;                          // coin edge bottom
    var drawTooth = true;
    var temp = rad * 0.78;//inner edge
    for (i = 0; i < n; i++) {
        drawTooth = !drawTooth;
        var norm = [temp * Math.cos(ang + angInc / 2), temp * Math.sin(ang + angInc / 2), 0];
        //if (drawTooth) {

        vertices.push(
            temp * Math.cos(ang), temp * Math.sin(ang), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), z)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
        normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])

        vertices.push(
            temp * Math.cos(ang), temp * Math.sin(ang), negativeZ,
            temp * Math.cos(ang + angInc), temp * Math.sin(ang + angInc), z,
            temp * Math.cos(ang), temp * Math.sin(ang), z)

        colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
        normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])
        //}

        ang += angInc;
    }
    
    


    //SLANTED TEETH FACES
    var r;
    var newZ = 0.03;
    var temp = z;
    var newNegativeZ = -0.03;
    rad = 0.88;//outer edge
    for (r = 0; r < 2; r++) {//draws the triangles twice
        ang = 0;
        var drawTooth = false;

        for (i = 0; i < n; i++) {       // face of the teeth
            drawTooth = !drawTooth;
            if (drawTooth) {
                vertices.push(rad * Math.cos(ang), rad * Math.sin(ang), z,//changing to newZ slants inward from the sides
                    rad * Math.cos(ang + angInc), rad * Math.sin(ang + angInc), z,//changing to newZ slants inward from the other side
                    outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newZ)

                colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)

                if (z > 0)
                    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
                else
                    normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);

                vertices.push(rad * Math.cos(ang), rad * Math.sin(ang), z,
                    outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newZ,
                    outRad * Math.cos(ang), outRad * Math.sin(ang), newZ);


                colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)

                if (z > 0)
                    normals.push(0, 0, 1, 0, 0, 1, 0, 0, 1);
                else
                    normals.push(0, 0, -1, 0, 0, -1, 0, 0, -1);

            }
            ang += angInc;
        }
        z = negativeZ; //problem here
    }
    z = temp;
    //z = -z;
    //END OF SLANTED TEETH FACES




    
    //SLANTED TEETH ROOF
    ang = 0;
    drawTooth = false;     // tooth roof
    for (i = 0; i < n; i++) {
        drawTooth = !drawTooth;
        if (drawTooth) {

            var norm = [outRad * Math.cos(ang + angInc / 2), outRad * Math.sin(ang + angInc / 2), 0];
            vertices.push(
                outRad * Math.cos(ang), outRad * Math.sin(ang), newNegativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newNegativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newZ)

            colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
            normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])

            vertices.push(
                outRad * Math.cos(ang), outRad * Math.sin(ang), newNegativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newZ,
                outRad * Math.cos(ang), outRad * Math.sin(ang), newZ)

            colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
            normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])

        }
        ang += angInc;
    }

    //END OF SLANTED TEETH ROOF
    ang = 0;

    drawTooth = false;
    for (i = 0; i < n; i++) {   // tooth walls
        drawTooth = !drawTooth;
        if (drawTooth) {


            var norm  = calcNormal(rad * Math.cos(ang), rad * Math.sin(ang), negativeZ,
                outRad * Math.cos(ang), outRad * Math.sin(ang), negativeZ,
                outRad * Math.cos(ang), outRad * Math.sin(ang), z);

            vertices.push(
                rad * Math.cos(ang), rad * Math.sin(ang), negativeZ,
                outRad * Math.cos(ang), outRad * Math.sin(ang), newZ,
                outRad * Math.cos(ang), outRad * Math.sin(ang), newNegativeZ)
            colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
            normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])


            vertices.push(
                rad * Math.cos(ang), rad * Math.sin(ang), negativeZ,
                outRad * Math.cos(ang), outRad * Math.sin(ang), newNegativeZ,
                rad * Math.cos(ang), rad * Math.sin(ang), z)
            colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
            normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])



            var norm = calcNormal(rad * Math.cos(ang + angInc), rad * Math.sin(ang + angInc), negativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), negativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), z);

            vertices.push(
                rad * Math.cos(ang + angInc), rad * Math.sin(ang + angInc), negativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newNegativeZ)
            colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
            normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])


            vertices.push(
                rad * Math.cos(ang + angInc), rad * Math.sin(ang + angInc), negativeZ,
                outRad * Math.cos(ang + angInc), outRad * Math.sin(ang + angInc), newNegativeZ,
                rad * Math.cos(ang + angInc), rad * Math.sin(ang + angInc), z)
            colors.push(0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5)
            normals.push(norm[0], norm[1], norm[2], norm[0], norm[1], norm[2], norm[0], norm[1], norm[2])


        }
        ang += angInc;
    }
    //END OF SLANTED TEETH WALLS
    
    


    return [vertices, colors, normals]
}




















function calcNormal(x1, y1, z1,
    x2, y2, z2,
    x3, y3, z3) {

    var ux = x2 - x1, uy = y2 - y1, uz = z2 - z1;
    var vx = x3 - x1, vy = y3 - y1, vz = z3 - z1;

    return [uy * vz - uz * vy,
    uz * vx - ux * vz,
    ux * vy - uy * vx];
}