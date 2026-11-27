/* Mini runtime para las plantillas .dc de YV Propiedades (Preact) */
(function () {
  var h = preact.h;
  var HOLE = /\{\{\s*([^}]+?)\s*\}\}/g;
  var ONLY = /^\s*\{\{\s*([^}]+?)\s*\}\}\s*$/;
  function look(path, sc) {
    path = path.trim();
    if (path === 'true') return true;
    if (path === 'false') return false;
    if (path === 'null') return null;
    if (/^-?\d+(\.\d+)?$/.test(path)) return parseFloat(path);
    if (/^'.*'$|^".*"$/.test(path)) return path.slice(1, -1);
    var parts = path.split('.'), v = sc;
    for (var i = 0; i < parts.length; i++) { if (v == null) return undefined; v = v[parts[i]]; }
    return v;
  }
  function val(str, sc) {
    var m = ONLY.exec(str);
    if (m) return look(m[1], sc);
    return str.replace(HOLE, function (_, p) { var v = look(p, sc); return v == null ? '' : String(v); });
  }
  var REG = {};
  function camel(s) { return s.replace(/-([a-z])/g, function (_, c) { return c.toUpperCase(); }); }
  function kids(nodes, sc) {
    var out = [];
    for (var i = 0; i < nodes.length; i++) {
      var r = build(nodes[i], sc);
      if (r == null) continue;
      if (Array.isArray(r)) out.push.apply(out, r); else out.push(r);
    }
    return out;
  }
  function build(n, sc) {
    if (n.nodeType === 3) return val(n.nodeValue, sc);
    if (n.nodeType !== 1) return null;
    var tag = n.localName;
    if (tag === 'sc-if') return look(ONLY.exec(n.getAttribute('value'))[1], sc) ? kids(n.childNodes, sc) : null;
    if (tag === 'sc-for') {
      var list = look(ONLY.exec(n.getAttribute('list'))[1], sc) || [], as = n.getAttribute('as');
      return list.map(function (it, i) {
        var s2 = Object.create(sc); s2[as] = it; s2.$index = i;
        return h(preact.Fragment, { key: i }, kids(n.childNodes, s2));
      });
    }
    if (tag === 'dc-import') {
      var props = {}, name;
      for (var a = 0; a < n.attributes.length; a++) {
        var at = n.attributes[a];
        if (at.name === 'name') { name = at.value; continue; }
        if (at.name.indexOf('hint-') === 0) continue;
        props[camel(at.name)] = val(at.value, sc);
      }
      return h(REG[name], props);
    }
    var p = {};
    for (var b = 0; b < n.attributes.length; b++) {
      var at2 = n.attributes[b], nm = at2.name, v = val(at2.value, sc);
      if (nm.indexOf('on') === 0) {
        if (typeof v !== 'function') continue;
        if (nm === 'onchange' && (tag === 'input' || tag === 'textarea')) nm = 'oninput';
        p[nm] = v; continue;
      }
      if (nm === 'value' && tag === 'select') { p.value = v; continue; }
      if (v === false || v == null) continue;
      p[nm] = v === true ? '' : v;
    }
    var src = tag === 'template' ? n.content.childNodes : n.childNodes;
    return h(tag, p, kids(src, sc));
  }
  window.DCLogic = function (props) { preact.Component.call(this, props); };
  DCLogic.prototype = Object.create(preact.Component.prototype);
  DCLogic.prototype.constructor = DCLogic;
  DCLogic.prototype.render = function () {
    var tpl = this.constructor.__tpl;
    var r = kids(tpl.content.childNodes, this.renderVals() || {});
    return h(preact.Fragment, null, r);
  };
  window.DC = {
    def: function (name, Cls) {
      Cls.__tpl = document.getElementById('tpl-' + name);
      REG[name] = Cls;
    },
    mount: function (name, el) { preact.render(h(REG[name], {}), el); }
  };
})();
