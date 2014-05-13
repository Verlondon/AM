/*
	Fluid Main Javascript file
	Version : 1.0
	Author  : Brandon Clayton
	Company : Architect Mindframe
	Website : http://www.architectmindframe.com
*/
// create global namespace for theme functionality
var am = window.am || {};

am.fluid = (function ($) {
	var me = {};

	// set up Fluid global variables
	me.globals = {
		currentPage : [],
		pageWidth   : 0,
		sliderWidth : 0,
		pages       : [],
		onMenu      : false,
		onSubMenu   : false,
		isMobile    : false
	};

	// initialize the theme
	me.init = function() {
		if(window.location.hash.length > 0){
			// gatherPages(window.location.hash);
			window.location.hash = '';
		}
		// check to see if mobile phone
		if( /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) || window.innerWidth < 768 ) {
			me.globals.isMobile = true;
		}
		// set click events
		setEvents();
		// set each page container size
		setPageSizes();
		// start slideshow
		startSlideshow();
		// reset initial .pages height(s)
		resetPagesHeight();
	}

	/*
		Set all event handlers
	*/
	function setEvents(){

		// prevent all non-used links from changing the hash
		$('#articleCalendar a, #articleComments a, .aboutSocials a, #socialIcons li a, .portfolioNav ul li a').on('click',function(){
			return false;
		});

		// show prev/next and mark current page
		$('.pages').hover(function(){
			if($(this).find('.page').length > 1){
				if(!me.globals.isMobile){
					$(this).find('.prevPage').fadeIn(700);
					$(this).find('.nextPage').fadeIn(700);
				}
				me.globals.currentPage.push(this);
			}
		},function(){
			if($(this).find('.page').length > 1){
				if(!me.globals.isMobile){
					$(this).find('.prevPage').fadeOut(700);
					$(this).find('.nextPage').fadeOut(700);
				}
				me.globals.currentPage.shift();
			}
		});

		// go to previous page
		$('.prevPage').on('click',function(e){
			e.preventDefault();
			if(me.globals.currentPage.length > 0){
				slidePage('prev');
			}
		});

		// go to next page
		$('.nextPage').on('click',function(e){
			e.preventDefault();
			if(me.globals.currentPage.length > 0){
				slidePage('next');
			}
		});

		// show and hide sub menu
		$('#mainMenu nav ul li').hover(menuItemHover,menuItemUnHover);

		// for mobile only
		$('#mobileMenuIcon').on('click',function(){
			$('#menu').slideToggle();
			return false;
		});

		// open lightbox
		$('#articleLightOpen, .otherArticleHover a').on('click',function(){
			// $(this).parent().find('#articleLight').fadeIn();
			$('#articleLight').fadeIn();
			return false;
		});

		// close lightbox
		$('#articleLight').on('click',function(){
			if($(this).hasClass('lightbox')){
				$(this).fadeOut();
				// window.location.hash = '';
			}
		});

		// do not close lightbox when on lightbox content
		$('#articleLight figure').on('click',function(){
			return false;
		});

		// on hash change
		$(window).on('hashchange', function(e) {
			e.preventDefault();
			gatherPages(window.location.hash);
		});

		// on browser window re-size
		$(window).resize(function() {
			// wait until user stops re-sizing the browser window for 700 milliseconds
			resizeEnd(function(){
				setPageSizes();
			}, 700, "777"); // set time to wait and a unique ID for logic
		});

		// on scroll
		$(window).scroll(function(){
			// when viewing on mobile, show/hide social icons
			if(me.globals.isMobile && window.innerWidth < 768){
				var scrollTop = $(window).scrollTop(),
					topBar = parseInt($('#fluidLogo').css('height')),
					content = parseInt($('#wrapper').css('margin-top')),
					siPos = parseInt($('#mainSocialIcons').css('top')),
					siH = parseInt($('#mainSocialIcons').css('height')),
					si = $('#mainSocialIcons'),
					difference = content - topBar,
					subtract = difference - scrollTop,
					siNextPos = siPos - scrollTop;
				
				if(scrollTop > 40){
					si.fadeOut();
				} else if(scrollTop < 40){
					si.fadeIn();
				}
			}
        });

	}

	/*
		Main Functions
	*/
	function slideArticlesLeft(){
		var wide = parseInt($(this).parent().css('width')),
			left = parseInt($(this).parent().find('.pageOtherArticles').position().left);
		
		if(left < wide){
			wide = Math.abs(left);
		}
		if(left < 0 && !isNaN(left)){
			$(this).parent().find('.pageOtherArticles').animate({
				left : '+='+wide+'px'
			},700);
		}
	}

	function slideArticlesRight(){
		var wide = parseInt($(this).parent().css('width')),
			left = parseInt($(this).parent().find('.pageOtherArticles').position().left),
			aImgs = $(this).parent().find('.pageOtherArticles').find('.pageOtherArticle'),
			aImgL = aImgs.length,
			aImgW = parseInt($(aImgs).eq(0).css('width')),
			aWidth = aImgL * aImgW,
			remain = (aWidth - left) - wide,
			aPast = Math.abs(left) + wide;
		
		if(remain < wide){
			wide = left + remain;
		} else if(aPast >= aWidth){
			return;
		}
		
		$(this).parent().find('.pageOtherArticles').animate({
			left : '-='+wide+'px'
		},700);
	}

	function menuItemHover(){
		var my = $(this),
			subMenu = my.find('ul'),
			subMenuW = parseInt(subMenu.css('width')),
			parentW = my.parent().css('width'),
			left = parseInt(parentW) + 10;
		
		if(subMenuW > left){
			left = subMenuW;
		}
		if(!me.globals.isMobile || window.innerWidth >= 768){
			subMenu.css('top', (my.position().top.toFixed() - 5) + 'px');
			subMenu.css('left','-' + left + 'px');
		} else {
			subMenu.addClass('active');
			subMenu.css('top', (parseInt(my.position().top.toFixed()) + 15) + 'px');
			subMenu.fadeIn();
		}
	}

	function menuItemUnHover(){
		var my = $(this),
			subMenu = my.find('ul');
		
		if(me.globals.isMobile){
			subMenu.removeClass('active');
			subMenu.fadeOut();
		}
	}

	function launchFancyBox(group){
		$(group).fancybox();
		// $('.fancybox').fancybox();
	}

	function getPortfolioGroup(e,callback){
		if($(e).hasClass('listOfFiles')){
			callback($(e).find('figure').find('a'));
		} else {
			setTimeout(function(){
				getPortfolioGroup($(e).parent(),callback);
			},300);
		}
	}

	function startSlideshow(){
		$('#slides').slidesjs({
			width  : 1000,
			height : 275
		});
		$('.pageSliderImgs').each(function(){
			$(this).slidesjs({
				width  : 1000,
				height : 300
			});
		});

		// $('.pageOtherArticles').each(function(){
		// 	var imgWidth = parseInt($($(this).find('.pageOtherArticle').find('img')[0]).css('width')),
		// 		imgsLength = $(this).find('.pageOtherArticle').length,
		// 		marginW = parseInt($($(this).find('.pageOtherArticle')[0]).css('marginRight')) * imgsLength,
		// 		conWidth = imgWidth * imgsLength;
		// 	$(this).css('width',(conWidth + marginW)+'px');
		// });

		$('.pageOtherArticlesInnerContainer').jCarouselLite({
	        btnNext: '.pageOtherArticlesNextBtn',
	        btnPrev: '.pageOtherArticlesPrevBtn',
	        mouseWheel : true
	    });
	}

	function setPageSizes(){
		if(window.innerWidth < 651){
			me.globals.contentArea = 1;
		} else {
			me.globals.contentArea = .90;
		}

		var pageWidth = (window.innerWidth * me.globals.contentArea).toFixed(0), // get inner width of the browser minus the right sidebar TODO: mobile doesn't have a sidebar so get 100% width
			sliderWidth = (window.innerWidth * .88).toFixed(0) - 122,
			siderBtnLeftPos = (sliderWidth - parseInt($('.pageOtherArticlesPrevBtn').css('width')) + 14) + 'px',
			nextBtnWidth = $('.nextPage').css('width');

		me.globals.pageWidth = parseInt(pageWidth);
		me.globals.sliderWidth = parseInt(sliderWidth);

		$('.page').each(function(){
			$(this).css({ width : pageWidth }); // set each pages width to our new page width
		});

		$('.pages').each(function(){
			var thePage = $(this),
				pages = thePage.find('.page').length,
				pagesWidth = pages * pageWidth,
				gHeight = 0;
			// console.log('pageWidth',pageWidth,window.innerWidth);
			$(this).css({ height : $(this).find('.pagesContainer').find('.page')[0].offsetHeight + 'px' });
			$(this).css({ width : pageWidth });
			$(this).find('.pagesContainer').css({ width : pagesWidth });
		})
	}

	function gatherPages(hash){

		if(me.globals.pages.length > 0){
			goToPage(hash);
		} else {
			$('.pages').each(function(i){
				var v = i,
					pagesArr = [];
				
				$(this).find('.pagesContainer').find('.page').each(function(i){
					var h = i,
						classNameArr = this.className.split(/\s+/);
					for(var c = 0; c < classNameArr.length; c++){
						if(classNameArr[c] != 'page' && classNameArr[c] != 'current'){
							var pObj = {
								h  : h,
								v  : v,
								id : classNameArr[c]
							}
							pagesArr.push(pObj);
						}
					}
				});
				me.globals.pages.push({ pages : pagesArr });
			});
			goToPage(hash);
		}
	}

	function goToPage(hash){
		var pages = me.globals.pages;
		// $('.pageTitle').fadeOut();
		if(me.globals.isMobile && window.innerWidth < 768){
			if($('#menu').css('display') == 'block'){
				$('#menu').slideToggle();
			}
		}
		for(var i = 0; i < pages.length; i++){
			var page = pages[i].pages;
			
			for(var p = 0; p < page.length; p++){
				var id = '#'+page[p].id;
				if(id == hash){
					var section = $('.pages').eq(i),
						sectionTop = (me.globals.isMobile) ? (section.position().top - 70) : section.position().top,
						h = page[p].h,
						left = -(h * me.globals.pageWidth),
						currPage = $(section).find('.page').eq(h);

					$('html,body').animate({ scrollTop : sectionTop },700,function(){
						$('.page').removeClass('current');
						$(section).find('.pagesContainer').animate({
							left : left
						},700,function(){ // cross check height to ensure view is visible
							var secH = parseInt(section.css('height')),
								pageH = parseInt(currPage.css('height'));
							if(secH != pageH){
								section.css('height', pageH + 'px');
							}
							$(currPage).addClass('current');
							// $(currPage).find('.pageTitle').fadeIn();
						});
					});
				}
			}
		}
	}

	function slidePage(dir){
		var page = me.globals.currentPage[0],
			pages = $(page).find('.page');
		
		// $('.pageTitle').fadeOut();
		for(var i = 0; i < pages.length; i++){
			if($(pages[i]).hasClass('current')){
				var inc = (dir == 'next') ? (i+1):(i-1);
					left = inc * me.globals.pageWidth;
				
				$(pages[i]).removeClass('current');
				
				if(dir == 'next'){
					if(i < pages.length - 1){
						$(pages[i]).next().addClass('current');
						setPageHeight(page,$(pages[i]).next());
					} else {
						$(pages[0]).addClass('current');
						left = 0;
						setPageHeight(page,$(pages[0]));
					}
				} else {
					if(i < 1){
						$(pages[(pages.length - 1)]).addClass('current');
						left = (pages.length - 1) * me.globals.pageWidth;
						setPageHeight(page,$(pages[(pages.length - 1)]));
					} else {
						$(pages[i]).prev().addClass('current');
						setPageHeight(page,$(pages[i]).prev());
					}
				}

				$(pages[i]).parent().animate({
					left : '-' + left + 'px'
				},700,function(){
					// $(pages[i]).parent().find('.pageTitle').fadeIn();
				});
				return;
			}
		}
	}

	/*
		Utility Functions
	*/

	function resetPagesHeight(){
		$('.pages').each(function(){
			var fPageClsArr = $(this).find('.pagesContainer').find('.page').eq(0).attr('class').split(' '),
				fpCls = '';
			
			for(var fp = 0; fp < fPageClsArr.length; fp++){
				if(fPageClsArr[fp] != 'page' && fPageClsArr[fp] != 'current'){
					fpCls = fPageClsArr[fp];
				}
			}
			function findEle(matchClass) {
				var elems = document.getElementsByTagName('div'), i;
				for (i in elems) {
					if((' ' + elems[i].className + ' ').indexOf(' ' + matchClass + ' ')
					> -1) {
						return elems[i].offsetHeight;
					}
				}
			}
			$(this).css({ height : (findEle(fpCls) + 50) + 'px' });
			if(me.globals.isMobile && $(this).find('.pagesContainer').find('.page').length > 1){
				$(this).find('.prevPage').fadeIn();
				$(this).find('.nextPage').fadeIn();
			}
		});
	}

	function setPageHeight(page,innerPage){
		$(page).css('height', $(innerPage)[0].offsetHeight);
	}

	var resizeEnd = (function () {
		// consider pulling timers object into the global scope
		var timers = {};
		return function (callback, ms, uniqueId) {
			if (!uniqueId) {
				uniqueId = "777";
			}
			if (timers[uniqueId]) {
				clearTimeout (timers[uniqueId]);
			}
			timers[uniqueId] = setTimeout(callback, ms);
		};
	})();

	function isFunction(obj) {
		var getType = {};
		return obj && getType.toString.call(obj) === '[object Function]';
	}

	return me;
}(jQuery));

jQuery(document).ready(function(){
	am.fluid.init();
});