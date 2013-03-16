$(document).ready(function() {
  // :)

  $('.segment').mouseenter(function (e) {
    var $para = $(this).find('.para');
    $para.css({
      display: 'block'
    });

    $para
      .stop()
      .animate({ 'opacity': 1 }, 300);
  });

  $('.segment').mouseleave(function (e) {
    var $para = $(this).find('.para');
    $para
      .stop()
      .animate({ 'opacity': 0 }, 300);
  });

  var scrolling = false
    , lastSection = 'installation';

  $('a.scroll').click(function (e) {
    e.preventDefault();

    var section = $(this).attr('href');
    scrolling = true;
    if (section == '#top') {
      $('html,body').animate({
        scrollTop: 0
      }, function () {
        setTimeout(function () {
          lastSection = 'header-installation';
          setActiveMenu();
          scrolling = false;
        }, 300);
      });
    } else {
      var $scrollto = $(section);
      $('html,body').animate({
        scrollTop: $scrollto.offset().top - 15
      }, function () {
        setTimeout(function () {
          lastSection = section.substr(1);
          setActiveMenu();
          scrolling = false;
        }, 300);
      });
    }
  });

  var panelTops = {}
    , theTimer;


  function detectActiveMenu() {
    if (scrolling) return;
    var pos = $(document).scrollTop()
      , which = lastSection;

    for (key in panelTops) {
      if ((pos + 250) >= panelTops[key]) {
        which = key;
      }
    }

    if (!scrolling && which !== lastSection) {
      lastSection = which;
      setActiveMenu();
    }
  }

  var lastMenu;
  function setActiveMenu() {
    var info = lastSection.split('-')
      , isHeader = (info[0] == 'header') ? true : false
      , primary = (isHeader) ? info[1] : info[0];

    $('nav > div').removeClass('active');
    if (isHeader) {
      $('nav > #' + primary + '.head')
        .addClass('active');
    } else {
      $('nav > #' + info[1] + '.' + info[0] + '.section')
        .addClass('active');
    }

    if (primary !== lastMenu) {
      if (lastMenu) {
        $('nav > .' + lastMenu)
          .stop()
          .animate({
              height: 0
            , opacity: 0
          }, 300, function () {
            $(this).hide();
          });
      }

      $('nav > .' + primary)
        .css({
            display: 'block'
          , opacity: 0
          , height: 0
        });

      $('nav > .' + primary)
        .stop()
        .animate({
            height: 21
          , opacity: 1
        }, 300);

      lastMenu = primary;
    }
  }

  setTimeout(function () {

    $('.segment').each(function(index) {
      var id = $(this).attr('id');
      panelTops[id] = $(this).offset().top;
    });

    detectActiveMenu();

    // this handles the document scroll event
    $(document).scroll(function(e) {
      if (!scrolling) detectActiveMenu();
      if (!theTimer) {
        theTimer = setTimeout(function () {
          detectActiveMenu();
          theTimer = null;
        }, 1000);
      }
    });
  }, 2000);

});
