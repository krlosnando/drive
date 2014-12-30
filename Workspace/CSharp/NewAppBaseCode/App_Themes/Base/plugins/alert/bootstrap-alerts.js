/* ==========================================================
* bootstrap-alert.js v2.3.1
* http://twitter.github.com/bootstrap/javascript.html#alerts
* ==========================================================
* Copyright 2012 Twitter, Inc.
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
* ========================================================== */


!function ($) {
    "use strict"; // jshint ;_;

    /* ALERT CLASS DEFINITION
    * ====================== */

    var dismiss = '[data-dismiss="alert"]'
    , Alert = function (el) {
        $(el).on('click', dismiss, this.close)
    };

    Alert.prototype.close = function (e) {
        var $this = $(this)
        , selector = $this.attr('data-target')
        , $parent;

        if (!selector) {
            selector = $this.attr('href');
            selector = selector && selector.replace(/.*(?=#[^\s]*$)/, ''); //strip for ie7
        }

        $parent = $(selector);

        e && e.preventDefault();

        $parent.length || ($parent = $this.hasClass('alert') ? $this : $this.parent());

        $parent.trigger(e = $.Event('close'));

        if (e.isDefaultPrevented()) return;

        $parent.removeClass('in');

        function removeElement() {
            $parent
            .trigger('closed')
            .remove();
        }

        $.support.transition && $parent.hasClass('fade') ?
        $parent.on($.support.transition.end, removeElement) :
        removeElement();
    };


    /* ALERT PLUGIN DEFINITION
    * ======================= */
    var old = $.fn.alert;

    $.fn.alert = function (option) {
        return this.each(function () {
            var $this = $(this)
            , data = $this.data('alert');
            if (!data) $this.data('alert', (data = new Alert(this)));
            if (typeof option == 'string') data[option].call($this);
        });
    };

    $.fn.alert.Constructor = Alert;

    $.showAlert = function (option) {
        //Default Options.
        var defaultOptions = {
            showTo: "#" + $(".boxContainerArea[main='true']").find(':first-child').attr('id'),
            animateScrollTop: true
        };

        //Hacer un merge con las opciones que nos enviaron y las default.
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
        var defaultKeys = Object.keys(defaultOptions);
        $(defaultKeys).each(function (index, value) {
            if (typeof defaultOptions[value] == 'object') {
                var dafaultKeysValue = Object.keys(defaultOptions[value]);

                $(dafaultKeysValue).each(function (iV, propertyValue) {
                    if (option[value]) {
                        if (typeof option[value][propertyValue] == "undefined") {
                            //Si no tiene algun valor lo asignamos y salimos.
                            option[value][propertyValue] = defaultOptions[value][propertyValue];
                        }
                    } else {
                        //Si no tiene algun valor lo asignamos y salimos.
                        option[value] = defaultOptions[value];

                        return false;
                    }
                });
            } else {
                if (typeof option[value] == "undefined") {
                    //Si no tiene algun valor lo asignamos y salimos.
                    option[value] = defaultOptions[value];
                }
            }
        });

        var strAlert =
            '<div id="alert" class="alert alert-block :ptypeAlert fade in" >' +
                '<button type="button" class="close" data-dismiss="alert">×</button>' +
                '<h4 class="alert-heading">:ptitle</h4>' +
                '<p>:pcontent</p>' +
            '</div>',
            className;

        switch (option['type']) {
            //Rojo               
            case 'error':
                className = "alert-error";
                if (!option["title"]) option["title"] = 'Message';
                break;

            //Azul               
            case 'info':
                className = "alert-info";
                if (!option["title"]) option["title"] = 'Message';
                break;

            //Verde               
            case 'success':
                className = "alert-success";
                if (!option["title"]) option["title"] = 'Message';
                break;

            //Amarillo               
            default:
                className = "";
                if (!option["title"]) option["title"] = 'Message';
                break;
        }

        //Crear el mensaje.
        strAlert = strAlert.replace(":ptitle", option["title"] ? option["title"] : 'Alerta');
        strAlert = strAlert.replace(":pcontent", option["content"] ? option["content"] : '[Empty message]');
        strAlert = strAlert.replace(":ptypeAlert", className);

        if (option["showToElTop"]) {
            var $showToElTop = option["showToElTop"];

            //Remover si existe algun mensaje en el elemento.
            $showToElTop.find("#alert").remove();

            //Agregar el mensaje.

            var htmlAlert = $(strAlert).hide();

            $showToElTop.before(htmlAlert);

            htmlAlert.fadeIn(100, function () {
                if (option["onReady"]) {
                    option["onReady"](htmlAlert);
                }
            });
        } else {
            if (option["showTo"]) {

                var $elShowto;

                if (typeof option["showTo"] == "object") {
                    $elShowto = option["showTo"];
                } else {
                    $elShowto = $(option["showTo"]);
                }

                //Remover si existe algun mensaje en el elemento.
                $elShowto.find("#alert").remove();

                //Agregar el mensaje
                var htmlAlert = $(strAlert).hide().prependTo($elShowto);

                htmlAlert.fadeIn(100, function () {
                    if (option["onReady"]) {
                        option["onReady"](htmlAlert);
                    }
                });
            }
        }

        if (option['animateScrollTop'] === true) {
            //Subimos el Scroll de la pagina para mostrar el mensaje.
            $('html, body').animate({
                scrollTop: '0px'
            }, 800);
        }
    };

    /* ALERT NO CONFLICT
    * ================= */

    $.fn.alert.noConflict = function () {
        $.fn.alert = old;
        return this;
    };


    /* ALERT DATA-API
    * ============== */

    $(document).on('click.alert.data-api', dismiss, Alert.prototype.close);

} (window.jQuery);