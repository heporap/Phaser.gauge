# Phaser.gauge
Phaser.js で動作するゲージプラグインです。
![スクリーンショット](https://github.com/heporap/Phaser.gauge/blob/master/screenshot.png)

## properties
### value
ゲージの値を示します。imgOn、colorOnを使用した画像が表示されます。

この値を変更してもインジケーターは変更されません。increment()、decrement()、reset()メソッドを使用してください。

### max
ゲージの最大値を示します。
valueを越えてmaxまでのインジケーターは、imgOff、colorOffを使用した画像が表示されます。

この値を変更してもインジケーターは変更されません。reset()メソッドにvalueプロパティを渡すことで更新が可能です。

```javascript
gauge.max = 20;
gauge.reset(gauge.value);
```

## method

### setup(metrics, indicator)
- metrics { x:0, y:0, width:200, height:30, imgBG:null, borderWidth:0, borderColor:'rgba(0,0,255,1)', bgColor:'rgba(255,255,255,1)' }
- indicator { x:1, y:5, value:0, max:10, width:18, height:20, imgOn:null, imgOff:null, margin:2, colorOn:'rgba(255,0,0,1)', colorOff:'rgba(0,201,0,1)' }
初期設定を行います。

imgBG、imgOn、imgOffはpreloadで読み込んだ画像のキーを指定します。画像が指定されていると色指定は使用されません。
画像サイズと width 、height 指定が異なる場合は、width 、height に合わせて拡大されます。

### autoPlay(fn, thisObject, to, duration, totally)
- fn: コールバック関数
- thisObject: コールバック関数内でthisにマッピングされるオブジェクト
- to: valueを変更する値
- duration: 指定ミリ秒
- totally: trueならdurationは0からmaxまでかかる時間を示す。falseならdurationの時間でvalueからtoまで変更する。

### stopPlay()
再生を止めます。

### increment(count)
value を増やします。count を省略すると1とみなします。max よりも増えません。

### decrement(count)
value を減らします。count を省略すると1とみなします。0未満にはなりません。

### reset(count)
指定した count に変更します。value を省略すると0とみなします。

## sample code

```javascript
	var game = new Phaser.Game(800, 600, Phaser.AUTO, 'gworld');
	
	var gamePlay = {
		preload: function(game){
	
			game.load.image('gauge_on', 'assets/'+'gauge_on.png');
			game.load.image('gauge_off', 'assets/'+'gauge_off.png');
			game.load.image('gauge_bg', 'assets/'+'gauge_bg.png');
			
		},
		create: function(game){
		
			this.pluginGroup = new Phaser.Group(game, this.game.world, 'pluginGroup');
			
			// gauge with image
			this.gauge1 = game.plugins.add(Phaser.Plugin.Gauge, this.pluginGroup);
			this.gauge1.setup(
				{//metrics
					x: 200, y: 200, width:318, height:50, imgBG: 'gauge_bg', borderWidth: 0, borderColor: 'rgba(255,255,255,1)'
				},
				{//indicator
					x: 0, y: 5, width:10, height:40, value:3, max:10, imgOff:'gauge_off', imgOn:'gauge_on', margin:2
				});
			
			// gauge with just colored
			this.gauge2 = game.plugins.add(Phaser.Plugin.Gauge, this.pluginGroup);
			this.gauge2.setup(
				{//metrics
					x: 200, y: 200, width:318, height:50, bgColor: 'rgba(151,151,151,1)', borderWidth: 2, borderColor: 'rgba(255,255,255,1)'
				},
				{//indicator
					x: 0, y: 5, width:30, height:40, value:3, max:10, margin:2, colorOn:'rgba(255,0,0,1)', colorOff:'rgba(0,201,0,1)'
				});
				
		},
		update: function(game){
			
			if( this.gauge1.value === 0 ){
				this.gauge1.increment();
			}
			
		},
		
		render: function(game){
			
		},
		
		
		shutdown: function(game){
			
			
		}
	};


	game.state.add('play', gamePlay, true);
```
