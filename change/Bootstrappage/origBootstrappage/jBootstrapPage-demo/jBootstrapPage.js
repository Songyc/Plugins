(function ($){
	$.fn.jBootstrapPage = function (config){
		// console.log('sychaha!');
		if (this.size() != 1) return;
		// pageSize: 10, buttons: 13, total: 150
		var c = {
			pageSize: 10,
			total: 0,
			maxPages: 1,
			realPageCount: 1, 
			lastSelectedIndex: 1,
			selectedIndex: 1,
			maxPageButton: 3,
			onPageClicked: null
		}

		var firstBtn, preBtn, nextBtn, lastBtn;

		return this.each(function (){

			var $this = $(this);
			//reset config
			if (config) $.extend(c, config);

			init();
			bindALL();

			function init(){
				//clear childNodes
				$this.find('li').remove();

				c.maxPages = Math.ceil(c.total/c.pageSize);

				if(c.maxPages < 1) return;
				//判断最大页maxPages是否小于显示页maxPageButton，是则让显示页为最大页
				if(c.maxPages < c.maxPageButton) {
					c.maxPageButton = c.maxPages;
				}
				//append forward btn
				$this.append('<li class = "disabled"><a class = "first" href = "#">&laquo;</a></li>');
				$this.append('<li class = "disabled"><a class = "pre" href = "#">上一页</a></li>');
				// show btns
				var pageCount = c.maxPages < c.maxPageButton ? c.maxPages : c.maxPageButton;
				var pNum = 0;
				for(var index = 1; index <= pageCount; index++) {
					pNum++;
					$this.append('<li class = "page" pNum = "' + pNum + '"><a href = "#" page = "' + index + '">'+index+'</a></li>');
				}
				//append back btn
				$this.append('<li><a href = "#" class = "next">下一页</a></li>');
				$this.append('<li><a class = "last" href = "#">&raquo;</a></li>');
				//去掉下一页最后一页的样式 
				if(c.maxPageButton > c.maxPages) {
					// $this.find('li a.next').parent().addClass('disabled');
					// $this.find('li a.last').parent().addClass('disabled');
				}else{
					$this.find('li a.next').parent().removeClass('disabled');
					$this.find('li a.last').parent().removeClass('disabled');
				}
				$this.find('li:nth-child(3)').addClass('active');
				// get btns
				firstBtn = $this.find('li a.first').parent();
				preBtn = $this.find('li a.pre').parent();
				nextBtn = $this.find('li a.next').parent();
				lastBtn = $this.find('li a.last').parent();
			}
			function onClickPage(pageBtn) {
				c.lastSelectedIndex = c.selectedIndex;
				c.selectedIndex = parseInt(pageBtn.text());

				if(c.onPageClicked) {
					c.onPageClicked.call(this, $this, c.selectedIndex - 1);
				}

				$this.find('li.active').removeClass('active');
				pageBtn.parent().addClass('active');

				if(c.selectedIndex > 1){
					if(preBtn.hasClass('disabled')) {
	            		firstBtn.removeClass("disabled");
	            		preBtn.removeClass("disabled");
	            		
	            		bindFirsts();
            		}
				}else{
					if(!preBtn.hasClass('disabled')) {
						firstBtn.addClass('disabled');
						preBtn.addClass('disabled');
					}
				}

				if(c.selectedIndex >= c.maxPages)  {		
            		if(!nextBtn.hasClass('disabled')) {
            			nextBtn.addClass("disabled");
            			lastBtn.addClass("disabled");
            		}
            	}else {
            		if(nextBtn.hasClass('disabled')) {
            			nextBtn.removeClass("disabled");
            			lastBtn.removeClass("disabled");
            		
            			bindLasts();
            		}
            	}
			}
			function bindFirsts() {
				$this.find("li a.first,li a.pre").each(function (){
					if($(this).parent().hasClass('disabled')) return;
					$(this).unbind('pageClick');
					$(this).on('pageClick', function (e){
						onPageBtnClick($(this));
					});
				});
			}
			function bindLasts() {
            	$this.find("li a.last,li a.next").each(function() {
            		if($(this).parent().hasClass('disabled')) return;
            		$(this).unbind('pageClick');
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            }
			function bindPages() {     	
            	$this.find("li.page a").each(function(){
            		if($(this).parent().hasClass('disabled')) return;
            		
            		$(this).on('pageClick', function(e) {
            			onPageBtnClick($(this));
            		});
                });
            	
                $this.find("li.page a").click(function(e){
                	e.preventDefault();
                	
                	$(this).trigger('pageClick', e);
                });
            }
            //点击上一页按钮,计算页码
            function mathPrePage(currButtonNum, currPage, maxPage, showPage) {
            	if(maxPage < 1) return; 
            	var startPages = 0;
            	var endPages = 0;
				if(currButtonNum == 0) {
					startPages = currPage - showPage;
					endPages = currPage - 1;
					if(startPages <= 0) {
						startPages = 1;
						endPages = showPage;
					}
					createPage(startPages, endPages);
				}
				bindPages();
            }
            //根据页码创建html
            function createPage(startPages, endPages) {
            	var pNum = 0;
				var html = '';
				for(var index = startPages; index <= endPages; index++) {
					pNum++;
					html += '<li class = "page" pNum = "'+pNum+'"><a href = "#" page = "'+index+'">'+index+'</a></li>'
				}
				$this.find('li.page').remove();
				$this.find('li:nth-child(2)').after(html);
				bindPages();
            }
            //点击下一页按钮,计算页码
			function mathNextPage(currButtonNum, currPage, maxPage, showPage){
				// 按后的序数,按前号码数,最大页,显示页
				if(maxPage < 1) return;
				var startPages = 0;
				var endPages = 0;
				if(currButtonNum == showPage + 1) {
					startPages = currPage + 1;
					endPages = currPage + showPage;
					if(endPages >= maxPage) {
						endPages = maxPage;
						startPages = endPages - showPage + 1;
					}
					createPage(startPages, endPages);
				}
			}
			//重新计算最后页的页码排序
			function mathLastPage(maxPage, showPage){
				var startPages = maxPage - showPage + 1;
				var endPages = maxPage;
				createPage(startPages, endPages);
			}
			//重新计算第一页的页码排序
			function mathFirstPage(maxPage, showPage){
				var startPages = 1;
				var endPages = showPage;
				createPage(startPages, endPages);
			}
			function onPageBtnClick($_this, e) {
				var selectedText = $_this.text();
				var selectedBtn = $this.find('li.active').find('a');

				if(selectedText == '下一页') {
					var selectedIndex = parseInt(selectedBtn.text());
					var selectNum = parseInt($this.find('li.active').attr('pNum'))+1; 
					if(selectedIndex > 0){	
						mathNextPage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
						selectedBtn = $this.find("li.page").find('a[page="'+(selectedIndex+1)+'"]');
					}
				}else if(selectedText == '上一页') {
            		var selectedIndex = parseInt(selectedBtn.text());
            		var selectNum = parseInt($this.find('li.active').attr('pNum'))-1;
            		// if(selectNum < 1) selectNum = 1;
            		mathPrePage(selectNum, selectedIndex, c.maxPages, c.maxPageButton);
            		selectedBtn = $this.find('li.page').find('a[page="'+(selectedIndex-1)+'"]');
            	}else if(selectedText == '»') {
            		//点击最后一页时,换样式
            		$this.find('li a.next,li a.last').each(function (ele){
            			$(this).parent().addClass('disabled');
            		});
            		$this.find('li a.pre,li a.first').each(function (ele){
            			$(this).parent().removeClass('disabled');
            		});
            		//监听前一页，第一页按钮事件
            		bindFirsts();
            		//重新计算页码的排列顺序
            		mathLastPage(c.maxPages, c.maxPageButton);
            		//挑选出最后的按键selectedBtn
            		selectedBtn = $this.find("li.page").find('a[page="'+(c.maxPages)+'"]');
            	}else if(selectedText == '«'){
					selectedBtn = $_this;
					$this.find('li a.pre,li a.first').each(function (ele){
						$(this).parent().addClass('disabled');
					});
					$(this).find('li a.next,li a.last').each(function (ele){
						$(this).parent().removeClass('disabled');
					});
					bindLasts();
					mathFirstPage(c.maxPages, c.maxPageButton);
					selectedBtn = $this.find('a[page = "1"]');
				}else {
					selectedBtn = $_this;
				}
				onClickPage(selectedBtn);
			}

			function bindALL() {
				$this.find("li.page a,li a.first,li a.last,li a.pre,li a.next").each(function (e) {
					if($(this).parent().hasClass('disabled')) return;
					$(this).on('pageClick', function (e){
						onPageBtnClick($(this), e);
					});
				});
				$this.find("li.page a,li a.first,li a.last,li a.pre,li a.next").click(function (e){
					e.preventDefault();
					if($(this).parent().hasClass('disabled')) return;	
					$(this).trigger('pageClick', e);
				})
			}

		})
	}
})(jQuery);

//此插件没有用原型继承机制，多是私有方法，方法间的耦合度高，难于扩展和维护。
//有中文注释都是改的