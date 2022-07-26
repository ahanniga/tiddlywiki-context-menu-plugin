/*\
title: $:/plugins/ahanniga/context-menu/ContextListener.js
type: application/javascript
module-type: widget

This widgets implements context menus to tiddlers
\*/

(function () {

  var htmlToElement = function (html) {
    var template = document.createElement('template');
    html = html.trim();
    template.innerHTML = html;
    return template.content.firstChild;
  }

  var Widget = require("$:/core/modules/widgets/widget.js").widget;
  var template = `<div id="contextMenu" class="context-menu" style="display: none; z-order: 9999;"></div>`;

  var ContextListener = function (parseTreeNode, options) {
    this.initialise(parseTreeNode, options);
  };

  ContextListener.prototype = new Widget();

  ContextListener.prototype.render = function (parent, nextSibling) {
    this.parentDomNode = parent;
    this.execute();
    var self = this;
    parent.addEventListener("contextmenu", function (event) { self.contextmenu.call(self, event) });
    document.onclick = this.hideMenu;
  };

  ContextListener.prototype.contextmenu = function (event) {
    var self = this;
    event.preventDefault();
    var menu = document.getElementById("contextMenu");

    if (menu == null) {
      this.document.body.appendChild(htmlToElement(template));
      menu = document.getElementById("contextMenu");
      menu.addEventListener("click", function (event) { self.menuClicked.call(self, event) });
    }
    menu.innerHTML = "";

    var contextMenuOptions = $tw.wiki.getTiddlerText("$:/plugins/ahanniga/context-menu/options");
    var menuHtml = ["<ul>"];
    var options = JSON.parse(contextMenuOptions)["context-menu"];
    for (var index = 0; index < options.length; index++) {
      var icon = $tw.wiki.getTiddlerText(options[index].icon);
      var tid = event.currentTarget.getAttribute("data-tiddler-title");
      menuHtml.push(`<li><a action="${options[index].action}" id="action-${index}" tid="${tid}" href="">${icon} ${options[index].name}</a></li>`);
    }
    menuHtml.push("</ul>");
    menu.append(htmlToElement(menuHtml.join("")))

    if (menu.style.display == "block") {
      this.hideMenu();
    } else {
      menu.style.display = 'block';
      menu.style.left = event.pageX + "px";
      menu.style.top = event.pageY + "px";
    }

    return false;
  };

  ContextListener.prototype.menuClicked = function (event) {
    var action = event.target.getAttribute("action");
    var tid = event.target.getAttribute("tid");
    var stid, state, text;
    event.preventDefault();

    switch (action) {
      case "tm-fold-tiddler":
        stid = `$:/state/folded/${tid}`;
        state = $tw.wiki.getTiddlerText(stid, "show") === "show" ? "hide" : "show";
        $tw.wiki.setText(stid, "text", null, state);
        break;
      case "tm-copy-to-clipboard":
        text = $tw.wiki.getTiddlerText(tid);
        this.dispatchEvent({ type: action, param: text });
        break;

      default:
        this.dispatchEvent({ type: action, param: tid });
    }

    return false;
  };

  ContextListener.prototype.execute = function () {
  };

  ContextListener.prototype.refresh = function (changedTiddlers) {
    return false;
  };

  ContextListener.prototype.hideMenu = function () {
    var menu = document.getElementById("contextMenu");
    if (menu != null) {
      menu.style.display = "none";
    }
  };

  exports.contextMenu = ContextListener;

})();
