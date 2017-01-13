'use strict';
var nDollar = require("../dist/nDollar.js");

var P_raw = [[[201,55],[206,400]]
            ,[[217,51],[218,51],[221,51],[224,51],[231,51],[238,51],[247,51],[256,51],[266,53],[275,53],[287,54],[300,54],[310,55],[318,57],[326,58],[332,59],[337,60],[345,63],[351,66],[358,68],[362,73],[369,75],[373,79],[378,84],[382,88],[387,93],[390,97],[395,104],[399,109],[401,115],[405,121],[408,128],[411,133],[412,139],[413,142],[413,145],[413,148],[413,151],[413,152],[413,155],[413,157],[413,160],[411,164],[411,166],[408,170],[405,172],[403,174],[399,179],[393,182],[387,186],[380,188],[375,191],[370,194],[364,197],[358,198],[351,199],[344,199],[333,199],[325,199],[316,199],[307,199],[298,199],[288,199],[278,199],[268,199],[263,199],[256,199],[250,199],[249,199],[246,199],[245,199],[244,199],[243,199],[241,199],[239,199],[238,199],[234,197],[233,197],[229,197],[226,197],[221,197],[218,197],[214,197],[210,197],[209,197]]];
var I_raw = [[[249,98],[250,97],[252,100],[252,107],[254,116],[254,122],[254,132],[254,139],[254,147],[254,154],[254,162],[254,169],[254,179],[254,189],[254,200],[254,212],[254,223],[254,236],[254,246],[254,258],[254,269],[254,278],[254,289],[254,298],[254,307],[254,314],[254,322],[252,331],[252,339],[249,346],[249,352],[249,356],[249,360],[249,364],[249,365],[249,366],[249,369],[249,370],[249,371],[250,372],[250,374]]];
var triangle_raw = [[[94,109],[102,109],[110,109],[124,109],[145,109],[166,109],[193,109],[223,109],[251,109],[281,109],[311,109],[341,109],[373,109],[403,105],[421,105],[439,103],[451,103],[457,101]],
                    [[433,124],[431,127],[428,132],[426,139],[422,147],[417,158],[407,179],[396,197],[388,218],[381,233],[377,242],[371,252],[368,260],[361,271],[356,281],[351,291],[345,305],[339,317],[335,331],[331,339],[329,348],[329,354],[327,360],[326,362],[326,364],[326,368],[326,370],[326,372],[326,375],[324,377],[323,378],[321,381],[318,383],[316,385],[313,388],[310,391],[306,394],[302,398],[297,402],[293,406],[289,411],[285,416],[281,421],[277,425],[273,429],[271,432],[269,434],[267,435],[266,436],[266,437],[265,437],[263,434]],
                    [[104,112],[103,113],[103,115],[103,117],[103,120],[103,123],[103,125],[103,129],[103,133],[103,139],[107,146],[108,155],[112,166],[116,180],[120,193],[124,207],[127,221],[131,235],[137,252],[141,265],[147,278],[151,290],[156,301],[160,313],[165,322],[168,329],[172,336],[175,343],[179,347],[183,353],[185,357],[188,362],[191,365],[192,367],[193,371],[194,372],[196,374],[198,378],[200,381],[201,383],[201,387],[203,389],[204,393],[206,395],[207,397],[208,400],[212,404],[215,408],[217,410],[220,415],[224,418],[227,421],[229,424],[231,427],[233,430],[237,435],[238,436],[240,438],[243,442],[244,444],[245,445]]];

test('should recognize built-in shape: useBoundedRotationInvariance: false', () => {
  var nDollar = require("ndollar-js");
  var useBoundedRotationInvariance = false;
  var recognizer = new nDollar.Recognizer(useBoundedRotationInvariance);
  var requireSameNoOfStrokes = true;
  var useProtractor = true;

  recognizer.LoadDefaultGestures(  );

  var P = P_raw.map(function(s){
              return s.map(function(p){
                          return new nDollar.Point(p[0], p[1]);
                      });
          });

  var result = recognizer.Recognize( P, requireSameNoOfStrokes, useProtractor);
  expect( result.Name ).toBe( "P" );

  P = I_raw.map(function(s){
              return s.map(function(p){
                          return new nDollar.Point(p[0], p[1]);
                      });
          });
  result = recognizer.Recognize( P, requireSameNoOfStrokes, useProtractor);
  expect( result.Name ).toBe( "line" );
});

test('should recognize built-in shape: useBoundedRotationInvariance: true', () => {
  var nDollar = require("ndollar-js");
  var useBoundedRotationInvariance = true;
  var recognizer = new nDollar.Recognizer(useBoundedRotationInvariance);
  var requireSameNoOfStrokes = true;
  var useProtractor = true;

  recognizer.LoadDefaultGestures( );

  var P = P_raw.map(function(s){
              return s.map(function(p){
                          return new nDollar.Point(p[0], p[1]);
                      });
          });

  var result = recognizer.Recognize( P, requireSameNoOfStrokes, useProtractor);
  expect( result.Name ).toBe( "P" );
 
});

test('should recognize custom shape', () => {

  var nDollar = require("ndollar-js");
  var useBoundedRotationInvariance = false;
  var recognizer = new nDollar.Recognizer(useBoundedRotationInvariance);

  recognizer.LoadDefaultGestures();

  var triangle = [[new nDollar.Point(30, 7),  new nDollar.Point(103, 7)],
                  [new nDollar.Point(103, 7), new nDollar.Point(66, 87)],
                  [new nDollar.Point(66, 87), new nDollar.Point(30, 7)]
                 ];

  recognizer.AddGesture( "triangle", triangle);

  var myHandDrawingOfTriangle =  triangle_raw.map(function(s){
                                                        return s.map(function(p){
                                                                    return new nDollar.Point(p[0], p[1]);
                                                                });
                                                    });

  var requireSameNoOfStrokes = false;
  var useProtractor = true;

  var result = recognizer.Recognize( myHandDrawingOfTriangle, requireSameNoOfStrokes, useProtractor);
  expect( result.Name ).toBe( "triangle" );
});
