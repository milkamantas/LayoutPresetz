
// Initiate our saving module
var onRunSave = function(context) {

  const sketch = require('sketch')

  //Function to save file (our preset)
  const writeFile = (filename, the_string) => {
    const path =[@"" stringByAppendingString: filename];
    const str = [@"" stringByAppendingString: the_string];
    str.dataUsingEncoding_(NSUTF8StringEncoding).writeToFile_atomically_(path, true);
  }

  const artboard = context.document.currentPage().currentArtboard();

  //Set the function to get Layout Settings
  const getLayoutSettings = artboard => {
    const abLayout = artboard.layout();
    return {
      drawVertical: abLayout.drawVertical(),
      totalWidth: abLayout.totalWidth(),
      horizontalOffset: abLayout.horizontalOffset(),
      numberOfColumns: abLayout.numberOfColumns(),
      guttersOutside: abLayout.guttersOutside(),
      gutterWidth: abLayout.gutterWidth(),
      columnWidth: abLayout.columnWidth(),
      drawHorizontal: abLayout.drawHorizontal(),
      gutterHeight: abLayout.gutterHeight(),
      rowHeightMultiplication: abLayout.rowHeightMultiplication(),
      drawHorizontalLines: abLayout.drawHorizontalLines(),
      isEnabled: abLayout.isEnabled()
    }
  }

  const setLayoutSettings = artboard => {  }

  if(artboard.class() == "MSArtboardGroup"){

    //make sure only 1 item is selected - We want to save only the single artboard's layout settings
    if (artboard != null) {

      let layout = {}

      try {
        layout = getLayoutSettings(artboard);
      } catch(e) { log(e) }

      //Give the layout Preset name
      var doc = context.document;
      var docName = doc.askForUserInput_initialValue("What's the name of your preset?", "Your preset name here");
      var userInput = docName + '.json';
      // var userInput = doc.askForUserInput_initialValue("What's the name of your preset?", "Your preset name here") + '.json';

      var str = context.scriptPath
      var res = str.replace('SaveArtboardsLayout.js', 'Saved Layouts/')

      writeFile(`${res}${userInput}`, JSON.stringify(layout));

      doc.showMessage('Layout ' + docName + ' was saved successfully 💾!')


    } else {
      doc.showMessage("You need to select one artboard")
    }

  } else {

    //If selected layer is not Artboard show this message
    doc.showMessage("Please select an Artboard.");
  }

}


// Initiate our saving module
var onRunLoad = function(context) {

  const sketch = require('sketch')

  //Define function which will read the file **NOT WORKING??**
  const readFile = filePath => {
    const fileContents = NSString.stringWithContentsOfFile(filePath);
    return JSON.parse(fileContents.toString());
  }

  //Define various variables which might be used later ¯\_(ツ)_/¯
  var app = NSApp.delegate();
	var doc = context.document;
	var version = context.plugin.version().UTF8String();
	var fileTypes = ["json"];

  var str = context.scriptPath
  var res = String(str).replace('SaveArtboardsLayout.js', 'Saved Layouts/').replace(/\ /g, '%20')

  const artboard = context.document.currentPage().currentArtboard();

  //make sure only 1 item is selected - We want to save only the single artboard's layout settings
  if (artboard != null) {

  	// Open file picker to choose palette file
  	const panel = NSOpenPanel.openPanel();
  	panel.setAllowedFileTypes(fileTypes);
  	panel.setCanChooseDirectories(true);
  	panel.setCanChooseFiles(true);
  	panel.setCanCreateDirectories(true);
  	panel.setTitle("Choose a file");
  	panel.setPrompt("Choose");
    panel.directoryURL = NSURL.URLWithString('file://' + res);
  	var buttonClicked = panel.runModal();

    if (buttonClicked != NSOKButton) {
      return
    }

    const layout = panel.URLs()

    const data = readFile(`${layout[0].path()}`);

    const isArtboard = item => item.class() == 'MSArtboardGroup';
    const isSymbolMaster = item => item.class() == 'MSSymbolMaster';
    const isArtboardOrIsSymbolMaster = item => isArtboard || isSymbolMaster;

    context.selection.slice().filter(isArtboardOrIsSymbolMaster).map(artboard => {

        const layout = MSLayoutGrid.alloc().init();

        layout.setDrawVertical(data.drawVertical);
        layout.setTotalWidth(data.totalWidth);
        layout.setHorizontalOffset(data.horizontalOffset);
        layout.setNumberOfColumns(data.numberOfColumns);
        layout.setGuttersOutside(data.guttersOutside);

        layout.setGutterWidth(data.gutterWidth);
        layout.setColumnWidth(data.columnWidth);

        layout.setDrawHorizontal(data.drawHorizontal);
        layout.setGutterHeight(data.gutterHeight);
        layout.setRowHeightMultiplication(data.rowHeightMultiplication);
        layout.setDrawHorizontalLines(data.drawHorizontalLines);

        layout.setIsEnabled(data.isEnabled);
        artboard.setLayout(layout);

        // console.log(layout[0])

        doc.showMessage("Layout was applied successfully! 🌈")

      });

    } else {
      doc.showMessage("Please select an Artboard.")
    }

}
