/**
 * Protect window.console method calls, e.g. console is not defined on IE
 * unless dev tools are open, and IE doesn't define console.debug
 */
(function () {
    if (!window.console) {
        window.console = {};
    }
    // union of Chrome, FF, IE, and Safari console methods
    var m = [
      "log", "info", "warn", "error", "debug", "trace", "dir", "group",
      "groupCollapsed", "groupEnd", "time", "timeEnd", "profile", "profileEnd",
      "dirxml", "assert", "count", "markTimeline", "timeStamp", "clear"
    ];
    // define undefined methods as noops to prevent errors
    for (var i = 0; i < m.length; i++) {
        if (!window.console[m[i]]) {
            window.console[m[i]] = function () { };
        }
    }
})();

var _SCRIPT_LOADED = false;
var MAIN_WIDTH = 0,
    TABLE_WIDTH = 0;

function recalculateMainWidth() {
    MAIN_WIDTH = $('.Center').width() - 30;
    TABLE_WIDTH = MAIN_WIDTH;
}

$(window).resize(function () {
    //console.log('Call to global.js - $(window).resize: recalculateWidthAndHeightVars()');
    recalculateMainWidth();
});

function replaceAll(find, replace, str) {
    return str.replace(new RegExp(find, 'g'), replace);
}

function rangeValidator(field) {

    var text = field.value;

    if (text.length < 3 && text.length > 0) {
        field.value = '';
        field.focus();
        alert('The minimum amount of allowed characters is 3. Please review it.');
        return false;
    }

    return true;
}

function copyValueFrom() {
    $('.copyTo').val($('.copyFrom').val());
    return false;
}

function isNumeric(field) {
    var check = true;
    var value = field.value;
    if (field.value != '') {
        for (var i = 0; i < field.value.length; ++i) {
            var new_key = value.charAt(i); //cycle through characters
            if (((new_key < "0") || (new_key > "9") || (new_key == ",") || (new_key == ".")) &&
                !(new_key == "")) {
                check = false;
                break;
            }
        }
        if (!check) {
            alert('This field only accepts numbers.');
            field.value = '';
            field.focus();
            return;
        }
    }
}

function getCookie(c_name) {
    var c_value = document.cookie;
    var c_start = c_value.indexOf(" " + c_name + "=");
    if (c_start == -1) {
        c_start = c_value.indexOf(c_name + "=");
    }
    if (c_start == -1) {
        c_value = null;
    }
    else {
        c_start = c_value.indexOf("=", c_start) + 1;
        var c_end = c_value.indexOf(";", c_start);
        if (c_end == -1) {
            c_end = c_value.length;
        }
        c_value = unescape(c_value.substring(c_start, c_end));
    }
    return c_value;
}

function logout() {
    /*Production and UAT*/
    $.removeCookie('SMSESSION', { path: '/', domain: '.citigroup.net' });
    $.removeCookie('SMIDENTITY', { path: '/', domain: '.citigroup.net' });

    /*eucsrvappdev002 and eucsrvappuat003*/
    $.removeCookie('SMSESSION', { path: '/', domain: '.nsroot.net' });

    location.reload();
}

function generateAlert(type, text) {
    noty({
        text: text,
        type: type,
        dismissQueue: true,
        layout: 'topCenter',
        theme: 'defaultTheme'
    });
}

function showJSConfirmModal(ptext, okCallbackFunction) {
    noty({
        layout: 'topCenter',
        theme: 'defaultTheme',
        type: 'information',
        text: ptext,
        buttons: [{
            addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                $noty.close();
                okCallbackFunction();
            }
        }, {
            addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                $noty.close();
            }
        }]
    });
}

function showConfirmModal(ptext, pelemento) {
    if ($(pelemento).attr('doPostBack') == '1') {
        return true;
    }
    noty({
        layout: 'topCenter',
        theme: 'defaultTheme',
        type: 'information',
        text: ptext,
        buttons: [{
            addClass: 'btn btn-primary', text: 'Ok', onClick: function ($noty) {
                $noty.close();
                $(pelemento).attr('doPostBack', '1');
                $(pelemento).click();
            }
        }, {
            addClass: 'btn btn-danger', text: 'Cancel', onClick: function ($noty) {
                $noty.close();
            }
        }]
    });
    return false;
}

function callServer(params) {
    if (!params["beforeSend"]) {
        params["beforeSend"] = function () {
            $.showFullLoading();
        }
    }

    if (!params["error"]) {
        params["error"] = function (xhr, textStatus, thrownError) {
            $.hideFullLoading();
            if (xhr['responseText']) {
                $.showAlert({
                    type: 'error',
                    content: xhr['responseText']
                });
            } else {
                $.showAlert({
                    type: 'error',
                    content: thrownError
                });
            }
        }
    }

    if (!params["type"]) {
        params["type"] = "POST"
    }

    $.ajax({
        url: params["url"],
        data: params["data"],
        beforeSend: params["beforeSend"],
        success: params["success"],
        error: params["error"],
        type: params["type"]
    });
}

function createPopup(pconfiguration) {
    var htmlPopup = "";
    htmlPopup += "<div id='contentPopup' style='height: 100%; width: 70%; position: fixed; z-index: 10001; left: 213.5px; top: 30px;'>";
    htmlPopup += "    <table class='popup table-full-width'>";
    htmlPopup += "        <tbody>";
    htmlPopup += "	        <tr>";
    htmlPopup += "		        <td>";
    htmlPopup += "			        <img id='imgBannerTopPopup' src='../App_Themes/Base/images/citi_corp_logo.gif' style='border-width:0px;'>";
    htmlPopup += "		        </td>";
    htmlPopup += "		        <td>";
    htmlPopup += "			        <span id='lblTituloBannerTopPopup' class='titleBig'>" + pconfiguration["title"] + "</span>";
    htmlPopup += "		        </td>";
    htmlPopup += "		        <td align='right'>";
    htmlPopup += "			        <input type='image' onclick='removePopup()' name='btnClosePopup' id='btnClosePopup' title='Return' class='AutoWH' src='../App_Themes/Base/images/close.png' style='border-width:0px;'>";
    htmlPopup += "		        </td>";
    htmlPopup += "	        </tr>";
    htmlPopup += "        </tbody>";
    htmlPopup += "    </table>";
    htmlPopup += "    <div class='popup' style='padding: 10px; height: 100%; max-height: 75%;'>";
    htmlPopup += pconfiguration["body"];
    htmlPopup += "    </div>";
    htmlPopup += "</div>";
    htmlPopup += "<div id='contentPopupBackground' class='popupBackground' style='position: fixed; left: 0px; top: 0px; z-index: 10000; width: 100%; height: 2045px;'></div>";

    $('body').append(htmlPopup);

    if (pconfiguration["onSuccess"]) {
        pconfiguration["onSuccess"]();
    }
}

function removePopup(obj) {
    $("#contentPopup").remove();
    $("#contentPopupBackground").remove();
}

function createFullScreenPopup(pconfiguration) {
    var html =
    '<div id="contentFullScreenPopup" style="position: fixed; left: 10px; top: 10px; right: 10px; z-index: 300;' +
    ' bottom: 10px;" > ' +
    ' <div class="ProgressHolder" style="z-index: 1; filter: alpha(opacity=100); opacity: 1;"> ' +
    ' </div> ' +
    ' <div class="popup-report" style="overflow: hidden; z-index: 2; position: absolute; right: 0px; ' +
    '     left: 0px;"> ' +
    '     <div class="boxContainer"> ' +
    '         <div class="topBorder"> ' +
    '             <div class="topImg"> ' +
    '             </div> ' +
    '             <div class="leftCornerImg"> ' +
    '             </div> ' +
    '             <div class="rightCornerImg"> ' +
    '             </div> ' +
    '         </div> ' +
    '         <div class="boxContainerArea"> ' +
    '             <table class="table-full-width"> ' +
    '                 <tr> ' +
    '                     <td style="width: 60px;"> <img id="imgBannerTopPopup" src="../App_Themes/Base/images/citi_corp_logo.gif" style="height:35px;border-width:0px;">' +
    '                     </td> ' +
    '                     <td> <span id="lblTituloBannerTopPopup" class="titleMedium">' + pconfiguration["title"] + '</span>' +
    '                     </td> ' +
    '                     <td align="right"> <input onclick="removeFullScreenPopup()" type="image" name="btnCloseReportPopup" id="btnCloseReportPopup" title="Return" class="AutoWH" src="../App_Themes/Base/images/close.png" style="height:35px;border-width:0px;">' +
    '                     </td> ' +
    '                 </tr> ' +
    '             </table> ' +
    '         </div> ' +
    '         <div class="bottomBorder"> ' +
    '             <div class="bottomImg"> ' +
    '             </div> ' +
    '             <div class="leftCornerImg"> ' +
    '             </div> ' +
    '             <div class="rightCornerImg"> ' +
    '             </div> ' +
    '         </div> ' +
    '     </div> ' +
    ' </div> ' +
    ' <div class="popup-report" style="max-height: 100%; margin-top: 15px; top: 60px; bottom: 10px; ' +
    '     position: absolute; right: 0px; left: 0px; z-index: 2; border: 1px solid #dedbef;"> ' +
    '     <table class="content-popup"> ' +
    '         <tr> <td><div>' + pconfiguration["body"] + '</div></td> </tr> ' +
    '    </table> ' +
    ' </div> ' +
    '</div> ';

    $('body').append(html);
}

function removeFullScreenPopup(obj) {
    $("#contentFullScreenPopup").remove();
}

function _mergeObject(pobject1, pobject2) {
    var defaultKeys = Object.keys(pobject1);

    $(defaultKeys).each(function (index, value) {
        if (typeof pobject1[value] == 'object') {
            if (typeof pobject2[value] == "undefined") {
                pobject2[value] = pobject1[value];
            } else {
                _mergeObject(pobject1[value], pobject2[value]);
            }
        } else {
            //Si no tiene algun valor lo asignamos y salimos.
            if (typeof pobject2[value] == "undefined") {
                //Si no tiene algun valor lo asignamos y salimos.
                pobject2[value] = pobject1[value];
            }
        }
    });
}

function _addSelectedClassRow(idTable) {
    $("#" + idTable).find("tr").click(function () {
        $("#" + idTable).find(".selected").removeClass("selected");
        $(this).addClass("selected");
    });
}

function _addHoverClassRow(idTable) {
    $("#" + idTable).find("tr").hover(function () {
        $("#" + idTable).find(".selected").removeClass("selected");
        $(this).addClass("selected");
    });
}

//En algunos browser no existe Object.keys
if (!Object.keys) {
    Object.keys = function (obj) {
        var keys = [];

        for (var i in obj) {
            if (obj.hasOwnProperty(i)) {
                keys.push(i);
            }
        }

        return keys;
    };
}