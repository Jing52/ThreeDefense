$(document).ready(function () {
    (function (win) {
        /* 使用方法

         new TimeLine(id,{
         animateTime:int//轮播时间，单位毫米
         onChanged:fn//时间轴变更后回调

         }})
         */
        //时间轴对象
        win.TimeLine = function (conainer, options) {
            this.options = options || {};
            this.timeline = $("#" + conainer);
            this.marker = $(".marker", this.timeline);
            this.progress = $(".progress", this.timeline);
            this.progress_bar = $(".progress-bar", this.progress);
            this.timeline_scale = $(".timeline-scale", this.timeline);
            this.time_player = $(".time-player", this.timeline);
            this.init();
            this.bind();
        }

        TimeLine.prototype = {
            init: function () {
                this.dragging = false;
                this.animateTime = this.options.animateTime || 2000;
                this.animateFlag = false; //是否在轮播
                this.scaleLen = this.options.scaleLen || 23;
                this.scaleRange = 100 / this.scaleLen;
                this.restart = false;//拖拽之后是否重新轮播
                this.timeout;//动画timeout对象
                this.scaleIndex = 24;
//              this.markerTime = parseInt(new Date().Format("hh")) + ":00";
                this.markerTime = parseInt(-1) + ":00";
                this.count = 100; //记录百分比
                this.updateScale();
                this.resizeViwe();
                this.marker.css('left', this.timeline.width() * 5 + this.progress_bar.width() - this.marker.width() / 2);
                /*this.animate();*/
            },
            resizeViwe: function () {
                this.offsetLeft = this.timeline.width() * 0.035;
                this.width = this.progress.width();
                var tmpLiWidth = this.width * 1 / this.scaleLen;
                this.timeline_scale.css('paddingLeft', this.offsetLeft + tmpLiWidth * 0.4);
                this.width = this.progress.width();
                tmpLiWidth = Math.round(this.width * 1 / this.scaleLen);
                this.timeline_scale.children("li").css('width', tmpLiWidth);
            },
            updateScale: function () {
                var me = this;
//              var nowTime = parseInt(new Date().Format("hh")) + 24;
                var nowTime = parseInt(-1) + 24;
                var htmlStr = '';
                for (var i = me.scaleLen; i >= 0; i--) {
                    var tmpTime = (nowTime - i) % 24;
                    htmlStr += "<li>" + tmpTime + ":00</li>";
                }
                me.markerTime = nowTime % 24 + ":00";
                me.timeline_scale.html(htmlStr);
            },
            bind: function () {
                var me = this;
                me.marker.on("mousedown", function (e) {
                    if (me.animateFlag) {
                        me.restart = me.animateFlag
                        me.stop();
                    }

                    me.dragging = true;
                    var doc = $(document);
                    doc.bind("mousemove", {hander: me}, me._mousemove);
                    doc.bind("mouseup", {hander: me}, me._mouseup);
                    e.preventDefault();
                });
                me.timeline_scale.children('li').each(function (index) {
                    $(this).on("click", function () {
                        me.setCount(index * me.scaleRange, 500);
                        me.stop();
                    });
                });
                me.time_player.children('a').on('click', (function (e) {
                    if (me.animateFlag) {
                        me.stop();
                    } else {
                        me.start();
                    }
                    e.preventDefault();
                }));
                /*$(document).on("mousemove", function(e) {
                 if (me.dragging) {
                 var count = ~~ ((e.pageX - 68) / me.width * 100);
                 me.setCount(count,0);
                 }
                 }).on("mouseup", function(e) {
                 var count=Math.round(me.count/me.scaleRange)*me.scaleRange;
                 me.setCount(count,200);
                 if (me.dragging && me.options.onChanged) {
                 me.options.onChanged(me.markerTime);
                 }
                 me.dragging = false;
                 });*/
                $(window).on("resize", function () {
                    me.resizeViwe();
                });
            },
            _mousemove: function (e) {
                var me = e.data.hander;
                if (me.dragging) {
                    var count = ~~((e.pageX - me.offsetLeft) / me.width * 100);
                    me.setCount(count, 0);
                }
            },
            _mouseup: function (e) {
                var me = e.data.hander;
                var count = Math.round(me.count / me.scaleRange) * me.scaleRange;
                me.setCount(count, 200);
                me.dragging = false;
                var doc = $(document);
                doc.unbind("mousemove", me._mousemove);
                doc.unbind("mouseup", me._mouseup);
                // if(me.restart){
                // 	me.restart=false;
                // 	me.start();
                // }
            },
            setCount: function (count, time) {
                var me = this;
                me.count = count;
                if (me.count > 100) {
                    me.count = 100;
                }
                if (me.count < 0) {
                    me.count = 0;
                }
                me.scaleIndex = Math.round(count / me.scaleRange);
                var tmpLi = me.timeline_scale.children('li').eq(me.scaleIndex);

                me.markerTime = tmpLi.text();

                if (me.options.onChanging && !me.dragging) {
                    me.options.onChanging(me.markerTime);
                }
                me.progress_bar.stop().animate({
                    width: me.count + "%"
                }, time);

                var tmpWidth = tmpLi.position().left + tmpLi.width() / 1.8 - me.marker.width() / 1;

                me.marker.stop().animate({
                    left: tmpWidth
                }, time, function () {
                    if (me.options.onChanged && !me.dragging) {
                        me.options.onChanged(me.markerTime);
                    }
                });

                /*me.marker.stop().animate({
                 marginLeft: me.count+"%"
                 }, time);*/

            },
            animate: function () {
                var me = this;
                var count = me.count;
                count += me.scaleRange;
                if (count > 100) {
                    count = 0;
                }
                if (me.animateFlag) {
                    me.setCount(count, 500);
                    //me.options.animateCbk && me.options.animateCbk(me.markerTime);
                }
                me.timeout = setTimeout(function () {
                    me.animate();
                }, me.animateTime);
            },
            start: function () {
                this.animateFlag = true;
                $('.time-player-play').removeClass('time-player-play').addClass('time-player-stop');
                //this.animate();
                //增加gis刷新的事件
                gisPlay();
            },
            stop: function () {
                this.animateFlag = false;
                $('.time-player-stop').removeClass('time-player-stop').addClass('time-player-play');
                //clearTimeout(this.timeout);
            },
            move: function (index, t) {
                var me = this;
                var time = t || 500;
                me.setCount(index * me.scaleRange, time);
            }

        }

        //var t= new TimeLine('timeline',{animateTime:1000,scaleClick:function(time){console.log('scaleClick time='+time)}});
        //t.start();
    })(window);
});
