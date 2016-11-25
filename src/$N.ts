"use strict";

let DistanceAtAngle = (points: Point[], T: Unistroke, radians: number): number => {
  let newpoints = RotateBy(points, radians);
  return PathDistance(newpoints, T.Points);
}

let Centroid = (points: Point[]): Point => {
  let x = 0.0, y = 0.0;
  for (let i = 0; i < points.length; i++) {
    x += points[i].X;
    y += points[i].Y;
  }
  x /= points.length;
  y /= points.length;
  return new Point(x, y);
}

let BoundingBox = (points: Point[]): Rectangle => {
  let minX = +Infinity, maxX = -Infinity, minY = +Infinity, maxY = -Infinity;
  for (let i = 0; i < points.length; i++) {
    minX = Math.min(minX, points[i].X);
    minY = Math.min(minY, points[i].Y);
    maxX = Math.max(maxX, points[i].X);
    maxY = Math.max(maxY, points[i].Y);
  }
  return new Rectangle(minX, minY, maxX - minX, maxY - minY);
}

let PathDistance = (pts1: Point[], pts2: Point[]): number => { // average distance between corresponding points in two paths
  let d = 0.0;
  for (let i = 0; i < pts1.length; i++) // assumes pts1.length == pts2.length
    d += Distance(pts1[i], pts2[i]);
  return d / pts1.length;
}

let PathLength = (points: Point[]): number => {// length traversed by a point path
  let d = 0.0;
  for (let i = 1; i < points.length; i++)
    d += Distance(points[i - 1], points[i]);
  return d;
}

let Distance = (p1: Point, p2: Point): number => { // distance between two points
  let dx = p2.X - p1.X;
  let dy = p2.Y - p1.Y;
  return Math.sqrt(dx * dx + dy * dy);
}

let CalcStartUnitVector = (points: Point[], index: number): Point => { // start angle from points[0] to points[index] normalized as a unit vector
  let v = new Point(points[index].X - points[0].X, points[index].Y - points[0].Y);
  let len = Math.sqrt(v.X * v.X + v.Y * v.Y);
  return new Point(v.X / len, v.Y / len);
}

let AngleBetweenUnitVectors = (v1: Point, v2: Point): number => { // gives acute angle between unit vectors from (0, 0) to v1, and (0, 0) to v2
  let n = (v1.X * v2.X + v1.Y * v2.Y);
  if (n < -1.0 || n > +1.0)
    n = Round(n, 5); // fix: JavaScript rounding bug that can occur so that -1 <= n <= +1
  return Math.acos(n); // arc cosine of the vector dot product
}

let Round = (n: number, d: number): number => { d = Math.pow(10, d); return Math.round(n * d) / d; } // round 'n' to 'd' decimals

let Deg2Rad = (d: number): number => { return (d * Math.PI / 180.0); }

let Resample = (points: Point[], numPoint: number): Point[] => {
  let I = PathLength(points) / (numPoint - 1); // interval length
  let D = 0.0;
  let newpoints = new Array(points[0]);
  for (let i = 1; i < points.length; i++) {
    let d = Distance(points[i - 1], points[i]);
    if ((D + d) >= I) {
      let qx = points[i - 1].X + ((I - D) / d) * (points[i].X - points[i - 1].X);
      let qy = points[i - 1].Y + ((I - D) / d) * (points[i].Y - points[i - 1].Y);
      let q = new Point(qx, qy);
      newpoints[newpoints.length] = q; // append new point 'q'
      points.splice(i, 0, q); // insert 'q' at position i in points s.t. 'q' will be the next i
      D = 0.0;
    }
    else {
      D += d;
    }
  }
  if (newpoints.length === numPoint - 1) { // somtimes we fall a rounding-error short of adding the last point, so add it if so
    newpoints[newpoints.length] = new Point(points[points.length - 1].X, points[points.length - 1].Y);
  }
  return newpoints;
}

let IndicativeAngle = (points: Point[]): number => {
  let c = Centroid(points);
  return Math.atan2(c.Y - points[0].Y, c.X - points[0].X);
}

let HeapPermute = (n: number, order: number[], /*out*/ orders: number[][]): void => {
  if (n === 1) {
    orders[orders.length] = order.slice(); // append copy
  }
  else {
    for (let i = 0; i < n; i++) {
      HeapPermute(n - 1, order, orders);
      if (n % 2 === 1) { // swap 0, n-1
        let tmp = order[0];
        order[0] = order[n - 1];
        order[n - 1] = tmp;
      }
      else { // swap i, n-1
        let tmp_ = order[i];
        order[i] = order[n - 1];
        order[n - 1] = tmp_;
      }
    }
  }
}

let MakeUnistrokes = (strokes: Point[][], orders: number[][]): Point[][] => {
  let unistrokes = []; // array of point arrays
  for (let r = 0; r < orders.length; r++) {
    for (let b = 0; b < Math.pow(2, orders[r].length); b++) { // use b's bits for directions
      let unistroke = []; // array of points
      for (let i = 0; i < orders[r].length; i++) {
        let pts;
        if (((b >> i) & 1) === 1) {  // is b's bit at index i on?
          pts = strokes[orders[r][i]].slice().reverse(); // copy and reverse
        } else {
          pts = strokes[orders[r][i]].slice(); // copy
        }
        for (let p = 0; p < pts.length; p++) {
          unistroke[unistroke.length] = pts[p]; // append points
        }
      }
      unistrokes[unistrokes.length] = unistroke; // add one unistroke to set
    }
  }
  return unistrokes;
}

let CombineStrokes = (strokes: Point[][]): Point[] => {
  let points = [];
  for (let s = 0; s < strokes.length; s++) {
    for (let p = 0; p < strokes[s].length; p++) {
      points[points.length] = new Point(strokes[s][p].X, strokes[s][p].Y);
    }
  }
  return points;
}

let RotateBy = (points: Point[], radians: number): Point[] => { // rotates points around centroid
  let c = Centroid(points);
  let cos = Math.cos(radians);
  let sin = Math.sin(radians);
  let newpoints = [];
  for (let i = 0; i < points.length; i++) {
    let qx = (points[i].X - c.X) * cos - (points[i].Y - c.Y) * sin + c.X
    let qy = (points[i].X - c.X) * sin + (points[i].Y - c.Y) * cos + c.Y;
    newpoints[newpoints.length] = new Point(qx, qy);
  }
  return newpoints;
}

let ScaleDimTo = (points: Point[], size: number, ratio1D: number) => {// scales bbox uniformly for 1D, non-uniformly for 2D
  let B = BoundingBox(points);
  let uniformly = Math.min(B.Width / B.Height, B.Height / B.Width) <= ratio1D; // 1D or 2D gesture test
  let newpoints = [];
  for (let i = 0; i < points.length; i++) {
    let qx = uniformly ? points[i].X * (size / Math.max(B.Width, B.Height)) : points[i].X * (size / B.Width);
    let qy = uniformly ? points[i].Y * (size / Math.max(B.Width, B.Height)) : points[i].Y * (size / B.Height);
    newpoints[newpoints.length] = new Point(qx, qy);
  }
  return newpoints;
}

let TranslateTo = (points: Point[], pt: Point): Point[] => { // translates points' centroid
  let c = Centroid(points);
  let newpoints = [];
  for (let i = 0; i < points.length; i++) {
    let qx = points[i].X + pt.X - c.X;
    let qy = points[i].Y + pt.Y - c.Y;
    newpoints[newpoints.length] = new Point(qx, qy);
  }
  return newpoints;
}

let Vectorize = (points: Point[], useBoundedRotationInvariance: boolean): number[] => { // for Protractor
  let cos = 1.0;
  let sin = 0.0;
  if (useBoundedRotationInvariance) {
    let iAngle = Math.atan2(points[0].Y, points[0].X);
    let baseOrientation = (Math.PI / 4.0) * Math.floor((iAngle + Math.PI / 8.0) / (Math.PI / 4.0));
    cos = Math.cos(baseOrientation - iAngle);
    sin = Math.sin(baseOrientation - iAngle);
  }
  let sum = 0.0;
  let vector = [];
  for (let i = 0; i < points.length; i++) {
    let newX = points[i].X * cos - points[i].Y * sin;
    let newY = points[i].Y * cos + points[i].X * sin;
    vector[vector.length] = newX;
    vector[vector.length] = newY;
    sum += newX * newX + newY * newY;
  }
  let magnitude = Math.sqrt(sum);
  for (let i = 0; i < vector.length; i++)
    vector[i] /= magnitude;
  return vector;
}

let OptimalCosineDistance = (v1: number[], v2: number[]): number => {// for Protractor
  let a = 0.0;
  let b = 0.0;
  for (let i = 0; i < v1.length; i += 2) {
    a += v1[i] * v2[i] + v1[i + 1] * v2[i + 1];
                b += v1[i] * v2[i + 1] - v1[i + 1] * v2[i];
  }
  let angle = Math.atan(b / a);
  return Math.acos(a * Math.cos(angle) + b * Math.sin(angle));
}

let DistanceAtBestAngle = (points: Point[], T: Unistroke, a: number, b: number, threshold: number): number => {
  let x1 = Phi * a + (1.0 - Phi) * b;
  let f1 = DistanceAtAngle(points, T, x1);
  let x2 = (1.0 - Phi) * a + Phi * b;
  let f2 = DistanceAtAngle(points, T, x2);
  while (Math.abs(b - a) > threshold) {
    if (f1 < f2) {
      b = x2;
      x2 = x1;
      f2 = f1;
      x1 = Phi * a + (1.0 - Phi) * b;
      f1 = DistanceAtAngle(points, T, x1);
    } else {
      a = x1;
      x1 = x2;
      f1 = f2;
      x2 = (1.0 - Phi) * a + Phi * b;
      f2 = DistanceAtAngle(points, T, x2);
    }
  }
  return Math.min(f1, f2);
}

//
// NDollarRecognizer class constants
//
const NumPoints = 96;
const SquareSize = 250.0;
const OneDThreshold = 0.25; // customize to desired gesture set (usually 0.20 - 0.35)
const Diagonal = Math.sqrt(SquareSize * SquareSize + SquareSize * SquareSize);
const HalfDiagonal = 0.5 * Diagonal;
const AngleRange = Deg2Rad(45.0);
const AnglePrecision = Deg2Rad(2.0);
const Phi = 0.5 * (-1.0 + Math.sqrt(5.0)); // Golden Ratio
const StartAngleIndex = (NumPoints / 8); // eighth of gesture length
const AngleSimilarityThreshold = Deg2Rad(30.0);


export class Point {
  constructor(public X: number, public Y: number) {}

  static origin() {
      return new Point(0, 0);
  }
}

export class Rectangle {
  constructor(public X: number, public Y: number, public Width: number, public Height: number) {}
}

export class Result {
  constructor(public Name: string, public Score: number) {}
}

export class Unistroke {
  Points: Point[];
  StartUnitVector: Point;
  Vector: number[];

  constructor(public Name: string, useBoundedRotationInvariance: boolean, points: Point[]) {

    this.Points = Resample(points, NumPoints);
    let radians = IndicativeAngle(this.Points);
    this.Points = RotateBy(this.Points, - radians);
    this.Points = ScaleDimTo(this.Points, SquareSize, OneDThreshold);
    if (useBoundedRotationInvariance)
      this.Points = RotateBy(this.Points, +radians); // restore
    this.Points = TranslateTo(this.Points, Point.origin());
    this.StartUnitVector = CalcStartUnitVector(this.Points, StartAngleIndex);
    this.Vector = Vectorize(this.Points, useBoundedRotationInvariance); // for Protractor
  }
}

//
// Multistroke class: a container for unistrokes
//
export class Multistroke {
  NumStrokes: number;
  Unistrokes: Unistroke[];

  constructor(public Name: string, useBoundedRotationInvariance: boolean, strokes: Point[][]) {
    this.NumStrokes = strokes.length; // number of individual strokes
    let order = new Array(strokes.length); // array of integer indices
    for (let i = 0; i < strokes.length; i++) {
        order[i] = i; // initialize
    }

    let orders = []; // array of integer arrays
    HeapPermute(strokes.length, order, /*out*/ orders);

    let unistrokes = MakeUnistrokes(strokes, orders); // returns array of point arrays
    this.Unistrokes = new Array(unistrokes.length); // unistrokes for this multistroke
    for (let j = 0; j < unistrokes.length; j++) {
      this.Unistrokes[j] = new Unistroke(this.Name, useBoundedRotationInvariance, unistrokes[j]);
    }
  }
}

//
// Result class
//
//
// NDollarRecognizer class
//
export class Recognizer {
  Multistrokes: Multistroke[];
  constructor() {// constructor
    this.Multistrokes = [];
  }
  //
  // The $N Gesture Recognizer API begins here -- 3 methods: Recognize(), AddGesture(), and DeleteUserGestures()
  //
  Recognize(strokes: Point[][] , useBoundedRotationInvariance: boolean, requireSameNoOfStrokes: boolean, useProtractor: boolean): Result {
    let points = CombineStrokes(strokes); // make one connected unistroke from the given strokes
    points = Resample(points, NumPoints);
    let radians = IndicativeAngle(points);
    points = RotateBy(points, -radians);
    points = ScaleDimTo(points, SquareSize, OneDThreshold);
    if (useBoundedRotationInvariance)
      points = RotateBy(points, +radians); // restore
    points = TranslateTo(points, Point.origin());
    let startv = CalcStartUnitVector(points, StartAngleIndex);
    let vector = Vectorize(points, useBoundedRotationInvariance); // for Protractor

    let b = +Infinity;
    let u = -1;
    for (let i = 0; i < this.Multistrokes.length; i++) { // for each multistroke
      if (!requireSameNoOfStrokes || strokes.length === this.Multistrokes[i].NumStrokes) { // optional -- only attempt match when same # of component strokes
        for (let j = 0; j < this.Multistrokes[i].Unistrokes.length; j++) { // each unistroke within this multistroke
          if (AngleBetweenUnitVectors(startv, this.Multistrokes[i].Unistrokes[j].StartUnitVector) <= AngleSimilarityThreshold) { // strokes start in the same direction
            let d;
            if (useProtractor) // for Protractor
              d = OptimalCosineDistance(this.Multistrokes[i].Unistrokes[j].Vector, vector);
            else // Golden Section Search (original $N)
              d = DistanceAtBestAngle(points, this.Multistrokes[i].Unistrokes[j], -AngleRange, +AngleRange, AnglePrecision);
            if (d < b) {
              b = d; // best (least) distance
              u = i; // multistroke owner of unistroke
            }
          }
        }
      }
    }
    return (u === -1) ? new Result("No match.", 0.0) : new Result(this.Multistrokes[u].Name, useProtractor ? 1.0 / b : 1.0 - b / HalfDiagonal);
  }

  AddGesture(name: string, useBoundedRotationInvariance: boolean, strokes) {
    this.Multistrokes.push( new Multistroke(name, useBoundedRotationInvariance, strokes) );
    let num = 0;
    for (let i = 0; i < this.Multistrokes.length; i++) {
      if (this.Multistrokes[i].Name === name)
        num++;
    }
    return num;
  }

  ClearGestures() {
    this.Multistrokes = [];
  }

  LoadDefaultGestures(useBoundedRotationInvariance: boolean) {

    this.Multistrokes.push(new Multistroke("T", useBoundedRotationInvariance, [
      [new Point(30, 7), new Point(103, 7)],
      [new Point(66, 7), new Point(66, 87)]
    ]));
    this.Multistrokes.push(new Multistroke("N", useBoundedRotationInvariance, [
      [new Point(177, 92), new Point(177, 2)],
      [new Point(182, 1), new Point(246, 95)],
      [new Point(247, 87), new Point(247, 1)]
    ]));
    this.Multistrokes.push(new Multistroke("D", useBoundedRotationInvariance, [
      [new Point(345, 9), new Point(345, 87)],
      [new Point(351, 8), new Point(363, 8), new Point(372, 9), new Point(380, 11), new Point(386, 14), new Point(391, 17), new Point(394, 22), new Point(397, 28), new Point(399, 34), new Point(400, 42), new Point(400, 50), new Point(400, 56), new Point(399, 61), new Point(397, 66), new Point(394, 70), new Point(391, 74), new Point(386, 78), new Point(382, 81), new Point(377, 83), new Point(372, 85), new Point(367, 87), new Point(360, 87), new Point(355, 88), new Point(349, 87)]
    ]));
    this.Multistrokes.push(new Multistroke("P", useBoundedRotationInvariance, [
      [new Point(507, 8), new Point(507, 87)],
      [new Point(513, 7), new Point(528, 7), new Point(537, 8), new Point(544, 10), new Point(550, 12), new Point(555, 15), new Point(558, 18), new Point(560, 22), new Point(561, 27), new Point(562, 33), new Point(561, 37), new Point(559, 42), new Point(556, 45), new Point(550, 48), new Point(544, 51), new Point(538, 53), new Point(532, 54), new Point(525, 55), new Point(519, 55), new Point(513, 55), new Point(510, 55)]
    ]));
    this.Multistrokes.push(new Multistroke("X", useBoundedRotationInvariance, [
      [new Point(30, 146), new Point(106, 222)],
      [new Point(30, 225), new Point(106, 146)]
    ]));
    this.Multistrokes.push(new Multistroke("H", useBoundedRotationInvariance, [
      [new Point(188, 137), new Point(188, 225)],
      [new Point(188, 180), new Point(241, 180)],
      [new Point(241, 137), new Point(241, 225)]
    ]));
    this.Multistrokes.push(new Multistroke("I", useBoundedRotationInvariance, [
      [new Point(371, 149), new Point(371, 221)],
      [new Point(341, 149), new Point(401, 149)],
      [new Point(341, 221), new Point(401, 221)]
    ]));
    this.Multistrokes.push(new Multistroke("exclamation", useBoundedRotationInvariance, [
      [new Point(526, 142), new Point(526, 204)],
      [new Point(526, 221)]
    ]));
    this.Multistrokes.push(new Multistroke("line", useBoundedRotationInvariance, [
      [new Point(12, 347), new Point(119, 347)]
    ]));
    this.Multistrokes.push(new Multistroke("five-point star", useBoundedRotationInvariance, [
      [new Point(177, 396), new Point(223, 299), new Point(262, 396), new Point(168, 332), new Point(278, 332), new Point(184, 397)]
    ]));
    this.Multistrokes.push(new Multistroke("null", useBoundedRotationInvariance, [
      [new Point(382, 310), new Point(377, 308), new Point(373, 307), new Point(366, 307), new Point(360, 310), new Point(356, 313), new Point(353, 316), new Point(349, 321), new Point(347, 326), new Point(344, 331), new Point(342, 337), new Point(341, 343), new Point(341, 350), new Point(341, 358), new Point(342, 362), new Point(344, 366), new Point(347, 370), new Point(351, 374), new Point(356, 379), new Point(361, 382), new Point(368, 385), new Point(374, 387), new Point(381, 387), new Point(390, 387), new Point(397, 385), new Point(404, 382), new Point(408, 378), new Point(412, 373), new Point(416, 367), new Point(418, 361), new Point(419, 353), new Point(418, 346), new Point(417, 341), new Point(416, 336), new Point(413, 331), new Point(410, 326), new Point(404, 320), new Point(400, 317), new Point(393, 313), new Point(392, 312)],
      [new Point(418, 309), new Point(337, 390)]
    ]));
    this.Multistrokes.push(new Multistroke("arrowhead", useBoundedRotationInvariance, [
      [new Point(506, 349), new Point(574, 349)],
      [new Point(525, 306), new Point(584, 349), new Point(525, 388)]
    ]));
    this.Multistrokes.push(new Multistroke("pitchfork", useBoundedRotationInvariance, [
      [new Point(38, 470), new Point(36, 476), new Point(36, 482), new Point(37, 489), new Point(39, 496), new Point(42, 500), new Point(46, 503), new Point(50, 507), new Point(56, 509), new Point(63, 509), new Point(70, 508), new Point(75, 506), new Point(79, 503), new Point(82, 499), new Point(85, 493), new Point(87, 487), new Point(88, 480), new Point(88, 474), new Point(87, 468)],
      [new Point(62, 464), new Point(62, 571)]
    ]));
    this.Multistrokes.push(new Multistroke("six-point star", useBoundedRotationInvariance, [
      [new Point(177, 554), new Point(223, 476), new Point(268, 554), new Point(183, 554)],
      [new Point(177, 490), new Point(223, 568), new Point(268, 490), new Point(183, 490)]
    ]));
    this.Multistrokes.push(new Multistroke("asterisk", useBoundedRotationInvariance, [
      [new Point(325, 499), new Point(417, 557)],
      [new Point(417, 499), new Point(325, 557)],
      [new Point(371, 486), new Point(371, 571)]
    ]));
    this.Multistrokes.push(new Multistroke("half-note", useBoundedRotationInvariance, [
      [new Point(546, 465), new Point(546, 531)],
      [new Point(540, 530), new Point(536, 529), new Point(533, 528), new Point(529, 529), new Point(524, 530), new Point(520, 532), new Point(515, 535), new Point(511, 539), new Point(508, 545), new Point(506, 548), new Point(506, 554), new Point(509, 558), new Point(512, 561), new Point(517, 564), new Point(521, 564), new Point(527, 563), new Point(531, 560), new Point(535, 557), new Point(538, 553), new Point(542, 548), new Point(544, 544), new Point(546, 540), new Point(546, 536)]
    ]));
  }

}
//
// Private helper functions from this point down
//
