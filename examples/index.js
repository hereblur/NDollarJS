$(document).ready(function(){
  window.Canvas.init()

  var recognizer = new nDollar.Recognizer();

  var strokes = [];
  var stroking = []

  var render = function(){
    window.Canvas.clear()

    _.each(strokes, function(strk){
      window.Canvas.path(strk, 3, "#777777");
    })

    window.Canvas.path(stroking, 3, "#000000");

    if( !drawing && strokes.length){
      var _strokes = strokes.map(function(stroke){
                                      return stroke.map(function(p){
                                        return new nDollar.Point(p.x, p.y);
                                      })
                                });

      var useBoundedRotationInvariance = $("input[name=boundRotation]").is(':checked');
      var requireSameNoOfStrokes = $("input[name=sameStrokeCount]").is(':checked');
      var useProtractor = $("input[name=alghorithm]:checked").val() == 'protactor';

      var result = recognizer.Recognize( _strokes, useBoundedRotationInvariance, requireSameNoOfStrokes, useProtractor);
      console.log(result);
      var text = "Gesture result: " + result.Name + ", score: "+ result.Score+" points\n<H1>";
      $("#output").html(text);
    }


  }

  var drawing = false;


  $("input[name=boundRotation]").click(function(){
      recognizer.ClearGestures();
      recognizer.LoadDefaultGestures( $("input[name=boundRotation]").is(':checked') );
      render();
  }).click();
  $("#clear").click(function(){
      strokes = [];
      stroking = [];
      render();
  })

  $("canvas:first")
  .mousedown(function(e){
      drawing = true;
      stroking.push({x:e.offsetX, y:e.offsetY})
      render();
  })
  .mousemove(function(e){
     if(drawing){
      stroking.push({x:e.offsetX, y:e.offsetY})
      render();
    }
  })
  .mouseup(function(e){
    if(drawing){
      drawing = false;
      stroking.push({x:e.offsetX, y:e.offsetY})
      strokes.push(stroking);
      stroking = [];
      render();
    }
  });

});
