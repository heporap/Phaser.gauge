/**
* @author       Wataru Kanzaki <dab@wi-wi.jp>
* @copyright    2015 Wicker Wings
* @version      1.0.0
* @license      {@link https://github.com/heporap/Phaser.gauge/blob/master/LICENSE.txt|MIT License}
*/
(function(constructor){
	var root = this;
	
	if( define && define.amd ){
		define('gauge', ['Phaser'], constructor);
		
	}else if( root.Phaser ){
		constructor(root.Phaser);
		
	}
	
}).call(this, function(Phaser){
"use strict";

var _extends = window._extends || function(dest, src, defaultValues){
	if( typeof defaultValues !== 'undefined' ){
		for( var key in defaultValues ){
			if( defaultValues.hasOwnProperty(key) ){
				dest[key] = ( src && typeof src[key] !== 'undefined' )? src[key]: defaultValues[key];
			}
		}
	}else if(src){
		for( var key in src ){
			if( src.hasOwnProperty(key) ){
				dest[key] = src[key];
			}
		}
	}
};

/****
****/
Phaser.Plugin.Gauge = function(game, parent){
	
	Phaser.Plugin.call(this, game, parent);
	
	this.x = 0;
	this.y = 0;
	this.width = 0;
	this.height = 0;
	
	this.value = 0;
	this.max = 0;
	
	this.bmd;
	
	this.baseGroup;
	this.base;
	this.indicator;
	this.label = {};
	
	this._callback;
	this._thisObj = null;
	this.busy = false;
	this._autoPlay = false;
	this._passtime = 0;
	this._delay = 0;
	
	this.bringToTop = false;
	
};
Phaser.Plugin.Gauge.prototype = Object.create(Phaser.Plugin.prototype);
Phaser.Plugin.Gauge.prototype.constructor = Phaser.Plugin.Gauge;

/****
called by system
****/
Phaser.Plugin.Gauge.prototype.init = function(world){
	this.world = world || this.game.world;
};

/****
Phaser.Plugin.Gauge.prototype.setup
@param metrics {object} - x, y, width, height, baseColor = "#888", radius = 5, borderColor = "#8f8", borderWidth = 2, img = ''
@param indicator {object} - color = "#FF0", imgOff, imgOn, grow = "slide", max = 100
@param label {object} - color = "#0FF", font, ext = "%", useLabel = true, align = "center", valign = "top"
@param options {object} - (reserved parameter)

* enumerates
label.align = "center", "left", "right"
label.valign = "top", "bottom", "left", "right", "pile"

****/
Phaser.Plugin.Gauge.prototype.setup = function(metrics, indicator, label, options){
	
	var mtrc = {};
	_extends(mtrc, metrics, {x:0, y:0, width:200, height:30, imgBG:null, borderWidth:0, borderColor:'rgba(0,0,255,1)', bgColor:'rgba(255,255,255,1)'});
	
	var idctr = {};
	_extends(idctr, indicator, {x:1, y:5, value:0, max:10, width:18, height:20, imgOn:null, imgOff:null, margin:2, colorOn:'rgba(255,0,0,1)', colorOff:'rgba(0,201,0,1)'});
	
	this.label = {};
	_extends(this.label, label, {});
	
	this.x = mtrc.x;
	this.y = mtrc.y;
	this.width = mtrc.width;
	this.height = mtrc.height;
	
	this.busy = false;
	
	this.value = idctr.value;
	this.max = idctr.max;
	
	this.baseGroup = new Phaser.Group(this.game, this.world, 'gauge');
	
	this.baseImg = mtrc.imgBG;
	
	this.borderWidth = mtrc.borderWidth;
	this.contentWidth = mtrc.width - mtrc.borderWidth * 2;
	this.contentHeight = mtrc.height - mtrc.borderWidth * 2;
	
	this.baseBMD = this.game.make.bitmapData(mtrc.width, mtrc.height);
	this.borderColor = mtrc.borderColor;
	this.bgColor = mtrc.bgColor;
	
	var bmd;
	if( !idctr.imgOn ){
		bmd = this.game.make.bitmapData(idctr.width, idctr.height);
		bmd.rect(0, 0, idctr.width, idctr.height, idctr.colorOn);
		idctr.imgOn = bmd;
	}
	if( !idctr.imgOff ){
		bmd = this.game.make.bitmapData(idctr.width, idctr.height);
		bmd.rect(0, 0, idctr.width, idctr.height, idctr.colorOff);
		idctr.imgOff = bmd;
	}
	
	this.indicator = idctr;
	this.indicator.imgOn = idctr.imgOn;
	this.indicator.imgOff = idctr.imgOff;
	
	this.base = new Phaser.Image(this.game, this.x, this.y, this.baseBMD);
	this.draw();
	this.game.add.image(this.base);
	this.baseGroup.addChild(this.base);
	
	return this;
	
};

/****
draw
ゲージの描画
****/
Phaser.Plugin.Gauge.prototype.draw = function(){
	var idctr = this.indicator, w = idctr.width, h = idctr.height;
	
	var i, x, y = idctr.y, img;
	
	var bmd = this.baseBMD;
	
	if( this.borderWidth ){
		bmd.rect(0, 0, this.width, this.height, this.borderColor);
	}
	if( this.baseImg ){
		bmd.draw(this.baseImg, this.borderWidth, this.borderWidth);
	}else{
		bmd.rect(this.borderWidth, this.borderWidth, this.contentWidth, this.contentHeight, this.bgColor);
	}
	
	for( i = 0; i < this.max; i++ ){
		x = idctr.x + i * (idctr.width+idctr.margin);
		img = ( i < this.value )? idctr.imgOn: idctr.imgOff;
		bmd.draw(img, x, y, idctr.width, idctr.height);
	}
	
};

/****
autoPlay
自動増減アニメーションを行う。

@param fn {function} - callback function。
@param thisObj {any: null} - callback function の中での this オブジェクト。
@param to {number: Gauge.max} - toで指定された値まで増減する。
@param duration {number: 10000} - 再生時間。
@param totally {boolean: true} - trueならdurationは0からmaxまでの時間を示し、falseなら現在のvalueから0またはmaxまでの時間を示す。
@return {object} - this。
****/
Phaser.Plugin.Gauge.prototype.autoPlay = function(fn, thisObj, to, duration, totally){
	
	if( this.busy ){
		return this;
	}
	
	totally = (typeof totally === 'undefined')? true: !!totally;
	
	this._thisObj = thisObj || null;
	this._callback = fn;
	
	this._duration = duration || 10000;
	
	this._startValue = this.value;
	this._goalValue = (typeof to === 'undefined' || this.max < to)? this.max: (to < 0)? 0: isNaN(to)? this.max: +to;
	
	if( totally ){
		if( this._goalValue < this.value ){
			this._duration = this._duration * (this.value / this.max);
			this._duration -= duration * (this._goalValue / this.max);
		}else{
			this._duration = this._duration * ((this.max - this.value) / this.max);
			this._duration -= duration * ((this.max - this._goalValue) / this.max);
		}
	}
	
	this._passtime = 0;
	
	this.busy = true;
	this._autoPlay = true;
	
	return this;
	
};

/****
****/
Phaser.Plugin.Gauge.prototype.stopPlay = function(){
	this._autoPlay = false;
	this.busy = false;
};

/****
****/
Phaser.Plugin.Gauge.prototype.increment = function(count){
	if( !count || count < 1 ){
		count = 1;
	}
	
	this.value += count;
	if( this.max < this.value ){
		this.value = this.max;
	}
	
	this.draw();
	
	return this.value;
};

/****
****/
Phaser.Plugin.Gauge.prototype.decrement = function(count){
	if( !count || 1 < count ){
		count = 1;
	}
	
	this.value -= count;
	if( this.value < 0 ){
		this.value = 0;
	}
	this.draw();
	
	return this.value;
	
};

/****
****/
Phaser.Plugin.Gauge.prototype.reset = function(count){
	if( !count || count < 0 ){
		count = 0;
	}else if( this.max < count ){
		count = this.max;
	}
	
	this.value = count;
	
	this.draw();
	
	return this.value;
	
};

/****
****/
Phaser.Plugin.Gauge.prototype.update = function(game){
	
	if( this._autoPlay ){
		var duration = this._duration,
			sv = this._startValue,
			gv = this._goalValue;
		
		var elapsedMS = this.game.time.physicsElapsedMS;
		if( duration ){
			this._passtime += elapsedMS;
			this._passtime = Math.min(this._passtime, duration);
			
			var percent = this._passtime / duration;
			
			var val = sv + (gv - sv) * percent;
			
			val = (gv === 0 )? Math.ceil(val): Math.floor(val);
			
			if( val !== this.value ){
				this.reset(val);
			}
		}
		
		if( gv === this.value ){
			this.busy = false;
			this._autoPlay = false
			
			if( this._callback ){
				this._callback.call(this._thisObj);
			}
		}
		
	}
	
	
};

Phaser.Plugin.Gauge.prototype.postUpdate = function(){
	
	this.world.bringToTop(this.baseGroup);
	
};

/******/
return true;
});
