/*
 * name: MagicTabs
 * author: Mac_J
 * modify: Pauli Wu
 * version: 1.3.3
 */

(function () {
	$.extend($.fn, {
		tabs : function (cfg) {
			var self = this;
			cfg = self.config = $.extend({
				speed : 6,
				tabHeight : 26,
				hbarHeight : 2
			}, cfg);
			var th = cfg.tabHeight;
			var bh = th + cfg.hbarHeight;
			var hl = $('<div class="sbtn left"></div>');
			var hr = hl.width(th).height(th).clone().removeClass('left').addClass('right');
			var hm = $('<div class="main"></div>').height(th);
			var ht = $('<div class="tt"></div>').height(th);
			var hb = $('<div class="hbar"></div>').height(cfg.hbarHeight).css('top', th);
			var hd = $('<div class="head"></div>').height(th);
			self.append(hb).append(hd);
			hd.append(hl).append(hm.append(ht)).append(hr);
			var bd = $('<div class="body"></div>').appendTo(self);
			self.adjust = function() {
				var h = bd.height();
				if(!h) {
					h = self.height() - bh;
					bd.height(h);
				}
				bd.children('.main').each(function(n, c) {
					var ec = $(c), x = ec.attr('height');
					ec.height(x ? (x == 'auto' ? null : x) : h);
				})
				if (hd.width()) {
					var b = hd.width()<=ht.width();
					hl.toggle(b);
					hr.toggle(b);
					hm.width(hd.width() - 2 - (b ? hl.width() * 2 + 2 : 0));
				}
			}
			function closeTab(a, b, c) {
				if (!a.hasClass('closeable'))
					return;
				c = c || a.attr('name');
				b = b || bd.seek(c);
				if (cfg.onCloseTab && !cfg.onCloseTab(self, c, a))
					return false;
				var s = a.next('.item');
				if (s.length != 1)
					s = a.prev('.item');
				var t = self.selected, t = (t ? t.attr('name') : '');
				if (c == t && s.length == 1)
					s.click();
				a.hide();
				b.hide();
				window.setTimeout(function() {
					a.remove();
					b.remove();
					if (cfg.onTabClosed)
						cfg.onTabClosed(self, c, a);
				}, 0);
				self.adjust();
			}
			self.closeTab = function(c, a) {
				closeTab(a || hd.seek(c), 0, c);
			}
			self.closeTabs = function(x) {
				hd.find('.item').each(function(n, a) {
					var o = $(a), c = o.attr('name');
					if (c != x)
						closeTab(o);
				});
			}
			self.addTab = function(p, n, cb) {
				var k = p.code || 'm' + n;
				var a = hd.seek(k), b;
				if (p.update && a.length > 0) {
					self.select(k);
					b = bd.seek(k);
					b.empty();
				} else {
					a = $('<div class="item normal" name="' + k + '"></div>');
					b = $('<div class="main" name="' + k + '"></div>');
					if (p.bodyCls)
						b.addClass(p.bodyCls);
					if (p.height)
						b.attr('height', p.height);
					ht.append(a.height(th));
					self.adjust();
					var m = $('<div class="main"></div>');
					m.append(p.title);
					var bw = 0;// xbtn width
					a.append(m);
					if (p.closeable) {
						var w = $('<div class="xbtn"></div>');
						w.click(function() {
							closeTab(a, b, k);
							return false;
						});
						a.addClass('closeable').append(w);
						bw = w.width();
					}
					if (cfg.tabWidth)
						m.width(cfg.tabWidth - bw);
					bd.append(b);
				}
				a.unbind('click');
				a.click(function() {
					if (self.selected) {
						bd.seek(self.selected.removeClass("selected").attr('name')).hide();
					}
					self.selected = a.addClass("selected");
					if (p.url && !b.html() && !p.autoLoad) {
						b.load(p.url, p.params, function() {
							if (cfg.onLoadPage)
								cfg.onLoadPage(self, a, b, p);
						});
					}
					var h = b.attr('height');
					if (!h) {
						bd.height(self.height() - hd.height() - 4);
					} else if (h == 'auto') {
						bd.css('height', h);
					} else {
						bd.css('overflow', 'hidden');
						bd.height(h);
					}
					b.show();
					if (cfg.onShowTab)
						cfg.onShowTab(self, a, b, p);
				});
				if (p.el) {
					b.append(p.el)
				} else if (p.url && p.autoLoad) {
					b.load(p.url, p.params, function() {
						if (cfg.onLoadPage)
							cfg.onLoadPage(self, a, b, p);
					});
				}
				if (cb)
					cb(a, b, p);
				self.adjust();
				self.scroll(a);
				return a;
			}
			$.each(cfg.items, function(n, p) {
				self.addTab(p, n);
			});
			self.hscroll = function() {
				var s = cfg.speed * ($(this).hasClass('left') ? -1 : 1);
				$(document).mouseup(function() {
					window.clearInterval(self.timer);
				});
				self.timer = window.setInterval(function() {
					hm.scrollLeft(hm.scrollLeft() + s);
				}, 20);
				return self.timer;
			};
			hl.mousedown(self.hscroll);
			hr.mousedown(self.hscroll);
			self.adjust();
			self.scroll = function(a) {
				var al = a.position().left;
				var pl = hm.position().left;
				if (al < pl || al + a.width() > pl + hm.width())
					hm.scrollLeft(hm.scrollLeft() + al - pl);
				return self;
			}
			function select(a, c) {
				a.click();
				self.scroll(a);
				return a;
			}
			self.selectFirst = function() {
				var a = hd.find('.item:first');
				return select(a, a.attr('name'));
			}
			self.select = function(c) {
				return select(hd.seek(c), c);
			}

			//for mousewheel plugin included
			if ($.fn.mousewheel) {
				var thd = self.children('.head'), thm = thd.children('.main');
				thd.mousewheel(function(e, delta, deltaX, deltaY){
					thm.scrollLeft(thm.scrollLeft() - deltaY * 40);
					return false;
				});
			}

			return self;
		},
		seek : function (name) {
			return $(this).find("[name=" + name + "]")
		}
	})
})(jQuery)