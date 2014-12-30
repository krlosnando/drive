/**
 * noty - jQuery Notification Plugin v2.1.0
 * Contributors: https://github.com/needim/noty/graphs/contributors
 *
 * Examples and Documentation - http://needim.github.com/noty/
 *
 * Licensed under the MIT licenses:
 * http://www.opensource.org/licenses/mit-license.php
 *
 **/

if (typeof Object.create !== 'function') {
	Object.create = function (o) {
		function F() {
		}

		F.prototype = o;
		return new F();
	};
}

(function ($) {

	var NotyObject = {

		init:function (options) {

			// Mix in the passed in options with the default options
			this.options = $.extend({}, $.noty.defaults, options);

			this.options.layout = (this.options.custom) ? $.noty.layouts['inline'] : $.noty.layouts[this.options.layout];
			this.options.theme = $.noty.themes[this.options.theme];

			delete options.layout;
			delete options.theme;

			this.options = $.extend({}, this.options, this.options.layout.options);
			this.options.id = 'noty_' + (new Date().getTime() * Math.floor(Math.random() * 1000000));

			this.options = $.extend({}, this.options, options);

			// Build the noty dom initial structure
			this._build();

			// return this so we can chain/use the bridge with less code.
			return this;
		}, // end init

		_build:function () {

			// Generating noty bar
			var $bar = $('<div class="noty_bar"></div>').attr('id', this.options.id);
			$bar.append(this.options.template).find('.noty_text').html(this.options.text);

			this.$bar = (this.options.layout.parent.object !== null) ? $(this.options.layout.parent.object).css(this.options.layout.parent.css).append($bar) : $bar;

			// Set buttons if available
			if (this.options.buttons) {

				// If we have button disable closeWith & timeout options
				this.options.closeWith = [];
				this.options.timeout = false;

				var $buttons = $('<div/>').addClass('noty_buttons');

				(this.options.layout.parent.object !== null) ? this.$bar.find('.noty_bar').append($buttons) : this.$bar.append($buttons);

				var self = this;

				$.each(this.options.buttons, function (i, button) {
					var $button = $('<button/>').addClass((button.addClass) ? button.addClass : 'gray').html(button.text)
						.appendTo(self.$bar.find('.noty_buttons'))
						.bind('click', function () {
							if ($.isFunction(button.onClick)) {
								button.onClick.call($button, self);
							}
						});
				});
			}

			// For easy access
			this.$message = this.$bar.find('.noty_message');
			this.$closeButton = this.$bar.find('.noty_close');
			this.$buttons = this.$bar.find('.noty_buttons');

			$.noty.store[this.options.id] = this; // store noty for api

		}, // end _build

		show:function () {

			var self = this;

			$(self.options.layout.container.selector).append(self.$bar);

			self.options.theme.style.apply(self);

			($.type(self.options.layout.css) === 'function') ? this.options.layout.css.apply(self.$bar) : self.$bar.css(this.options.layout.css || {});

			self.$bar.addClass(self.options.layout.addClass);

			self.options.layout.container.style.apply($(self.options.layout.container.selector));

			self.options.theme.callback.onShow.apply(this);

			if ($.inArray('click', self.options.closeWith) > -1)
				//self.$bar.css('cursor', 'pointer');
                self.$bar.find('.notyCloseButton').one('click', function (evt) {
					self.stopPropagation(evt);
					if (self.options.callback.onCloseClick) {
						self.options.callback.onCloseClick.apply(self);
					}
					self.close();
				});

			if ($.inArray('hover', self.options.closeWith) > -1)
				self.$bar.one('mouseenter', function () {
					self.close();
				});

			if ($.inArray('button', self.options.closeWith) > -1)
				self.$closeButton.one('click', function (evt) {
					self.stopPropagation(evt);
					self.close();
				});

			if ($.inArray('button', self.options.closeWith) == -1)
				self.$closeButton.remove();

			if (self.options.callback.onShow)
				self.options.callback.onShow.apply(self);

			self.$bar.animate(
				self.options.animation.open,
				self.options.animation.speed,
				self.options.animation.easing,
				function () {
					if (self.options.callback.afterShow) self.options.callback.afterShow.apply(self);
					self.shown = true;
				});

			// If noty is have a timeout option
			if (self.options.timeout)
				self.$bar.delay(self.options.timeout).promise().done(function () {
					self.close();
				});

			return this;

		}, // end show

		close:function () {

			if (this.closed) return;
			if (this.$bar && this.$bar.hasClass('i-am-closing-now')) return;

			var self = this;

			if (!this.shown) { // If we are still waiting in the queue just delete from queue
				var queue = [];
				$.each($.noty.queue, function (i, n) {
					if (n.options.id != self.options.id) {
						queue.push(n);
					}
				});
				$.noty.queue = queue;
				return;
			}

			self.$bar.addClass('i-am-closing-now');

			if (self.options.callback.onClose) {
				self.options.callback.onClose.apply(self);
			}

			self.$bar.clearQueue().stop().animate(
				self.options.animation.close,
				self.options.animation.speed,
				self.options.animation.easing,
				function () {
					if (self.options.callback.afterClose) self.options.callback.afterClose.apply(self);
				})
				.promise().done(function () {

					// Modal Cleaning
					if (self.options.modal) {
						$.notyRenderer.setModalCount(-1);
						if ($.notyRenderer.getModalCount() == 0) $('.noty_modal').fadeOut('fast', function () {
							$(this).remove();
						});
					}

					// Layout Cleaning
					$.notyRenderer.setLayoutCountFor(self, -1);
					if ($.notyRenderer.getLayoutCountFor(self) == 0) $(self.options.layout.container.selector).remove();

					// Make sure self.$bar has not been removed before attempting to remove it
					if (typeof self.$bar !== 'undefined' && self.$bar !== null ) {
						self.$bar.remove();
						self.$bar = null;
						self.closed = true;
					}

					delete $.noty.store[self.options.id]; // deleting noty from store

					self.options.theme.callback.onClose.apply(self);

					if (!self.options.dismissQueue) {
						// Queue render
						$.noty.ontap = true;

						$.notyRenderer.render();
					}

					if (self.options.maxVisible > 0 && self.options.dismissQueue) {
						$.notyRenderer.render();
					}
				})

		}, // end close

		setText:function (text) {
			if (!this.closed) {
				this.options.text = text;
				this.$bar.find('.noty_text').html(text);
			}
			return this;
		},

		setType:function (type) {
			if (!this.closed) {
				this.options.type = type;
				this.options.theme.style.apply(this);
				this.options.theme.callback.onShow.apply(this);
			}
			return this;
		},

		setTimeout:function (time) {
			if (!this.closed) {
				var self = this;
				this.options.timeout = time;
				self.$bar.delay(self.options.timeout).promise().done(function () {
					self.close();
				});
			}
			return this;
		},

		stopPropagation:function (evt) {
			evt = evt || window.event;
			if (typeof evt.stopPropagation !== "undefined") {
				evt.stopPropagation();
			} else {
				evt.cancelBubble = true;
			}
		},

		closed:false,
		shown:false

	}; // end NotyObject

	$.notyRenderer = {};

	$.notyRenderer.init = function (options) {

		// Renderer creates a new noty
		var notification = Object.create(NotyObject).init(options);

		(notification.options.force) ? $.noty.queue.unshift(notification) : $.noty.queue.push(notification);

		$.notyRenderer.render();

		return ($.noty.returns == 'object') ? notification : notification.options.id;
	};

	$.notyRenderer.render = function () {

		var instance = $.noty.queue[0];

		if ($.type(instance) === 'object') {
			if (instance.options.dismissQueue) {
				if (instance.options.maxVisible > 0) {
					if ($(instance.options.layout.container.selector + ' li').length < instance.options.maxVisible) {
						$.notyRenderer.show($.noty.queue.shift());
					} else {

					}
				} else {
					$.notyRenderer.show($.noty.queue.shift());
				}
			} else {
				if ($.noty.ontap) {
					$.notyRenderer.show($.noty.queue.shift());
					$.noty.ontap = false;
				}
			}
		} else {
			$.noty.ontap = true; // Queue is over
		}

	};

	$.notyRenderer.show = function (notification) {

		if (notification.options.modal) {
			$.notyRenderer.createModalFor(notification);
			$.notyRenderer.setModalCount(+1);
		}

		// Where is the container?
		if ($(notification.options.layout.container.selector).length == 0) {
			if (notification.options.custom) {
				notification.options.custom.append($(notification.options.layout.container.object).addClass('i-am-new'));
			} else {
				$('body').append($(notification.options.layout.container.object).addClass('i-am-new'));
			}
		} else {
			$(notification.options.layout.container.selector).removeClass('i-am-new');
		}

		$.notyRenderer.setLayoutCountFor(notification, +1);

		notification.show();
	};

	$.notyRenderer.createModalFor = function (notification) {
		if ($('.noty_modal').length == 0)
			$('<div/>').addClass('noty_modal').data('noty_modal_count', 0).css(notification.options.theme.modal.css).prependTo($('body')).fadeIn('fast');
	};

	$.notyRenderer.getLayoutCountFor = function (notification) {
		return $(notification.options.layout.container.selector).data('noty_layout_count') || 0;
	};

	$.notyRenderer.setLayoutCountFor = function (notification, arg) {
		return $(notification.options.layout.container.selector).data('noty_layout_count', $.notyRenderer.getLayoutCountFor(notification) + arg);
	};

	$.notyRenderer.getModalCount = function () {
		return $('.noty_modal').data('noty_modal_count') || 0;
	};

	$.notyRenderer.setModalCount = function (arg) {
		return $('.noty_modal').data('noty_modal_count', $.notyRenderer.getModalCount() + arg);
	};

	// This is for custom container
	$.fn.noty = function (options) {
		options.custom = $(this);
		return $.notyRenderer.init(options);
	};

	$.noty = {};
	$.noty.queue = [];
	$.noty.ontap = true;
	$.noty.layouts = {};
	$.noty.themes = {};
	$.noty.returns = 'object';
	$.noty.store = {};

	$.noty.get = function (id) {
		return $.noty.store.hasOwnProperty(id) ? $.noty.store[id] : false;
	};

	$.noty.close = function (id) {
		return $.noty.get(id) ? $.noty.get(id).close() : false;
	};

	$.noty.setText = function (id, text) {
		return $.noty.get(id) ? $.noty.get(id).setText(text) : false;
	};

	$.noty.setType = function (id, type) {
		return $.noty.get(id) ? $.noty.get(id).setType(type) : false;
	};

	$.noty.clearQueue = function () {
		$.noty.queue = [];
	};

	$.noty.closeAll = function () {
		$.noty.clearQueue();
		$.each($.noty.store, function (id, noty) {
			noty.close();
		});
	};

	var windowAlert = window.alert;

	$.noty.consumeAlert = function (options) {
		window.alert = function (text) {
			if (options)
				options.text = text;
			else
				options = {text:text};

			$.notyRenderer.init(options);
		};
	};

	$.noty.stopConsumeAlert = function () {
		window.alert = windowAlert;
	};

	$.noty.defaults = {
		layout:'top',
		theme:'defaultTheme',
		type:'alert',
		text:'',
		dismissQueue:true,
		template:'<div class="noty_message"><div style="text-align:right;cursor: pointer;"><img src="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAABgAAAAYCAYAAADgdz34AAAElElEQVRIS51VbWyTVRR+7tv2Xdut61Y6xExNJvKHH8MZGAxEIEIkARWVBQMsceI2Y4yQ6fyxqZsz0aEgSjTozDBgkYkxDNTEML9FicPBlBk1TqKGzC10H/Rjbd+v67nv227rWmbiTU7a99xzn+ecc885l+E/Fm+plDHPuwrMVgKOhQB3gbFe6MYQ4sZpVt8xOhsEu9omb6v0wu1pIrBaGNwLzgFJskTXQHpxVCF5F1xrZjsP/50NKysBf3n7enB2hLz0obCQzhGoYUydl+iYSUa/oyOk5wpF9yR7IvDqTJIMAt62ZSd5vBey0wZXLnmrkyTBKQikTogIbERit1kRhUPEwztY43sPTSdJI+At995FmyfgySfv6KBGwCI1QrLGnyJJEgWDZGs0s5bjrSnzSQLetLGYG/iNOcltlwuo2ATceo9l9/z27ASNAUv/3QmS4wIcGB+niNSVbPcnp8XWJEFi17q3ZRt7AD6/le+njqaDtt6f/v1MZ/p3GzkhAo2EoE7E++RXussmCXjLHT4ejA8xv99hGjnsQNMMAGH99H0W6HMfZEa0eysQV62Lv3wZyLEtZ3s+O2NGENu1qkqe0A5LRcJ7YsjNAfzXAnUZRZE9VS9tAxJUsTESunweHEHY0Pd53zpTbxKM1SztyOPsQbtZkrSEF26ZKsQBNB7LDprSvrCZuoGqKCpaIpn06ASikUhP3qHepSZBsPqWbg9zrJU9HquBpleN+N53KjtJw3pLr1Ipm+DJs6qKWOjKoDvQV2wSjOwo+zpHYStz84kg23rty+z6R1dn6inDqqJAUyPD7kMX5pkEg7WLPnKOqRsKC7ypETB18M1vZ09R3YqpfQI3KPpEIgHVoV70Hrww3yTor1m496ZgvN7m9cFGYVpjhlZHz+zgqd0d5eY/nQpEFGEsEkaoyPHpdQf615lQ7995/d2b/a4uRXGbhnZikN45lwnecBuhEMSzJwFPsiCSVlpVmVmAYsl6GGdtrLX8yEBzylfveM2N573jrCQuOeG0U+sHfkoneGSJBS58FCG+8UP6flUptYEBJwzohUqs7qvh8o5fIv2TnRxY7X9823z3Hkzk0RAj9ZbHgI21FkjNzVTnOtQ4lSMth5vKVyYn2vus/Q/bgc79MDQdUk4E34fVg8u6hh+mHXX6sPNfqiw6WSxLFbDNsQadIBIlq4mLS5Zi0u8cGrbmNBUI5Ln5y0IIwfhr0+djG74YUn4WpmnTdIkPy7tvLwh47VIJ5CLExxJQUonNvBFTI3oyL5+ako9B0fUr9b3R2tcHFDFLTI9mvge2NXOxtnNZ7otznVIp5lxDHUpWEY0mgY6YeQciO4wanbx308zyEfjwJURVY7D+x3hD+0W9i0wmUv5kPDgixcUuLD662FFd4cNWu8RyITpciEwzSizqVESJeXyMBi/Xfo3wj6vPagd6QvhmOni2CFLE5B5uWFGA0qYF0ppFBazC7+ALaJz7hIFm8Oiohj9+D+Pc/j+NU8cGcZ7UA2JrZiazRTDdhsoFlCcUkdAzB8qHuQRQmEQ8yP+QxGcCz5aiq9n+L/2/LC+iKPC2UEAAAAAASUVORK5CYII=" id="notyCloseButton" class="notyCloseButton"/></div><span class="noty_text"></span><div class="noty_close"></div></div>',
		animation:{
			open:{height:'toggle'},
			close:{height:'toggle'},
			easing:'swing',
			speed:500
		},
		timeout:false,
		force:false,
		modal:false,
		maxVisible:5,
		closeWith:['click'],
		callback:{
			onShow:function () {
			},
			afterShow:function () {
			},
			onClose:function () {
			},
			afterClose:function () {
			},
			onCloseClick:function () {
			}
		},
		buttons:false
	};

	$(window).resize(function () {
		$.each($.noty.layouts, function (index, layout) {
			layout.container.style.apply($(layout.container.selector));
		});
	});

})(jQuery);

// Helpers
window.noty = function noty(options) {

	// This is for BC  -  Will be deleted on v2.2.0
	var using_old = 0
		, old_to_new = {
			'animateOpen':'animation.open',
			'animateClose':'animation.close',
			'easing':'animation.easing',
			'speed':'animation.speed',
			'onShow':'callback.onShow',
			'onShown':'callback.afterShow',
			'onClose':'callback.onClose',
			'onCloseClick':'callback.onCloseClick',
			'onClosed':'callback.afterClose'
		};

	jQuery.each(options, function (key, value) {
		if (old_to_new[key]) {
			using_old++;
			var _new = old_to_new[key].split('.');

			if (!options[_new[0]]) options[_new[0]] = {};

			options[_new[0]][_new[1]] = (value) ? value : function () {
			};
			delete options[key];
		}
	});

	if (!options.closeWith) {
		options.closeWith = jQuery.noty.defaults.closeWith;
	}

	if (options.hasOwnProperty('closeButton')) {
		using_old++;
		if (options.closeButton) options.closeWith.push('button');
		delete options.closeButton;
	}

	if (options.hasOwnProperty('closeOnSelfClick')) {
		using_old++;
		if (options.closeOnSelfClick) options.closeWith.push('click');
		delete options.closeOnSelfClick;
	}

	if (options.hasOwnProperty('closeOnSelfOver')) {
		using_old++;
		if (options.closeOnSelfOver) options.closeWith.push('hover');
		delete options.closeOnSelfOver;
	}

	if (options.hasOwnProperty('custom')) {
		using_old++;
		if (options.custom.container != 'null') options.custom = options.custom.container;
	}

	if (options.hasOwnProperty('cssPrefix')) {
		using_old++;
		delete options.cssPrefix;
	}

	if (options.theme == 'noty_theme_default') {
		using_old++;
		options.theme = 'defaultTheme';
	}

	if (!options.hasOwnProperty('dismissQueue')) {
		options.dismissQueue = jQuery.noty.defaults.dismissQueue;
	}

	if (!options.hasOwnProperty('maxVisible')) {
		options.maxVisible = jQuery.noty.defaults.maxVisible;
	}

	if (options.buttons) {
		jQuery.each(options.buttons, function (i, button) {
			if (button.click) {
				using_old++;
				button.onClick = button.click;
				delete button.click;
			}
			if (button.type) {
				using_old++;
				button.addClass = button.type;
				delete button.type;
			}
		});
	}

	if (using_old) {
		if (typeof console !== "undefined" && console.warn) {
			console.warn('You are using noty v2 with v1.x.x options. @deprecated until v2.2.0 - Please update your options.');
		}
	}

	// console.log(options);
	// End of the BC

	return jQuery.notyRenderer.init(options);
}