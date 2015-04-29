var SpellCheck = {
  editor: "editor", // This should be the id of your editor element.
  lang: "en_US",
  dicPath: "/lib/dicts/en_US.dic",
  affPath: "/lib/dicts/en_US.aff",
  dictionary: null,
  currently_spellchecking: false
};

$.get(SpellCheck.dicPath, function(data) {
	dicData = data;
})
.done(function() {
  $.get(SpellCheck.affPath, function(data) {
	  affData = data;
  })
  .done(function() {
  	console.log("Dictionary loaded");
    SpellCheck.dictionary = new Typo(SpellCheck.lang, affData, dicData);
  });
});

// Check the spelling of a line, and return [start, end]-pairs for misspelled words.
SpellCheck.misspelled = function (line) {
	var words = line.split(/[-|\W|\s]/);
	var i = 0;
	var bads = [];
	for (var word in words) {
	  var x = words[word] + "";
	  var checkWord = x.replace(/[^a-zA-Z']/g, '');
	  if (!SpellCheck.dictionary.check(checkWord)) {
	    bads[bads.length] = [i, i + words[word].length];
	  }
	  i += words[word].length + 1;
  }
  return bads;
};

SpellCheck.clear_markers = function (session, gutter) {
  var i;
  
  if (session.spellcheck_markers_present) {
    for (i in session.spellcheck_markers_present) {
      session.removeMarker(session.spellcheck_markers_present[i]);
    }
  }
  session.spellcheck_markers_present = [];
  
  if (gutter) {
    var lines = session.getDocument().getAllLines();
    for (i in lines) {
      session.removeGutterDecoration(i, "misspelled");
    }
  }
};

SpellCheck._spell_check = function (event, session) {
  if (!PREFS.spellcheck) {
    return;
  }
  
  // Wait for the dictionary to be loaded.
  if (SpellCheck.dictionary === null) {
    return;
  }

  if (SpellCheck.currently_spellchecking) {
  	return;
  }
  
  SpellCheck.currently_spellchecking = true;
  SpellCheck.clear_markers(session);

  try {
	  var Range = ace.require('ace/range').Range;
	  var lines = session.getDocument().getAllLines();
	  for (var i in lines) {
	  	// Clear the gutter.
	    session.removeGutterDecoration(i, "misspelled");
	    // Check spelling of this line.
	    var misspellings = SpellCheck.misspelled(lines[i]);
	    
	    // Add markers and gutter markings.
	    if (misspellings.length > 0) {
	      session.addGutterDecoration(i, "misspelled");
	    }
	    
	    for (var j in misspellings) {
	      var range = new Range(i, misspellings[j][0], i, misspellings[j][1]);
	      session.spellcheck_markers_present[session.spellcheck_markers_present.length] = session.addMarker(range, "misspelled", "typo", true);
	    }
	  }
	}
	
	finally {
		SpellCheck.currently_spellchecking = false;
	}
};

SpellCheck.bind_spellcheck = function (session, debounce) {
  var spell_check = debounce(SpellCheck._spell_check, 300);
  
  session.on('change', function(e, session) {
  	spell_check(e, session);
	});
};
