declare class Point {
    X: number;
    Y: number;
    constructor(X: number, Y: number);
    static origin(): Point;
}
declare class Result {
    Name: string;
    Score: number;
    constructor(Name: string, Score: number);
}
declare class Unistroke {
    Name: string;
    Points: Point[];
    StartUnitVector: Point;
    Vector: number[];
    constructor(Name: string, useBoundedRotationInvariance: boolean, points: Point[]);
}
declare class Multistroke {
    Name: string;
    NumStrokes: number;
    Unistrokes: Unistroke[];
    constructor(Name: string, useBoundedRotationInvariance: boolean, strokes: Point[][]);
}
declare class Recognizer {
    Multistrokes: Multistroke[];
    constructor();
    Recognize(strokes: Point[][], useBoundedRotationInvariance: boolean, requireSameNoOfStrokes: boolean, useProtractor: boolean): Result;
    AddGesture(name: string, useBoundedRotationInvariance: boolean, strokes: Point[][]): number;
    ClearGestures(): void;
    LoadDefaultGestures(useBoundedRotationInvariance: boolean): void;
}
export { Point, Result, Unistroke, Multistroke, Recognizer };
