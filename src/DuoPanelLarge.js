var compose = require('ksf/utils/compose');
var _ContentDelegate = require('absolute/_ContentDelegate');
var HFlex = require('absolute/HFlex');

var delegateGetSet = require('absolute/utils/delegateGetSet');
var Full = require('absolute/layout/Full');
var Elmt = require('absolute/Element');

var ParentContainer = compose(function() {
	this.element = this._container = new Elmt().style({
		transform: 'translateZ(0)',
		overflow: 'hidden'
	});

	this._hLayout = new Full('horizontal').content([this._container]);
	this._vLayout = new Full('vertical').content([this._container]);
}, {
	content: function(content) {
		if (arguments.length) {
			if (this._content) {
				this._content.parentNode(null);
				this._vLayout.remove('content');
				this._content = null;
			}
			if (content) {
				this._content = content.parentNode(this._container.domNode).containerVisible(true).top(0).zIndex(0);
				this._vLayout.add('content', content);
			}
		} else {
			return this._content;
		}
		return this;
	},
	parentNode: delegateGetSet('_container', 'parentNode'),
	left: delegateGetSet('_container', 'left'),
	top: delegateGetSet('_container', 'top'),
	zIndex: delegateGetSet('_container', 'zIndex'),
	width: delegateGetSet('_hLayout', 'size'),
	height: delegateGetSet('_vLayout', 'size'),
	depth: delegateGetSet('_container', 'depth'),
	visible: delegateGetSet('_container', 'visible'),
	containerVisible: delegateGetSet('_container', 'containerVisible'),
});

module.exports = compose(_ContentDelegate, function(args) {
  this._panel = args.panel;
  this._main = args.main;
  this._options = {
    panelMaxWidth: args.options && args.options.panelMaxWidth || 400,
    panelPosition: args.options && args.options.panelPosition || 'left',
  };

	var flexArg = [this._main],
		panel = [this._panelContainer = new ParentContainer().content(this._panel.width(this._options.panelMaxWidth).left(0)).width(this._options.panelMaxWidth), 'fixed'];
	if (this._options.panelPosition === 'left') {
		flexArg.unshift(panel);
	} else {
		flexArg.push(panel);
	}

  this._content = new ParentContainer().content(this._hflex = new HFlex(flexArg).left(0));
/*
	var prevX;
	this._panelContainer.element.on('touchstart', function(event) {
		event.stopPropagation();
		prevX = event.touches[0].pageX;

		var ontouchmove, ontouchend;
		this._panelContainer.element.on('touchmove', ontouchmove = function(event) {
			var deltaX = event.touches[0].pageX - prevX;

			this._positionPanel(this._panelSlideX + (this._options.panelPosition === 'left' ? -1 : 1) * deltaX);
			event.stopPropagation();
			prevX = event.touches[0].pageX;
		}.bind(this));
		this._panelContainer.element.on('touchend', ontouchend = function() {
			this._panelContainer.element.off('touchmove', ontouchmove);
			this._panelContainer.element.off('touchend', ontouchend);
		}.bind(this));
	}.bind(this));

	// left-border swipe
	var onfirsttouchmove,
		swipableBorderWidth = 5;
	document.addEventListener('touchmove', onfirsttouchmove = function(event) {
		var elmtBBox = this._content.element.domNode.getBoundingClientRect();
		var eventClientX = event.touches[0].clientX;
		var eventClientY = event.touches[0].clientY;
		if (elmtBBox.top < eventClientY && eventClientY < elmtBBox.top + this.height() &&
				(this._options.panelPosition === 'left') ?
					elmtBBox.left < eventClientX && eventClientX < elmtBBox.left + swipableBorderWidth:
					elmtBBox.left + this.width() - swipableBorderWidth < eventClientX && eventClientX < elmtBBox.left + this.width()) {
			prevX = event.touches[0].pageX;

			document.removeEventListener('touchmove', onfirsttouchmove, true);
			event.stopPropagation();

			var ontouchmove, ontouchend;
			document.addEventListener('touchmove', ontouchmove = function(event) {
				var deltaX = event.touches[0].pageX - prevX;

				this._positionPanel(this._panelSlideX + (this._options.panelPosition === 'left' ? -1 : 1) * deltaX);
				event.stopPropagation();
				prevX = event.touches[0].pageX;
			}.bind(this), true);
			document.addEventListener('touchend', ontouchend = function() {
				document.removeEventListener('touchmove', ontouchmove, true);
				document.removeEventListener('touchend', ontouchend, true);
				// reinit
				document.addEventListener('touchmove', onfirsttouchmove, true);
			}.bind(this), true);
		}
	}.bind(this), true);
*/
	// open state
  this._panelSlideX = 0;
}, {
  _layout: function() {
    this._hflex
			.width(this._width + this._panelSlideX);
		if (this._options.panelPosition === 'left') {
			this._hflex.left(-this._panelSlideX);
		}
  },

  width: function(width) {
    if (arguments.length) {
      this._width = width;
			this._content.width(width);
      this._layout();
      return this;
    } else {
      return this._width;
    }
  },

  _positionPanel: function(pos) {
    this._panelSlideX = Math.max(0, Math.min(pos, this._options.panelMaxWidth));
    this._layout();
  },

	slidePanel: function(open) {
		this._positionPanel(open ? 0 : this._options.panelMaxWidth);
	},

  isPanelOpen: function() {
    return this._panelSlideX === 0;
  }
});
