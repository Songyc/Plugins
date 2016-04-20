/*! Copyright 2012, Ben Lin (http://dreamerslab.com/)
 * Licensed under the MIT License (LICENSE.txt).
 *
 * Version: 1.0.16
 *
 * Requires: jQuery >= 1.2.3
 */
(function(a){a.fn.addBack=a.fn.addBack||a.fn.andSelf;
a.fn.extend({actual:function(b,l){if(!this[b]){throw'$.actual => The jQuery method "'+b+'" you called does not exist';}var f={absolute:false,clone:false,includeMargin:false};
var i=a.extend(f,l);var e=this.eq(0);var h,j;if(i.clone===true){h=function(){var m="position: absolute !important; top: -1000 !important; ";e=e.clone().attr("style",m).appendTo("body");
};j=function(){e.remove();};}else{var g=[];var d="";var c;h=function(){c=e.parents().addBack().filter(":hidden");d+="visibility: hidden !important; display: block !important; ";
if(i.absolute===true){d+="position: absolute !important; ";}c.each(function(){var m=a(this);var n=m.attr("style");g.push(n);m.attr("style",n?n+";"+d:d);
});};j=function(){c.each(function(m){var o=a(this);var n=g[m];if(n===undefined){o.removeAttr("style");}else{o.attr("style",n);}});};}h();var k=/(outer)/.test(b)?e[b](i.includeMargin):e[b]();
j();return k;}});})(jQuery);

;(function( window, $ ){
    function Slide( options ){
        this.config = $.extend( {}, Slide.config, options );    // 合并参数        
        this._init();
    }

    Slide.config = {
        stay: 2000,
        delay: 200,
        animateTime: 300,
        playTo: 0,
        autoPlay: false,
        link: false,
        lazy: false,
        merge: false,
        effect: 'base',
        curClass: 'current',
        type: 'mouseover',
        direction: 'x',
        oninit: function(){},
        onchange: function(){}
    };

    Slide.prototype = {
        _init: function(){
            var self = this,
                c = this.config;

            if( !c.target.length ) return;

            this.target = c.target;
            this.prevBtn = c.prevBtn || null;
            this.nextBtn = c.nextBtn || null;
            this.effect = Slide.effect[ c.effect ];
            this.length = c.target.length;

            this.wrap = this.target.parent();                           // this.target是一个jQuery对象。选出所有的滑动屏。
            if( /(?:ul|ol|dl)/i.test( this.wrap[0].tagName ) ){         // 如果滑动屏的父元素是ul,ol,dl其中的一个
                this.content = this.wrap;                               // 设置this.content为this.wrap。(content为包裹层)
                this.wrap = this.wrap.parent();                         // 设置this.wrap的父元素为this.wrap(wrap为包裹层的父元素)
            }else{
	            // jQuery 的 append 会导致 script 重新执行，从而导致使用 textarea 做 lazy 时出现 textarea 不闭合而隐藏了后面的内容的问题
                var _jTmpWrap = $( '<div class="slideContent"></div>' )     // 否则创建一个slideContent元素
                    _tmpWrap = _jTmpWrap.get(0);                            // 
                var _frag = document.createDocumentFragment();
                for(var _i = this.target.length - 1; _i >= 0; _i--) {
	                _frag.insertBefore(this.target[_i], _frag.firstChild);
                }
                _tmpWrap.appendChild(_frag);
                this.wrap.get(0).appendChild(_tmpWrap);
                
                this.content = _jTmpWrap;                                   // 把slideContent设置为content
                _jTmpWrap = null;
                _tmpWrap  = null;
            }

            if( c.control !== false ){                                       
                c.control = c.control || $( '.control', this.wrap );
                if( c.control && c.control.length ){                       // 如果有control，保存.prev到this.prevBtn，.next到this.nextBtn上。
                    this.control = c.control.not( '.prev, .next' );
                    if( !this.prevBtn ) this.prevBtn = c.control.filter( '.prev' );
                    if( !this.nextBtn ) this.nextBtn = c.control.filter( '.next' );
                }else{                                                     // 否则自动创建
                    var ul = $( '<ul class="control"></ul>' ),
                        tocStr = '';
                    for( var i = 0; i < this.length; i++ ){
                        tocStr += '<li><a href="javascript:;">'+ ( i + 1 ) +'</a></li>';
                    }
                    tocStr = $( tocStr );
                    ul = ul.append( tocStr );
                    this.wrap.append( ul );
                    this.control = tocStr;
                }
            }

            c.oninit.call(self);                                            // 初始化之前调用函数

            if( this.effect ) this.effect.oninit.call( this );              // 初始化切换模型。

            this.playTo( c.playTo );                                        // c.playTo默认为0，初始化默认滑动到0。
            if( c.autoPlay ) this.play();                                   // 

            this._attach();
        },
        _attach: function(){
            var self = this,
                c = this.config,
                control = this.control,
                prevBtn = this.prevBtn,
                nextBtn = this.nextBtn,
                type = c.type,
                needDelay = type === 'mouseover',
                delay =  c.delay;

            if( c.autoPlay ){                                                   // 绑定事件
                var stopElems = [ this.wrap ],
                    ctrlBar = control && control.parent();
                if( ctrlBar ) stopElems.push( ctrlBar );
                if( this.prevBtn ) stopElems.push( this.prevBtn );
                if( this.nextBtn ) stopElems.push( this.nextBtn );

                $.each( stopElems, function(){
                    this.bind({
                        'mouseover': function(){
                            self.isControl = false;
                            self.stop();
                        },
                        'mouseout': function(){
                            self.play();
                        }
                    });
                });       
            }

            if( control && control.length ){                                    // 
                control.each(function( i ){
                    var $this = $( this );
                    $this.bind( type, function(){
                        clearTimeout( self.delayTimer );
                        self.delayTimer = null;
                        self.delayTimer = setTimeout(function(){
                            self.isControl = true;
                            self.playTo( i ); 
                        }, delay);
                    });

                    if( needDelay ){
                        $this.bind({
                            'mouseout': function(){
                                clearTimeout( self.delayTimer );
                            },
                            'click': function(){
                                clearTimeout( self.delayTimer );
                                self.playTo( i );
                            }
                        });
                    }

                    if( !c.link ){
                        $this.bind( 'click', function( e ){
                            e.preventDefault();
                        });
                    }

                });
            }


            if( prevBtn ){
                prevBtn.bind( 'click', function( e ){
                    self.prev();
                    e.preventDefault();
                });
            }

            if( nextBtn ){
                nextBtn.bind( 'click', function( e ){
                    self.next();
                    e.preventDefault();
                });
            }
        },
        playTo: function( page ){                                   // page为当前屏
            var $control = this.control,
                curClass = this.config.curClass,        
                prevPage;                                           // prevPage为上一屏

            if( this.curPage === page ) return;                     // this.curPage当前页等于要滑动的页码。说明要滑动到当前页，也就是不用滑，不再向下操作。

            this.prevPage = this.curPage;                           // 设置this.prevPage为this.curPage, this.curPage默认为undefiend。

            if( this.config.effect === 'slide' && this.config.merge ){      // 如果滑动方式为'slide'，并且支持合并
                prevPage = this._outBound( this.curPage );                  // 调用this._outBound(page)方法计算出prevPage(上次页面的下标)值。默认为undefined。
                this.curPage = page;                                        // page赋值给this.curPage。默认为0。
                page = this._outBound( page );                              // 调用this._outBound(page)方法计算出当前页的值(将要滑动到的页面的下标)。                
            }else{  
                prevPage = this.curPage;                                    // 
                page = this.curPage = this._outBound( page );
            }

            if( $control && $control.length ){
                $control.eq( prevPage ).removeClass( curClass );            // 去掉前一屏对应控制按钮的curClass类名
                $control.eq( page ).addClass( curClass );                   // 添加当前屏对应控制按钮的curClass类名
            }

            if( this.config.lazy ){                                         // 如果支持懒加载
                var $curTarget = this.target.eq( page );                    // 获取当前屏元素
                if( $curTarget.length && !$curTarget[0].parsed ){           // 如果当前屏有长度，并且parsed属性为false
                    this._lazyLoad( $curTarget );                           // 调用this._lazyLoad(obj)
                }
            }

            if( this.effect ) this.effect.onchange.call( this, page);            // 
            this.config.onchange.call( this );                              // 执行自定义onchange()

        },
        prev: function(){
            this.playTo( this.curPage - 1 );
        },
        next: function(){
            this.playTo( this.curPage + 1 );
        },
        play: function(){
            var self = this;
            this.stop();
            this.timer = setInterval(function(){
                // self.playTo( self.curPage + 1 );
            }, self.config.stay );
        },
        stop: function(){
            clearInterval( this.timer );
        },
        _outBound: function( i ){
            var length = this.length;                           // 滑动屏总数  
            if( i >= length ) i %= length;                      // 如果i大于或等于滑动屏总数，i取余数
            if( i < 0 ){                                        // 如果i小于0
                var m = i % length;                             // m取余数
                i = m === 0 ? 0 : ( m + length );               // 如果m值为0，说明i为负数并且负数值正好是length的陪数，则i设置为0; 否则m值加上length值，得出将要滑动的屏数下标。
            }
            return i;                                           // 返回i 
        },
        _lazyLoad: function( $obj ){                            
            var textarea = $( 'textarea', $obj );               // 在上下文为$obj下，获取标签为'textarea'的元素
            if( textarea.length ){                              // 如果textarea的长度存在
                $obj.html( textarea.val() );                    // 将$obj的文本内容换成textarea的value值
                $obj[0].parsed = true;                          // parsed值设置为true
            }
        }
    }

    Slide.effect = {
        base: {
            oninit: function(){ 
                this.target.hide().eq( this.config.playTo ).show();
            },
            onchange: function(){
                var $target = this.target;
                $target.eq( this.prevPage ).hide();
                $target.eq( this.curPage ).show();
            }
        },
        fade: {
            oninit: function(){
                this.content.css({
                    'position': 'relative',
                    'overflow': 'hidden'
                });
                this.target.css({
                    'position': 'absolute'
                });
                this.target.hide();
            },
            onchange: function(){
                var $target = this.target;
                $target.eq( this.prevPage ).fadeOut();
                $target.eq( this.curPage ).fadeIn();
            }
        },
        slide: {
            oninit: function(){
	            // jQuery 式的 wrap 和 append 等会因 textarea 而造成问题，故用纯 dom 来 append
	            $('<div class="contentWrap" style="overflow:hidden; position: relative; zoom:1; width:100%; height:100%;"></div>')
                    .insertBefore(this.content)
                    .get(0)
                    .appendChild(this.content.get(0));                                  // 在ul外包一层类名为contentWrap的元素
                this.contentWrap = this.content.parent();                               // 设置为this.contentWrap属性

                if( this.config.direction === 'x' ){                                    // 判断切换方向，如果为'x'，表示左右切换
                    this.step = this.config.width || this.target.eq( 0 ).outerWidth();  // 尝试获取this.config.width属性，如果没有则获取滑动屏的第一个元素的宽
                    this.prop = 'scrollLeft';                                           // 设置this.prop属性为 'scrollLeft'
                    this.boxProp = 'width';                                             // 设置this.boxProp属性为 'width'
                }else{
                    this.step = this.config.height || this.target.eq( 0 ).outerHeight();
                    this.prop = 'scrollTop';
                    this.boxProp = 'height';
                }

                this.showNum = Math.floor( parseFloat( this.wrap.actual(this.boxProp) ) / this.step );          // 获取实际要滑动的宽度，要解释成浮点数。因为可能是字符串。除于每屏的宽度。滑动的宽度除于每屏宽度等于每次要滑动屏数。最后向下取整。

                if( this.config.merge ){                                                                        // 如果支持合并
                    this.showNum = Math.ceil( parseFloat( this.wrap.actual(this.boxProp) ) / this.step );       // 向上取整值
                    var cloneArr = this.target.clone( true );                                                   // 深度克隆this.target
                    // 2013/08/01 lazy 时 jQuery 的 append 会有问题，转为原生
                    var frag = document.createDocumentFragment();                                               // 创建文档碎片
                    cloneArr.each(function(){                                                                   // 加入文档碎片
	                    frag.appendChild(this);
                    });
                    this.content.get(0).appendChild(frag);                                                      // 加入到this.content最后
                    
                    $.merge( this.target, cloneArr );                                                           // this.target加多一份克隆的元素
                    this.plus = 0;                                                                              // this.plus属性设置为0
                }

                if( this.config.direction === 'x' ){                                                            
                    this.content.width( this.step * this.target.length );                                       // 设置this.content为所有滑动屏元素之和
                    this.target.css( 'float', 'left' );                                                         // 滑动屏设置为浮云
                }

            },
            onchange: function(){
                var self = this,
                    c = this.config,
                    from = this.prevPage === window.undefined ? 0 : this.prevPage,                              // 如果this.prevPage为undefined，说明是初始化的时候。将from为0，否则为this.prevPage。
                    to = this.curPage,                                                                          // 当前屏的总数
                    pos;

                merge: if( c.merge ){                                                               // 如果支持合并
                    var across = to - from,                                                         // 当前屏减上一屏，取得跨屏数 
                        num = Math.abs( across );                                                   // 取绝对值

                    if( this.realCurPage === window.undefined ){                                    // 如果realCurPage为undefined，说明初始化。
                        this.realCurPage = to;                                                      // 当前屏赋值this.realCurPage
                        this.realPrevPage = from;                                                   // 上一屏赋值this.realPrevPage
                    }

                    if( across === 0 ){                                                             // 如果across，说明跳回本屏。跳出代码块。
                        break merge;
                    }   
                    
                    if( across > 0 ){                                                               // 如果across大于0，说明要向前滑动
                        if( to <= this.target.length + this.plus - this.showNum ){                  // 总屏数(包括克隆的), 加上跨屏数, 减去每次滑动的屏数
                            var tmp = this.realCurPage;                                             // 将真正当前屏保存到tmp变量
                            this.realCurPage = this.plus === 0 ? to : this.realCurPage + 1;         // 如果this.plus为0，说明初始化。重新计算this.realCurPage值。this.realCurPage设置为to，否则+1;
                            this.realPrevPage = tmp;                                                // 将tmp赋值给this.realPrevPage
                            break merge;                                                            // 跳出代码块
                        }

                        this.realCurPage = this.target.length - this.showNum;                       // 
                        this.realPrevPage = this.realCurPage - 1;

                        var tarArr = $.makeArray( this.target );
                        for( var i = 0; i < num; i++ ){
                            var elem = tarArr.shift();
                            this.content.append( elem );
                            this.target = this.content.children();
                        }
                    }else if( across < 0 ){                                                         // 
                        if( to > this.showNum && this.realCurPage > 0 ){
                            this.realPrevPage = this.realCurPage;
                            this.realCurPage--;
                        }else{
                            this.realPrevPage = this.prevPage;
                            this.realCurPage = this.curPage;
                        }

                        if( to >= this.plus ){
                            break merge;
                        }

                        var tarArr = $.makeArray( this.target );
                        for( var i = 0; i < num; i++ ){
                            var elem = tarArr.pop();
                            this.content.prepend( elem );
                            this.target = this.content.children();
                        }

                    }
                    this.realPlus = this.plus;
                    this.plus += across;
                    this.contentWrap[0][this.prop] -= across * this.step;
                }

                if( c.merge ){                                                                      // 计算移动的宽度
                    to = debug.call(this, to);
                    pos = ( to - this.plus ) * this.step;
                    console.log(pos);
                    console.log(
                        "index: " + this.control[this.curPage % this.length].textContent + ", " +
                        "curPage: " + this.curPage + ", " +
                        "realCurPage: " + this.realCurPage + ", " +
                        "prevPage: " + this.prevPage + ", " + 
                        "realPrevPage: " + this.realPrevPage + ", " + 
                        "plus: " + this.plus + ", " + 
                        "realPlus: " + this.realPlus
                    );
                }else{
                    if( to + this.showNum > this.length ) to = this.length - this.showNum;
                    pos = to * self.step;
                }
                var o = {};
                o[ this.prop ] = pos;

                this.contentWrap.stop( true );                                                      // 
                this.contentWrap.animate( o, c.animateTime );                                       // 执行动画
            }
        }
    }
    function debug(to) {
        var plus = this.plus,
            realPlus = this.realPlus,
            prevPage = this.prevPage,                                                           // 如果this.prevPage为undefined，说明是初始化的时候。将from为0，否则为this.prevPage。                              
            curPage = this.curPage,
            length = this.length;
        if( (this.plus > 0 && realPlus === 0) || (realPlus > 0) ) {                                                     // 滑动超过两屏时。刚超过两屏时, this.plus为1, 而this.realPlus为0, 所以this.plus > 0 && this.realPlus === 0的情况; 超过两屏后, this.realPlus 大于0, 但点击按钮时this.plus为负数。
            if(prevPage - to > length && to < length) {                                         // 说明用按钮来控制
                
                var across;
                across = to - prevPage % length;
                to += prevPage - prevPage % length;

                if(across > 0 && plus > realPlus) {
                    var tarArr = $.makeArray( this.target ),
                        num = Math.abs( across );

                    for( var i = 0; i < num; i++ ){
                        var elem = tarArr.shift();
                        this.content.append( elem );
                        this.target = this.content.children();
                    }

                    this.realPlus = this.plus;
                    this.plus += across;
                    this.curPage = to;
                    this.realCurPage = this.length * 2 - 1;
                    this.realPrevPage = this.realCurPage - 1;
                    this.contentWrap[0][this.prop] -= num * this.step;

                }else {
                    this.plus = this.realPlus;
                    this.realPlus -= 1;
                    this.curPage = to;
                    this.realCurPage = this.length * 2 - 1;
                    this.realPrevPage = this.realCurPage - 1;
                    // this.contentWrap[0][this.prop] = num * this.step;
                } 

            }
        }else if(realPlus < 0) {
            if(to > 0 && to < length) {
                var across;
                
                across = to - (prevPage % length + length);

                to += prevPage - prevPage % length - length;

                var tarArr = $.makeArray( this.target ),
                    num = Math.abs( across );
                if(across < 0) {
                    for( var i = 0; i < num; i++ ){
                        var elem = tarArr.pop();
                        this.content.prepend( elem );
                        this.target = this.content.children();
                    }
                }

                this.realPlus = this.plus;
                this.plus += across;
                this.curPage = to;
                this.contentWrap[0][this.prop] += num * this.step;
            }
        }

        return to;
    }

    var focus = Slide.focus = function( p ){
        p = $.extend( {}, focus.config, p )
        return new Slide( p );
    }
    focus.prototype = Slide.prototype;
    focus.config = {
        autoPlay: true,
        effect: 'fade'
    }

    var marquee = Slide.marquee = function( p ){
        p = $.extend( {}, marquee.config, p )
        return new Slide( p );
    };
    marquee.prototype = Slide.prototype;   
    marquee.config = {
        effect: 'slide',
        merge: 'true',
        control: false,
        direction: 'y',
        autoPlay: true
    };

    // scroll参数
    var tabScroll = Slide.scroll = function (p ){
        p = $.extend( {}, tabScroll.config, p )
        return new Slide( p );
    };
    tabScroll.prototype = Slide.prototype; 
    tabScroll.config = {
        effect: 'slide',
        merge: 'true',
        control: false
    };

    window.Slide = Slide;

})( window, jQuery );