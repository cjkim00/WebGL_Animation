
main();

function main() {
    ChrisGear(100, 6);
}
function ChrisGear(numTeeth, numSpokes) {
    makeGear(numTeeth, numSpokes, "Middle");
    //makeGear(numTeeth, numSpokes, "Outer");
    //makeGear(numTeeth, numSpokes, "Inner");
    return createGear(numTeeth, numSpokes);
}


