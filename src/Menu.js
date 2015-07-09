var compose = require('ksf/utils/compose');
var _ContentDelegate = require('absolute/_ContentDelegate');
var VFlex = require('absolute/VFlex');
var HFlex = require('absolute/HFlex');
var VPile = require('absolute/VPile');
var VScroll = require('absolute/VScroll');
var Margin = require('absolute/Margin');
var Button = require('absolute/Button');
var Reactive = require('absolute/Reactive');
var Background = require('absolute/Background');
var Space = require('absolute/Space');
var Switch = require('absolute/Switch');

var Value = require('ksf/observable/Value');

/**
@params args {
	request
	message
	onDisplayModel
}
*/
module.exports = compose(_ContentDelegate, function(args) {
	this._content = new Switch();

	displayMenu(null, this._content, args.message, args.request, null, args.onDisplayModel);
});

function displayMenu (menuItemId, container, message, request, previous, onAction) {
	message.value('loading...');
	request({
		"method":"model.ir.ui.menu.search",
		"params":[
			[["parent","=",menuItemId]],
			0,
			1000,
			null,
		]
	}).then(function(res) {
		var menuContainer = new VPile();
		var menuPage = new Margin(new VScroll(menuContainer), 10);
		container.content(menuPage);
		if (menuItemId !== null) {
			menuContainer.add('back', new Button().value('<-').height(60).onAction(function() {
				container.content(previous);
			}));
		}
		res.forEach(function(childMenuItemId) {
			var menuItemLabel = new Value(childMenuItemId+'');
			var menuItem = new HFlex([
				[new Button().width(30).value('+').onAction(function() {
					displayMenu(childMenuItemId, container, message, request, menuPage, onAction);
				}), 'fixed'],
				new VFlex([
					new Reactive({
						value: menuItemLabel,
						content: new Button().color('transparent').value(childMenuItemId+'').onAction(function() {
							message.value("looking for list view...");
							request({
								"method":"model.ir.action.keyword.get_keyword",
								"params":[
									"tree_open",
									["ir.ui.menu", childMenuItemId]
								]
							}).then(function(res) {
								if (res.length) {
									message.value('');
									var views = res[0].views;
									var viewId;
									var formViewId;							
									for (var i=0; i<views.length; i++) {
										var view = views[i];
										if (view[1] === 'tree') {
											viewId = view[0];
										}
										if (view[1] === 'form') {
											formViewId = view[0];
										}
									}
									var modelId = res[0]["res_model"];
									onAction(modelId, viewId, formViewId);
								} else {
									message.value('no list view');
								}
							}, function(err) {
								message.value("error");
								console.log("erreur lors de la recherche d'une vue de type liste pour le menu", childMenuItemId, err);
							}).done();
						})
					}),
					[new Background(new Space()).height(1).color('#eee'), 'fixed']
				]),
			]).height(60);
			menuContainer.add(childMenuItemId+'', menuItem);
			request({
				"method":"model.ir.ui.menu.read",
				"params":[
					[childMenuItemId],
					["childs", "name", "parent", "favorite", "active", "icon", "parent.rec_name", "rec_name", "_timestamp"],
				]
			}).then(function(res) {
				menuItemLabel.value(res[0].name);
			}, function() {
				console.log("error retreiving label for", childMenuItemId);
			});
		});
		message.value('done');
	}, function(err) {
		message.value("erreur");
		console.log("erreur", err);
	}).done();
}