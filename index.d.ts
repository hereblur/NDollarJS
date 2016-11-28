declare module 'ndollar-js' {
	 class Point {
	    X: number;
	    Y: number;
	    constructor(X: number, Y: number);
	    static origin(): Point;
	} class Result {
	    Name: string;
	    Score: number;
	    constructor(Name: string, Score: number);
	} class Unistroke {
	    Name: string;
	    Points: Point[];
	    StartUnitVector: Point;
	    Vector: number[];
	    constructor(Name: string, useBoundedRotationInvariance: boolean, points: Point[]);
	} class Multistroke {
	    Name: string;
	    NumStrokes: number;
	    Unistrokes: Unistroke[];
	    constructor(Name: string, useBoundedRotationInvariance: boolean, strokes: Point[][]);
	} class Recognizer {
	    Multistrokes: Multistroke[];
	    constructor();
	    Recognize(strokes: Point[][], useBoundedRotationInvariance: boolean, requireSameNoOfStrokes: boolean, useProtractor: boolean): Result;
	    AddGesture(name: string, useBoundedRotationInvariance: boolean, strokes: Point[][]): number;
	    ClearGestures(): void;
	    LoadDefaultGestures(useBoundedRotationInvariance: boolean): void;
	}
	export { Point, Result, Unistroke, Multistroke, Recognizer };

}
