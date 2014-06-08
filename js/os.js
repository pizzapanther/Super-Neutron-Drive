
if (typeof String.prototype.startsWith != 'function') {
  String.prototype.startsWith = function (str){
    return this.slice(0, str.length) == str;
  };
}

if (typeof String.prototype.endsWith != 'function') {
  String.prototype.endsWith = function (str){
    return this.slice(this.length - str.length) == str;
  };
}

var os = {
  sep: "/",
  basename: function (path) {
    return path.replace( /.*\//, "" );
  },
  
  dirname: function (path) {
    var r = path.replace(/\\/g, '/').replace(/\/[^\/]*\/?$/, '');
    if (path == r) {
      r = null;
    }
    
    return r;
  },
  
  join_path: function () {
    var args = Array.prototype.slice.call(arguments);
    return args.join("/");
  },
  
  extension: function (path) {
    var ext = path.split('.').pop();
    ext = ext.toLowerCase();
    return ext;
  },
  
  rel_path: function (base, shrink) {
    return shrink.replace(base, '');
  }
};
