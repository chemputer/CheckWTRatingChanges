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
        var editedSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet1");
        var targetSheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Sheet2");
        var lastRow = editedSheet.getLastRow();
        var targetValues = targetSheet.getRange("A:C").getValues();
        var targetMap = {};
        for (var i = 0; i < targetValues.length; i++) {
          targetMap[targetValues[i][0]] = {row: i + 1, count: targetValues[i][1], rating: targetValues[i][2]};
        }
        for (var i = 2; i <= lastRow; i++) {
          var ratingCell = editedSheet.getRange(i, 3);
          var playerNameCell = editedSheet.getRange(i, 2);
          var rating = ratingCell.getValue();
          var playerName = playerNameCell.getValue();
          if (rating !== "") {
            if (playerName in targetMap) {
              // Player name already exists in Sheet2
              // !== for the following comparison will give incorrect results, use !=
              if (targetMap[playerName].rating != rating) {
                //console.log("Uh oh")
                // Ratings differ, increment the count in Column B and update the rating in Column C
                var count = targetMap[playerName].count;
                targetSheet.getRange(targetMap[playerName].row, 2).setValue(count + 1);
                targetSheet.getRange(targetMap[playerName].row, 3).setValue(rating);
              }
            } else {
              // Player name does not exist in Sheet2, add a new row with count 1 and the rating
              var targetLastRow = targetSheet.getLastRow();
              targetSheet.getRange(targetLastRow + 1, 1, 1, 3).setValues([[playerName, 1, rating]]);
              targetMap[playerName] = {row: targetLastRow + 1, count: 1, rating: rating};
            }
          }
        }
      }
      