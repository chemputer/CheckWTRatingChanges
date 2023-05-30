// this file goes to Code.gs in a new Apps Script project opened directly from the Google Sheet
// that you wish for it to interact with. It currently works in my project.
// Copyright (c) 2023, Chemputer, All rights reserved.

function onOpen() {
    SpreadsheetApp.getUi().createMenu('Custom Menu')
      .addItem('Update Changes', 'updateChanges')
      .addToUi();
  }
  
  function updateChanges() {
    var editedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
  
    var lastRow = editedSheet.getLastRow();
    var playerNames = [];
  
    for (var i = 2; i <= lastRow; i++) {
      var ratingCell = editedSheet.getRange(i, 3);
      var playerNameCell = editedSheet.getRange(i, 2);
      var rating = ratingCell.getValue();
      var playerName = playerNameCell.getValue();
  
      if (rating !== "") {
        var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
        var targetValues = targetSheet.getRange("A:B").getValues();
        var playerExists = false;
  
        for (var j = 0; j < targetValues.length; j++) {
          var existingPlayer = targetValues[j][0];
  
          if (existingPlayer === playerName) {
            // Player name already exists in Sheet2, increment the count in Column B
            var count = targetValues[j][1];
            targetSheet.getRange(j + 1, 2).setValue(count + 1);
            playerExists = true;
            break;
          }
        }
  
        if (!playerExists) {
          // Player name does not exist in Sheet2, add a new row with count 1
          var targetLastRow = targetSheet.getLastRow();
          targetSheet.getRange(targetLastRow + 1, 1).setValue(playerName);
          targetSheet.getRange(targetLastRow + 1, 2).setValue(1);
        }
      }
    }
  }