/*
 * If not stated otherwise in this file or this component's Licenses.txt file the
 * following copyright and licenses apply:
 *
 * Copyright 2015 RDK Management
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
*/
// Copyright 2017-2019 Arris Enterprises LLC
//   (Added localization)
//

/* $Id: global.js 3167 2010-03-03 18:11:27Z slemoine $ */

/*
 *  Declare the global object for namespacing.
 */

//Supported browser versions
const MIN_BROWSER_VERSIONS = {
  "Chrome"          : "70.0.3538.110",
  "Mozilla Firefox" : "63.0.3",
  "IE"              : "11.0",           //11.0 since IE's useragent string does not specify the entire/complete version.
  "Edge"            : "17.17134",       //Microsoft EdgeHTML version since edge's ua doesn't contain browser version info
  "Safari"          : "12.0.2"
};

var arris = window.arris || {};
jQuery.browser = getBrowserInfo();

function getBrowserInfo() {
  var ua = navigator.userAgent.toLowerCase();
  var match = {}
  if (/^(?=.*webkit)(?=.*chrome)(?!.*edge)(?!.*opr)(?!.*ubrowser).*$/.test(ua)) {
    match.chrome = match.webkit = true;
    match.name = "Chrome";
    match.version = ua.match(new RegExp("chrome/([0-9.]+)"))[1].trim();
  } else if (/^(?=.*mozilla)(?=.*firefox).*$/.test(ua)) {
    match.mozilla = true;
    match.name = "Mozilla Firefox";
    match.version = ua.match(new RegExp("firefox/([0-9.]+)"))[1].trim();
  } else if (/^((?=.*msie)|(?=.*trident)).*$/.test(ua)) {
    match.msie = true;
    match.name = "IE";
    match.version = ua.match(new RegExp("rv:([0-9.]+)"))[1].trim();
  } else if (/^(?=.*webkit)(?=.*chrome)(?=.*edge).*$/.test(ua)) {
    match.edge = true;
    match.name = "Edge";
    match.version = ua.match(new RegExp("edge/([0-9.]+)"))[1].trim();
  } else if (/^(?=.*safari)(?=.*applewebkit)(?!.*chrome).*$/.test(ua)) {
    match.safari = match.webkit = true;
    match.name = "Safari";
    match.version = ua.match(new RegExp("version/([0-9.]+)"))[1].trim();
  }

  match.min_version = (match.name != null) ? MIN_BROWSER_VERSIONS[match.name] : null;
  return match;
}

function isSupportedBrowser() {
  return ($.browser.chrome || $.browser.mozilla || $.browser.safari || $.browser.msie || $.browser.edge);
}

function isSupportedVersion() {
  return $.browser.version >= MIN_BROWSER_VERSIONS[$.browser.name];
}

arris.page = function() {
  function setupLeftNavigation(selectedNavElement) {
    if(typeof selectedNavElement == "string") {
      $("#nav li#" + selectedNavElement + " a").addClass("selected");
    } else if ((selectedNavElement instanceof jQuery) && selectedNavElement.hasClass("top-level")) {
      selectedNavElement.addClass("top-level-active");
    }

    // Show all UL that contain the current page
    $("#nav ul:has(.selected)").show();

    // Folder arrows
    $("#nav li li:has(ul) > a").addClass("folder");

    $("#nav li li:has(.selected) > a").addClass("folder-open");

    // Top Level Navigation
    $("#nav li:has(.selected) > a.top-level").addClass("top-level-active");

    // For Development Only: Show broken links in navigation as gray
    // $("#nav a[href='#']").css("color","#ccc");

    $("#nav a.top-level").click(function() {
      var $topNav = $("#nav a.top-level-active");
      var $newNav = $(this);
      var $newNavList = $newNav.next();

      if(!$newNav.hasClass("top-level-active")) {
        $("#nav a.top-level-active").removeClass("top-level-active").next();
        $(this).addClass("top-level-active");

          $topNav.next();
        $newNav.next();
      }
    });

    $("#nav a.folder").click(function() {
      var $link = $(this);
      var $list = $link.next();

      if($link.is(".folder-open")) {
        $link.removeClass("folder-open");
        $list.slideUp();
      } else {
        $link.addClass("folder-open");
        $list.slideDown();
      }
    });

    //Fire Fox display inline fixes


      //Fire Fox 3.0 display inline fixes
      if ($.browser.mozilla) {
          var $version = $.browser.version.split('.')
          if ($version[0] && parseInt($version[0], 10) <= 1){
            if ($version[1] && parseInt($version[1], 10) <= 9){
              if ($version[2] && parseInt($version[2], 10) <= 0){
                if ($version[3] && parseInt($version[3], 10) <= 11 || parseInt($version[3], 10) <= 14 ){

                  //fixes block content positioning such as image dissappearing
                  $('.block').addClass("ff2");
                  //fixes odd width bug after applying moz-inline-stack
                  $(".block").wrapInner($("<div class=\"ff2fix\"></div>"));

                };
              };
            };
          };

      //Fire Fox 2 display inline fixes
          if ($version[0] && parseInt($version[0], 10) <= 1){
            if ($version[1] && parseInt($version[1], 10) <= 8){
              if ($version[2] && parseInt($version[2], 10) <= 1){
                if ($version[3] && parseInt($version[3], 10) <= 15){

                  //fixes block content positioning such as image dissappearing
                  $('.block').addClass("ff2");
                  //fixes odd width bug after applying moz-inline-stack
                  $(".block").wrapInner($("<div class=\"ff2fix\"></div>"));

                };
              };
            };
          };

      };

  }

  function setupBatteryIndicator(){
    /*
     * Battery indicator in the status bar
     */
    //get percentage
    var battery = $("li.battery").text().match(/\d+/);
    var $icon = $("li.battery span");
    //assign class based off of battery percentage

    if(battery > 90){
      $icon.removeClass().addClass("bat-100");
    }

    else if(battery > 60 ){
      $icon.removeClass().addClass("bat-75");
    }

    else if (battery > 39){
      $icon.removeClass().addClass("bat-50");
    }

    else if(battery > 18) {
      $icon.removeClass().addClass("bat-25");
    }

    else if(battery > 8) {
      $icon.removeClass().addClass("bat-10");
    }

    else {
      $icon.removeClass().addClass("bat-0");
    };
  }

  function setupEducationalTip() {
    if($("#educational-tip:has(.hidden)").length > 0) {
       var closed = true;
       var $link = $("<a href=\"javascript:;\" class=\"tip-more\">" + getLocalized('MORE') + "</a>").click(function() {
         if(closed) {
           $("#educational-tip .hidden").fadeIn();
           closed = false;
           $(this).html(getLocalized('LESS'));
         } else {
           $("#educational-tip .hidden").fadeOut();
           closed = true;
           $(this).html(getLocalized('MORE'));

         }
       }).appendTo("#educational-tip");
    }
  }

  function setupComboGroupDisplay(comboGroupName) {
    if ((comboGroupName != null) && (comboGroupName != "")) {
      var $link = $("#" + comboGroupName + " input");
      var $div = $("#" + comboGroupName +" .hide");

      // hide all of the elements
      $($div).hide();

      // toggle slide
      $($link).click(function(e) {
        $(this).siblings('.hide').slideToggle();
      });
    }
  }

  function setupDeleteConfirmDialogs() {
    /*
     * Confirm dialog for delete action
     */

    $("a.confirm").click(function(e) {
      e.preventDefault();

      var href = $(this).attr("href");
      var message = ($(this).attr("title").length > 0) ? $.validator.format(getLocalized('ARE_YOU_SURE_WANT_TO_TEXT'), $(this).attr("title")) : getLocalized('ARE_YOU_SURE');

      jConfirm(message, getLocalized('ARE_YOU_SURE'), function(ret) {
        if (ret) {
          window.location = href;
        }
      });
    });
  }

  function setupFormValidation() {
    $.validator.setDefaults({
      errorElement : "p"
      ,errorPlacement: function(error, element) {
        error.appendTo(element.closest(".form-row"));
      }
    });
  }

  function setupTooltipInHeader() {
    $("#status li").mouseenter(function() {
      $(".tooltip", this).fadeIn();
    }).mouseleave(function() {
      $(".tooltip", this).fadeOut();
    });
  }

  return {
    init: function(title, navElementId, comboGroupName) {
      document.title += " - " + title;
      var headingElement = document.getElementById("pageHeading");
      if (headingElement != null) {
        headingElement.innerHTML = title;
      }
      setupLeftNavigation(navElementId);
      setupDeleteConfirmDialogs();
      //setupBatteryIndicator();
      setupEducationalTip();
      setupFormValidation();
      setupComboGroupDisplay(comboGroupName);
      setupTooltipInHeader();

      // IE6 flickering fix
      try { document.execCommand('BackgroundImageCache', false, true); } catch(e) {};

      // IE6/7 fix for change event firing on radio and checkboxes
      if ($.browser.msie) {
        $('input:radio, input:checkbox').click(function() {
          try {
            this.blur();
            this.focus();
          }
          catch (e) {}
        });
      }

    }
  }
}();

arris.breakWord = function(originalString, characterLimit) {
  var originalString = ""+originalString;                         // Cast variable as string
  var characterLimit = parseInt(characterLimit);                  // Cast variable to integer

  if(originalString.length <= 0  || characterLimit <= 0) return;  // Exit if string or character limit are out of bounds

  var re = new RegExp("(\\w{" + characterLimit + "})","g")

  // Insert spaces inside a long string at characterLimit intervals
  return originalString.replace(re, '$1 ');
}

/*
 * Turn radio input fields to Buttons
 */

$.fn.radioToButton = function(settings) {
  var config = {
    autoSubmitForm: false
  }

  if (settings) $.extend(config, settings);

  this.each(function() {
    var $c = $container = $(this);
    var $boxes = $c.find("li");

    $c.addClass("radiolist");

    $("li", $c).removeClass("selected");
    $("input:radio:checked", $c).parent().addClass("selected");

    $("label", $c).click(function(e) {
      e.preventDefault();

      var $parent;
      var $radio;

      // Clear selected box
      $boxes.removeClass("selected");

      $parent = $(this).parent().addClass("selected");

      // Show button/radio as checked
      $("input:radio", $c).prop("checked",false);

      $radio = $parent.find("input:radio").prop("checked",true);

      $c.trigger("change", [$radio.val()]);

      if(config.autoSubmitForm) $c.closest('form').submit();
    });
  });

  return this;
};

/* CLM: 55443 - Improve "Operation in Progress" Reporting */
const MESSAGE_DELAY = 3 * 1000;
var progressMessageTimer;
var progressTimeoutTimer;
function addProgressIndicator(message, timeout) {
  message = (message === undefined) ? getLocalized('THIS_MAY_TAKE_SEVERAL_SECONDS') : message;
  timeout = (timeout === undefined) ? 60 : timeout;

  $("body").prepend("<div class=\"loading-indicator-overlay\"></div>");
  $(".loading-indicator-overlay").append("<div class=\"loading-indicator\"></div>");
  $(".loading-indicator-overlay").append("<div class=\"loading-indicator-text\"></div>");

  progressMessageTimer = setTimeout(function() {
    $(".loading-indicator-text").html(message);
  }, MESSAGE_DELAY);

  progressTimeoutTimer = setTimeout(function() {
    removeProgressIndicator();
    jAlert(getLocalized('OPERATION_TIMEOUT'));
  }, timeout * 1000);
}

function removeProgressIndicator() {
  $(".loading-indicator-overlay").remove();
  $(".loading-indicator").remove();
  $(".loading-indicator-text").remove();
  if (progressMessageTimer) {
    clearTimeout(progressMessageTimer);
    progressMessageTimer = undefined;
  }
  if (progressTimeoutTimer) {
    clearTimeout(progressTimeoutTimer);
    progressTimeoutTimer = undefined;
  }
}
/* END CLM: 55443 */
