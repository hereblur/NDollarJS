# NDollar

Implementation of the [$N Multistroke Recognizer](https://depts.washington.edu/aimgroup/proj/dollar/ndollar.html), in TypeScript/UMD package.

Example,
###Using as a node module
```js
    var nDollar = require("ndollar-js");
    var recognizer = new nDollar.Recognizer();
    var useBoundedRotationInvariance = true;

    recognizer.LoadDefaultGestures( useBoundedRotationInvariance );

    var triangle = [[new nDollar.Point(30, 7),  new nDollar.Point(103, 7)],
                    [new nDollar.Point(103, 7), new nDollar.Point(66, 87)],
                    [new nDollar.Point(66, 87), new nDollar.Point(30, 7)]
                   ];

    recognizer.AddGesture( "triangle", useBoundedRotationInvariance, triangle);

    var myHandDrawingOfTriangle = [ [new nDollar.Point(20, 7),   new nDollar.Point(54, 8),  new nDollar.Point(100, 10)],
                                    [new nDollar.Point(103, 7),  new nDollar.Point(82, 47), new nDollar.Point(66, 87)],
                                    [new nDollar.Point(66, 87),  new nDollar.Point(45, 45), new nDollar.Point(30, 7)]
                                   ];

    result = recognizer.recognize( myHandDrawingOfTriangle, useBoundedRotationInvariance, requireSameNoOfStrokes, useProtractor);
    /*
      result = { Name: "triangle", Score: 8.076 }
    */
```
