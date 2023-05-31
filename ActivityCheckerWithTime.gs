// this file goes to Code.gs in a new Apps Script project opened directly from the Google Sheet
// that you wish for it to interact with. It currently works in my project.
// Copyright (c) 2023, Chemputer, All rights reserved.

/**
 * Creates a custom menu in the Google Sheets UI called "Custom Menu" with a single
 * option to "Update Changes" which triggers the "updateChanges" function.
 * 
 * @return {void}
 */
function onOpen() {
    const ui = SpreadsheetApp.getUi();
    ui.createMenu('Custom Menu').addItem('Update Changes', 'updateChanges').addToUi();
  }
  
    /**
   * Updates players' ratings in Sheet2 based on the ratings in Sheet1.
   *
   * @param None
   * @return None
   */
  function updateChanges() {
    var ss = SpreadsheetApp.getActiveSpreadsheet();
    var editedSheet = ss.getSheetByName("Sheet1");
    var targetSheet = ss.getSheetByName("Sheet2");
  
    var editedRange = editedSheet.getRange(2, 2, editedSheet.getLastRow() - 1, 2);
    var editedValues = editedRange.getValues();
  
    var targetRange = targetSheet.getRange(1, 1, targetSheet.getLastRow(), 3);
    var targetValues = targetRange.getValues();
  
    var now = new Date();
    now.setHours(now.getHours() - 5); // Convert to EST timezone
    var formattedDate = Utilities.formatDate(now, "EST", "MM/dd/yyyy");
    var formattedTime = Utilities.formatDate(now, "EST", "HH:mm:ss");
    var dateTime = formattedDate + " " + formattedTime;
  
    for (var i = 0; i < editedValues.length; i++) {
      var playerName = editedValues[i][0];
      var rating = editedValues[i][1];
  
      if (!rating) {
        continue;
      }
  
      var playerExists = false;
      for (var j = 0; j < targetValues.length; j++) {
        var existingPlayer = targetValues[j][0];
        var count = targetValues[j][1];
        var existingRating = targetValues[j][2];
  
        if (existingPlayer === playerName) {
          playerExists = true;
  
          if (existingRating != rating) {
            targetValues[j][1] = count + 1;
            targetValues[j][2] = rating;
            targetSheet.getRange(j + 1, 3, 1, 2).setValues([[count + 1, rating]]);
  
            if (count == 0) {
              targetValues[j][3] = dateTime;
              targetValues[j][4] = dateTime;
              targetSheet.getRange(j + 1, 4, 1, 2).setValues([[dateTime, dateTime]]);
            } else {
              targetValues[j][3] = dateTime;
              targetSheet.getRange(j + 1, 4, 1, 1).setValue(dateTime);
            }
          }
  
          break;
        }
      }
  
      if (!playerExists) {
        var targetLastRow = targetSheet.getLastRow() + 1;
        targetValues.push([playerName, 1, rating, dateTime, ""]);
        targetSheet.getRange(targetLastRow, 1, 1, 5).setValues([[playerName, 1, rating, dateTime, ""]]);
      }
    }
  
    targetRange.setValues(targetValues);
  }
  