var DEFAULT_PREFS = {
  theme: 'textmate',
  fontsize: '16px',
  keybind: 'ace',
  soft_wrap: 'off',
  print_margin: 80,
  tabsize: 2,
  hactive: true,
  hword: true,
  invisibles: false,
  gutter: true,
  pmargin: true,
  softab: true,
  behave: true,
  show_login: true
};

var PREFS = {};
for (var key in DEFAULT_PREFS) {
  PREFS[key] = DEFAULT_PREFS[key];
}

var THEMES = [
  {key: "ambiance", name: "Ambiance"},
  {key: "chaos", name: "Chaos"},
  {key: "chrome", name: "Chrome"},
  {key: "clouds", name: "Clouds"},
  {key: "clouds_midnight", name: "Clouds - Midnight"},
  {key: "cobalt", name: "Cobalt"},
  {key: "crimson_editor", name: "Crimson Editor"},
  {key: "dawn", name: "Dawn"},
  {key: "dreamweaver", name: "Dreamweaver"},
  {key: "eclipse", name: "Eclipse"},
  {key: "github", name: "Github"},
  {key: "idle_fingers", name: "Idle Fingers"},
  {key: "katzenmilch", name: "Katzenmilch"},
  {key: "kr_theme", name: "KR"},
  {key: "kuroir", name: "Kuroir"},
  {key: "merbivore", name: "Merbivore"},
  {key: "merbivore_soft", name: "Merbivore - Soft"},
  {key: "mono_industrial", name: "Mono Industrial"},
  {key: "monokai", name: "Monokai"},
  {key: "pastel_on_dark", name: "Pastel on Dark"},
  {key: "solarized_dark", name: "Solarized Dark"},
  {key: "solarized_light", name: "Solarized Light"},
  {key: "terminal", name: "Terminal"},
  {key: "textmate", name: "Textmate"},
  {key: "tomorrow", name: "Tomorrow"},
  {key: "tomorrow_night", name: "Tomorrow Night"},
  {key: "tomorrow_night_blue", name: "Tomorrow Night - Blue"},
  {key: "tomorrow_night_bright", name: "Tomorrow Night - Bright"},
  {key: "tomorrow_night_eighties", name: "Tomorrow Night - 80's"},
  {key: "twilight", name: "Twilight"},
  {key: "vibrant_ink", name: "Vibrant Ink"},
  {key: "xcode", name: "XCode"}
];

var KEY_MODES = [
  {key: "ace", name: "Ace"},
  {key: "emacs", name: "Emacs"},
  {key: "vim", name: "Vim"}
];

var FONT_MODES = [];
for (var i=12; i <= 60; i++) {
  FONT_MODES.push({key: i + "px", name: i + "px"});
}

var WRAP_MODES = [
  {key: "off", name: "Off"},
  {key: "on", name: "On"},
  {key: "free", name: "Free"}
];
