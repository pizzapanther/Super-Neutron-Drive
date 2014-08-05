var MODE_CATS = {
  P: 'Programming',
  S: 'Scripting',
  M: 'Markup/Template',
  Q: 'Query/Data',
  O: 'Other'
};

var MODE_CAT_MAP = {};
MODE_CAT_MAP[MODE_CATS.P] = 0;
MODE_CAT_MAP[MODE_CATS.S] = 1;
MODE_CAT_MAP[MODE_CATS.M] = 2;
MODE_CAT_MAP[MODE_CATS.Q] = 3;
MODE_CAT_MAP[MODE_CATS.O] = 4;

var MODES = {
  "abap": {
    name: 'ABAP',
    ext: ['abap'],
    cat: MODE_CATS.P
  },
  
  "actionscript": {
    name: 'ActionScript',
    ext: ['as'],
    cat: MODE_CATS.S
  },
  
  "ada": {
    name: 'ADA',
    ext: ['ada', 'adb', 'ads'],
    cat: MODE_CATS.P
  },
  
  "apache_conf": {
    name: 'Apache Conf',
    ext: ['conf'],
    cat: MODE_CATS.Q
  },
  
  "asciidoc": {
    name: 'AsciiDoc',
    ext: ['asciidoc'],
    cat: MODE_CATS.M
  },
  
  "assembly_x86": {
    name: 'Assembly x86',
    ext: ['asm'],
    cat: MODE_CATS.P
  },
  
  "autohotkey": {
    name: 'AutoHotKey',
    ext: ['ahk'],
    cat: MODE_CATS.S
  },
  
  "batchfile": {
    name: 'Batch File',
    ext: ['bat'],
    cat: MODE_CATS.S
  },
  
  "c_cpp": {
    name: 'C/C++',
    ext: ['c', 'cpp', 'h', 'hpp', 'cc'],
    cat: MODE_CATS.P
  },
  
  "cirru": {
    name: 'Cirru',
    ext: ['cirru'],
    cat: MODE_CATS.S
  },
  
  "clojure": {
    name: 'Clojure',
    ext: ['clj'],
    cat: MODE_CATS.P
  },
  
  "cobol": {
    name: 'Cobol',
    ext: ['cob', 'cbl', 'ccp', 'cb2'],
    cat: MODE_CATS.P
  },
  
  "coffee": {
    name: 'Coffee Script',
    ext: ['cof', 'coffee'],
    cat: MODE_CATS.S
  },
  
  "coldfusion": {
    name: 'Cold Fusion',
    ext: ['cfm', 'cfc', 'cfml'],
    cat: MODE_CATS.S
  },
  
  "csharp": {
    name: 'C#',
    ext: ['cs'],
    cat: MODE_CATS.P
  },
  
  "css": {
    name: 'CSS',
    ext: ['css'],
    cat: MODE_CATS.O
  },
  
  "curly": {
    name: 'Curly',
    ext: ['curly'],
    cat: MODE_CATS.M
  },
  
  "dart": {
    name: 'Dart',
    ext: ['dart'],
    cat: MODE_CATS.S
  },
  
  "diff": {
    name: 'Diff',
    ext: ['diff'],
    cat: MODE_CATS.Q
  },
  
  "django": {
    name: 'Django Template',
    ext: ['djt', 'djhtml', 'dt'],
    cat: MODE_CATS.M
  },
  
  "d": {
    name: 'D',
    ext: ['d'],
    cat: MODE_CATS.P
  },
  
  "dot": {
    name: 'Dot',
    ext: ['dot'],
    cat: MODE_CATS.O
  },
  
  "ejs": {
    name: 'Embedded JS',
    ext: ['ejs'],
    cat: MODE_CATS.M
  },
  
  "erlang": {
    name: 'Erlang',
    ext: ['erl'],
    cat: MODE_CATS.P
  },
  
  "forth": {
    name: 'Forth',
    ext: ['frt'],
    cat: MODE_CATS.P
  },
  
  "ftl": {
    name: 'FreeMarker',
    ext: ['ftl'],
    cat: MODE_CATS.M
  },
  
  "gherkin": {
    name: 'Gherkin',
    ext: ['feature'],
    cat: MODE_CATS.S
  },
  
  "glsl": {
    name: 'GLSL',
    ext: ['glsl'],
    cat: MODE_CATS.O
  },
  
  "golang": {
    name: 'Go',
    ext: ['go'],
    cat: MODE_CATS.P
  },
  
  "groovy": {
    name: 'Groovy',
    ext: ['groovy'],
    cat: MODE_CATS.P
  },
  
  "haml": {
    name: 'Haml',
    ext: ['haml'],
    cat: MODE_CATS.M
  },
  
  "handlebars": {
    name: 'Handlebars',
    ext: ['hbs', 'handlebars'],
    cat: MODE_CATS.M
  },
  
  "haskell": {
    name: 'Haskell',
    ext: ['hs'],
    cat: MODE_CATS.P
  },
  
  "haxe": {
    name: 'Haxe',
    ext: ['hx'],
    cat: MODE_CATS.P
  },
  
  "html_completions": {
    name: 'HTML Completions',
    ext: [],
    cat: MODE_CATS.M
  },
  
  "html": {
    name: 'HTML',
    ext: ['htm', 'html'],
    cat: MODE_CATS.M
  },
  
  "html_ruby": {
    name: 'Ruby HTML',
    ext: ['erb'],
    cat: MODE_CATS.M
  },
  
  "ini": {
    name: 'INI',
    ext: ['ini'],
    cat: MODE_CATS.Q
  },
  
  "jack": {
    name: 'Jack',
    ext: ['jk', 'jack'],
    cat: MODE_CATS.S
  },
  
  "jade": {
    name: 'Jade',
    ext: ['jade'],
    cat: MODE_CATS.M
  },
  
  "java": {
    name: 'Java',
    ext: ['java', 'class'],
    cat: MODE_CATS.P
  },
  
  "javascript": {
    name: 'Javascript',
    ext: ['js', 'gs', 'javascript'],
    cat: MODE_CATS.S
  },
  
  "jsoniq": {
    name: 'JSONiq',
    ext: ['jsoniq'],
    cat: MODE_CATS.Q
  },
  
  "json": {
    name: 'JSON',
    ext: ['json'],
    cat: MODE_CATS.Q
  },
  
  "jsp": {
    name: 'JSP',
    ext: ['jsp'],
    cat: MODE_CATS.S
  },
  
  "jsx": {
    name: 'JSX',
    ext: ['jsx'],
    cat: MODE_CATS.S
  },
  
  "julia": {
    name: 'Julia',
    ext: ['jl'],
    cat: MODE_CATS.P
  },
  
  "latex": {
    name: 'Latex',
    ext: ['latex'],
    cat: MODE_CATS.M
  },
  
  "less": {
    name: 'Less',
    ext: ['less'],
    cat: MODE_CATS.O
  },
  
  "liquid": {
    name: 'Liquid Markup',
    ext: ['liquid'],
    cat: MODE_CATS.M
  },
  
  "lisp": {
    name: 'Lisp',
    ext: ['lisp'],
    cat: MODE_CATS.P
  },
  
  "livescript": {
    name: 'LiveScript',
    ext: ['ls'],
    cat: MODE_CATS.S
  },
  
  "logiql": {
    name: 'LogiQL',
    ext: ['logic', 'logiql'],
    cat: MODE_CATS.Q
  },
  
  "lsl": {
    name: 'LSL',
    ext: ['lsl'],
    cat: MODE_CATS.S
  },
  
  "lua": {
    name: 'Lua',
    ext: ['lua'],
    cat: MODE_CATS.S
  },
  
  "luapage": {
    name: 'Lua Page',
    ext: ['lp'],
    cat: MODE_CATS.M
  },
  
  "lucene": {
    name: 'Lucene',
    ext: ['lucene'],
    cat: MODE_CATS.Q
  },
  
  "makefile": {
    name: 'Make File',
    ext: ['make', 'makefile', 'mak'],
    cat: MODE_CATS.S
  },
  
  "markdown": {
    name: 'Markdown',
    ext: ['md'],
    cat: MODE_CATS.M
  },
  
  "matlab": {
    name: 'Matlab',
    ext: ['mat'],
    cat: MODE_CATS.O
  },
  
  "mel": {
    name: 'Maya Embedded Language',
    ext: ['mel'],
    cat: MODE_CATS.S
  },
  
  "mushcode_high_rules": {
    name: 'TinyMUSH High Rules',
    ext: [],
    cat: MODE_CATS.O
  },
  
  "mushcode": {
    name: 'TinyMUSH',
    ext: ['mc', 'mush'],
    cat: MODE_CATS.O
  },
  
  "mysql": {
    name: 'MySQL',
    ext: ['mysql'],
    cat: MODE_CATS.Q
  },
  
  "nix": {
    name: 'Nix',
    ext: ['nix'],
    cat: MODE_CATS.S
  },
  
  "objectivec": {
    name: 'Objective-C',
    ext: ['m', 'mm'],
    cat: MODE_CATS.P
  },
  
  "ocaml": {
    name: 'OCaml',
    ext: ['ml', 'mli', 'mll'],
    cat: MODE_CATS.P
  },
  
  "pascal": {
    name: 'Pascal',
    ext: ['pas'],
    cat: MODE_CATS.P
  },
  
  "perl": {
    name: 'Perl',
    ext: ['pl', 'pm'],
    cat: MODE_CATS.S
  },
  
  "pgsql": {
    name: 'PostgreSQL',
    ext: ['pgsql'],
    cat: MODE_CATS.Q
  },
  
  "php": {
    name: 'PHP',
    ext: ['php', 'inc'],
    cat: MODE_CATS.S
  },
  
  "plain_text": {
    name: 'Text',
    ext: ['text', 'txt', 'readme', 'log'],
    cat: MODE_CATS.O
  },
  
  "powershell": {
    name: 'PowerShell',
    ext: ['ps1', 'psm1'],
    cat: MODE_CATS.S
  },
  
  "prolog": {
    name: 'Prolog',
    ext: ['pro', 'p', 'plg'],
    cat: MODE_CATS.P
  },
  
  "properties": {
    name: 'Properties',
    ext: ['properties'],
    cat: MODE_CATS.Q
  },
  
  "protobuf": {
    name: 'Protobuf',
    ext: ['proto'],
    cat: MODE_CATS.Q
  },
  
  "python": {
    name: 'Python',
    ext: ['py'],
    cat: MODE_CATS.S
  },
  
  "rdoc": {
    name: 'RDoc',
    ext: ['rdoc', 'rd'],
    cat: MODE_CATS.M
  },
  
  "rhtml": {
    name: 'RHTML',
    ext: ['rhtml'],
    cat: MODE_CATS.M
  },
  
  "r": {
    name: 'R',
    ext: ['r'],
    cat: MODE_CATS.Q
  },
  
  "ruby": {
    name: 'Ruby',
    ext: ['rb', 'rbx'],
    cat: MODE_CATS.S
  },
  
  "rust": {
    name: 'Rust',
    ext: ['rs'],
    cat: MODE_CATS.P
  },
  
  "sass": {
    name: 'Sass',
    ext: ['sass'],
    cat: MODE_CATS.O
  },
  
  "scad": {
    name: 'Scad',
    ext: ['scad'],
    cat: MODE_CATS.O
  },
  
  "scala": {
    name: 'Scala',
    ext: ['scala'],
    cat: MODE_CATS.P
  },
  
  "scheme": {
    name: 'Scheme',
    ext: ['scm', 'ss'],
    cat: MODE_CATS.P
  },
  
  "scss": {
    name: 'SCSS',
    ext: ['scss'],
    cat: MODE_CATS.O
  },
  
  "sh": {
    name: 'Shell',
    ext: ['sh'],
    cat: MODE_CATS.S
  },
  
  "sjs": {
    name: 'Sugar JS',
    ext: ['sjs'],
    cat: MODE_CATS.S
  },
  
  "smarty": {
    name: 'Smarty',
    ext: ['smarty'],
    cat: MODE_CATS.M
  },
  
  "snippets": {
    name: 'Snippets',
    ext: ['snippets'],
    cat: MODE_CATS.O
  },
  
  "soy_template": {
    name: 'Soy Template',
    ext: ['soy'],
    cat: MODE_CATS.M
  },
  
  "space": {
    name: 'Space',
    ext: ['space'],
    cat: MODE_CATS.Q
  },
  
  "sql": {
    name: 'SQL',
    ext: ['sql'],
    cat: MODE_CATS.Q
  },
  
  "stylus": {
    name: 'Stylus',
    ext: ['styl', 'stylus'],
    cat: MODE_CATS.O
  },
  
  "svg": {
    name: 'SVG',
    ext: ['svg'],
    cat: MODE_CATS.M
  },
  
  "tcl": {
    name: 'TCL',
    ext: ['tcl'],
    cat: MODE_CATS.S
  },
  
  "tex": {
    name: 'Tex',
    ext: ['tex'],
    cat: MODE_CATS.M
  },
  
  "textile": {
    name: 'Textile',
    ext: ['textile'],
    cat: MODE_CATS.M
  },
  
  "tmsnippet": {
    name: 'tmSnippet',
    ext: ['tmsnippet'],
    cat: MODE_CATS.O
  },
  
  "toml": {
    name: 'TOML',
    ext: ['toml'],
    cat: MODE_CATS.M
  },
  
  "twig": {
    name: 'Twig',
    ext: ['twig'],
    cat: MODE_CATS.M
  },
  
  "typescript": {
    name: 'TypeScript',
    ext: ['ts'],
    cat: MODE_CATS.S
  },
  
  "vbscript": {
    name: 'VBScript',
    ext: ['vbs', 'vbe'],
    cat: MODE_CATS.S
  },
  
  "velocity": {
    name: 'Velocity',
    ext: ['vm'],
    cat: MODE_CATS.M
  },
  
  "verilog": {
    name: 'Verilog',
    ext: ['v'],
    cat: MODE_CATS.O
  },
  
  "vhdl": {
    name: 'VHDL',
    ext: ['vhd', 'vhdl'],
    cat: MODE_CATS.P
  },
  
  "xml": {
    name: 'XML',
    ext: ['xml', 'rss', 'atom', 'xhtml'],
    cat: MODE_CATS.M
  },
  
  "xquery": {
    name: 'XQuery',
    ext: ['xquery', 'xq'],
    cat: MODE_CATS.Q
  },
  
  "yaml": {
    name: 'YAML',
    ext: ['yaml', 'yml'],
    cat: MODE_CATS.M
  },
  
  
  "minecraft": {
    name: 'Minecraft',
    ext: ['mcc'],
    cat: MODE_CATS.O
  }
};

var CATS = [
  {name: MODE_CATS.P, langs: []},
  {name: MODE_CATS.S, langs: []},
  {name: MODE_CATS.M, langs: []},
  {name: MODE_CATS.Q, langs: []},
  {name: MODE_CATS.O, langs: []}
];

var EXTENSIONS = {};

for (var key in MODES) {
  var mode = MODES[key];
  var i = MODE_CAT_MAP[mode.cat];
  
  CATS[i].langs.push({name: mode.name, mode: key});
  
  for (var j=0; j < mode.ext.length; j++) {
    EXTENSIONS[mode.ext[j]] = key;
  }
}

function print_exts () {
  var exts = [];
  
  for (var ext in EXTENSIONS) {
    exts.push(ext);
  }
  
  console.log(JSON.stringify(exts));
}

function name_sort (a, b) {
  a = a.name.toLowerCase();
  b = b.name.toLowerCase();
  
  if (a < b)
    return -1;
    
  if (a > b)
    return 1;
    
  return 0;
}

for (var i in CATS) {
  CATS[i].langs.sort(name_sort);
}
