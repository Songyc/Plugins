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
        this.config = $.extend( {}, Slide.config, options );    // �ϲ�����        
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

            this.wrap = this.target.parent();                           // this.target��һ��jQuery����ѡ�����еĻ�������
            if( /(?:ul|ol|dl)/i.test( this.wrap[0].tagName ) ){         // ����������ĸ�Ԫ����ul,ol,dl���е�һ��
                this.content = this.wrap;                               // ����this.contentΪthis.wrap��(contentΪ������)
                this.wrap = this.wrap.parent();                         // ����this.wrap�ĸ�Ԫ��Ϊthis.wrap(wrapΪ������ĸ�Ԫ��)
            }else{
	            // jQuery �� append �ᵼ�� script ����ִ�У��Ӷ�����ʹ�� textarea �� lazy ʱ���� textarea ���պ϶������˺�������ݵ�����
                var _jTmpWrap = $( '<div class="slideContent"></div>' )     // ���򴴽�һ��slideContentԪ��
                    _tmpWrap = _jTmpWrap.get(0);                            // 
                var _frag = document.createDocumentFragment();
                for(var _i = this.target.length - 1; _i >= 0; _i--) {
	                _frag.insertBefore(this.target[_i], _frag.firstChild);
                }
                _tmpWrap.appendChild(_frag);
                this.wrap.get(0).appendChild(_tmpWrap);
                
                this.content = _jTmpWrap;                                   // ��slideContent����Ϊcontent
                _jTmpWrap = null;
                _tmpWrap  = null;
            }

            if( c.control !== false ){                                       
                c.control = c.control || $( '.control', this.wrap );
                if( c.control && c.control.length ){                       // �����control������.prev��this.prevBtn��.next��this.nextBtn�ϡ�
                    this.control = c.control.not( '.prev, .next' );
                    if( !this.prevBtn ) this.prevBtn = c.control.filter( '.prev' );
                    if( !this.nextBtn ) this.nextBtn = c.control.filter( '.next' );
                }else{                                                     // �����Զ�����
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

            c.oninit.call(self);                                            // ��ʼ��֮ǰ���ú���

            if( this.effect ) this.effect.oninit.call( this );              // ��ʼ���л�ģ�͡�

            this.playTo( c.playTo );                                        // c.playToĬ��Ϊ0����ʼ��Ĭ�ϻ�����0��
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

            if( c.autoPlay ){                                                   // ���¼�
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
        playTo: function( page ){                                   // pageΪ��ǰ��
            var $control = this.control,
                curClass = this.config.curClass,        
                prevPage;                                           // prevPageΪ��һ��

            if( this.curPage === page ) return;                     // this.curPage��ǰҳ����Ҫ������ҳ�롣˵��Ҫ��������ǰҳ��Ҳ���ǲ��û����������²�����

            this.prevPage = this.curPage;                           // ����this.prevPageΪthis.curPage, this.curPageĬ��Ϊundefiend��

            if( this.config.effect === 'slide' && this.config.merge ){      // ���������ʽΪ'slide'������֧�ֺϲ�
                prevPage = this._outBound( this.curPage );                  // ����this._outBound(page)���������prevPage(�ϴ�ҳ����±�)ֵ��Ĭ��Ϊundefined��
                this.curPage = page;                                        // page��ֵ��this.curPage��Ĭ��Ϊ0��
                page = this._outBound( page );                              // ����this._outBound(page)�����������ǰҳ��ֵ(��Ҫ��������ҳ����±�)��                
            }else{  
                prevPage = this.curPage;                                    // 
                page = this.curPage = this._outBound( page );
            }

            if( $control && $control.length ){
                $control.eq( prevPage ).removeClass( curClass );            // ȥ��ǰһ����Ӧ���ư�ť��curClass����
                $control.eq( page ).addClass( curClass );                   // ��ӵ�ǰ����Ӧ���ư�ť��curClass����
            }

            if( this.config.lazy ){                                         // ���֧��������
                var $curTarget = this.target.eq( page );                    // ��ȡ��ǰ��Ԫ��
                if( $curTarget.length && !$curTarget[0].parsed ){           // �����ǰ���г��ȣ�����parsed����Ϊfalse
                    this._lazyLoad( $curTarget );                           // ����this._lazyLoad(obj)
                }
            }

            if( this.effect ) this.effect.onchange.call( this, page);            // 
            this.config.onchange.call( this );                              // ִ���Զ���onchange()

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
            var length = this.length;                           // ����������  
            if( i >= length ) i %= length;                      // ���i���ڻ���ڻ�����������iȡ����
            if( i < 0 ){                                        // ���iС��0
                var m = i % length;                             // mȡ����
                i = m === 0 ? 0 : ( m + length );               // ���mֵΪ0��˵��iΪ�������Ҹ���ֵ������length����������i����Ϊ0; ����mֵ����lengthֵ���ó���Ҫ�����������±ꡣ
            }
            return i;                                           // ����i 
        },
        _lazyLoad: function( $obj ){                            
            var textarea = $( 'textarea', $obj );               // ��������Ϊ$obj�£���ȡ��ǩΪ'textarea'��Ԫ��
            if( textarea.length ){                              // ���textarea�ĳ��ȴ���
                $obj.html( textarea.val() );                    // ��$obj���ı����ݻ���textarea��valueֵ
                $obj[0].parsed = true;                          // parsedֵ����Ϊtrue
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
	            // jQuery ʽ�� wrap �� append �Ȼ��� textarea ��������⣬���ô� dom �� append
	            $('<div class="contentWrap" style="overflow:hidden; position: relative; zoom:1; width:100%; height:100%;"></div>')
                    .insertBefore(this.content)
                    .get(0)
                    .appendChild(this.content.get(0));                                  // ��ul���һ������ΪcontentWrap��Ԫ��
                this.contentWrap = this.content.parent();                               // ����Ϊthis.contentWrap����

                if( this.config.direction === 'x' ){                                    // �ж��л��������Ϊ'x'����ʾ�����л�
                    this.step = this.config.width || this.target.eq( 0 ).outerWidth();  // ���Ի�ȡthis.config.width���ԣ����û�����ȡ�������ĵ�һ��Ԫ�صĿ�
                    this.prop = 'scrollLeft';                                           // ����this.prop����Ϊ 'scrollLeft'
                    this.boxProp = 'width';                                             // ����this.boxProp����Ϊ 'width'
                }else{
                    this.step = this.config.height || this.target.eq( 0 ).outerHeight();
                    this.prop = 'scrollTop';
                    this.boxProp = 'height';
                }

                this.showNum = Math.floor( parseFloat( this.wrap.actual(this.boxProp) ) / this.step );          // ��ȡʵ��Ҫ�����Ŀ�ȣ�Ҫ���ͳɸ���������Ϊ�������ַ���������ÿ���Ŀ�ȡ������Ŀ�ȳ���ÿ����ȵ���ÿ��Ҫ�����������������ȡ����

                if( this.config.merge ){                                                                        // ���֧�ֺϲ�
                    this.showNum = Math.ceil( parseFloat( this.wrap.actual(this.boxProp) ) / this.step );       // ����ȡ��ֵ
                    var cloneArr = this.target.clone( true );                                                   // ��ȿ�¡this.target
                    // 2013/08/01 lazy ʱ jQuery �� append �������⣬תΪԭ��
                    var frag = document.createDocumentFragment();                                               // �����ĵ���Ƭ
                    cloneArr.each(function(){                                                                   // �����ĵ���Ƭ
	                    frag.appendChild(this);
                    });
                    this.content.get(0).appendChild(frag);                                                      // ���뵽this.content���
                    
                    $.merge( this.target, cloneArr );                                                           // this.target�Ӷ�һ�ݿ�¡��Ԫ��
                    this.plus = 0;                                                                              // this.plus��������Ϊ0
                }

                if( this.config.direction === 'x' ){                                                            
                    this.content.width( this.step * this.target.length );                                       // ����this.contentΪ���л�����Ԫ��֮��
                    this.target.css( 'float', 'left' );                                                         // ����������Ϊ����
                }

            },
            onchange: function(){
                var self = this,
                    c = this.config,
                    from = this.prevPage === window.undefined ? 0 : this.prevPage,                              // ���this.prevPageΪundefined��˵���ǳ�ʼ����ʱ�򡣽�fromΪ0������Ϊthis.prevPage��
                    to = this.curPage,                                                                          // ��ǰ��������
                    pos;

                merge: if( c.merge ){                                                               // ���֧�ֺϲ�
                    var across = to - from,                                                         // ��ǰ������һ����ȡ�ÿ����� 
                        num = Math.abs( across );                                                   // ȡ����ֵ

                    if( this.realCurPage === window.undefined ){                                    // ���realCurPageΪundefined��˵����ʼ����
                        this.realCurPage = to;                                                      // ��ǰ����ֵthis.realCurPage
                        this.realPrevPage = from;                                                   // ��һ����ֵthis.realPrevPage
                    }

                    if( across === 0 ){                                                             // ���across��˵�����ر�������������顣
                        break merge;
                    }   
                    
                    if( across > 0 ){                                                               // ���across����0��˵��Ҫ��ǰ����
                        if( to <= this.target.length + this.plus - this.showNum ){                  // ������(������¡��), ���Ͽ�����, ��ȥÿ�λ���������
                            var tmp = this.realCurPage;                                             // ��������ǰ�����浽tmp����
                            this.realCurPage = this.plus === 0 ? to : this.realCurPage + 1;         // ���this.plusΪ0��˵����ʼ�������¼���this.realCurPageֵ��this.realCurPage����Ϊto������+1;
                            this.realPrevPage = tmp;                                                // ��tmp��ֵ��this.realPrevPage
                            break merge;                                                            // ���������
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

                if( c.merge ){                                                                      // �����ƶ��Ŀ��
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
                this.contentWrap.animate( o, c.animateTime );                                       // ִ�ж���
            }
        }
    }
    function debug(to) {
        var plus = this.plus,
            realPlus = this.realPlus,
            prevPage = this.prevPage,                                                           // ���this.prevPageΪundefined��˵���ǳ�ʼ����ʱ�򡣽�fromΪ0������Ϊthis.prevPage��                              
            curPage = this.curPage,
            length = this.length;
        if( (this.plus > 0 && realPlus === 0) || (realPlus > 0) ) {                                                     // ������������ʱ���ճ�������ʱ, this.plusΪ1, ��this.realPlusΪ0, ����this.plus > 0 && this.realPlus === 0�����; ����������, this.realPlus ����0, �������ťʱthis.plusΪ������
            if(prevPage - to > length && to < length) {                                         // ˵���ð�ť������
                
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

    // scroll����
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