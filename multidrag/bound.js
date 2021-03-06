(function(global, MultiDrag){
	'use strict';
	var boundType = {
		element: -1,
		rectangle: 0,
		lineX: 1,
		lineY: 2,
		line: 3,
		unificationOfRectangle: 4
	}, boundFactory = function(type){
		switch(type){
			case boundType.element:
				return function(element, parent){
					return boundFactory(boundType.rectangle)(mathPoint.createRectangleFromElement(element, parent));
				};
			case boundType.rectangle:
				return function(rectangle){
					return function(point, delta){
						var calcPoint = point.clone(), rectP2 = rectangle.getRightBottomPoint();
						if(rectangle.position.x > calcPoint.x){
							(calcPoint.x = rectangle.position.x);
						}
						if(rectangle.position.y > calcPoint.y){
							calcPoint.y = rectangle.position.y;
						}
						if(rectP2.x < calcPoint.x + delta.x){
							calcPoint.x = rectP2.x - delta.x
						}
						;
						if(rectP2.y < calcPoint.y + delta.y){
							calcPoint.y = rectP2.y - delta.y
						}
						;
						return calcPoint;
					};
				};
			case boundType.lineX:
				return function(x, startY, endY){
					return function(point, delta){
						var calcPoint = point.clone();
						calcPoint.x = x;
						if(startY > calcPoint.y){
							calcPoint.y = startY
						}
						;
						if(endY < calcPoint.y + delta.y){
							calcPoint.y = endY - delta.y
						}
						return calcPoint;
					};
				};
			case boundType.lineY:
				return function(y, startX, endX){
					return function(point, delta){
						var calcPoint = point.clone();
						calcPoint.y = y;
						if(startX > calcPoint.x){
							calcPoint.x = startX
						}
						if(endX < calcPoint.x + delta.x){
							calcPoint.x = endX - delta.x
						}
						return calcPoint;
					};
				};
			case boundType.line:
				return function(start, end){
					var alpha = Math.atan2(end.y - start.y, end.x - start.x), beta = alpha + Math.PI / 2, someK = 10, cosBeta = Math.cos(beta), sinBeta = Math.sin(beta);
					return function(point, delta){
						var point2 = new Point(point.x + someK * cosBeta, point.y + someK * sinBeta), pointCrossing = mathPoint.directCrossing(start, end, point, point2), newEnd = mathPoint.getPointInLineByLenght(end, start, delta.x);
						pointCrossing = mathPoint.boundOnLine(start, newEnd, pointCrossing);
						return pointCrossing;
					};
				};
			//todo add realization
			case boundType.unificationOfRectangle:
				return function(rectangles){
					return function(point, delta){
						return	 point.clone();
					};
				};
		}
	};
	MultiDrag = MultiDrag || {};
	MultiDrag.boundType = boundType;
	MultiDrag.boundFactory = boundFactory;
	global.MultiDrag = MultiDrag;
})(window, MultiDrag);