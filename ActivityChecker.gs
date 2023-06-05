// this file goes to Code.gs in a new Apps Script project opened directly from the Google Sheet
// that you wish for it to interact with. It currently works in my project.
// Copyright (c) 2023, Chemputer, All rights reserved.
// Last Updated: 6/4/2023

var debugConsole = false;

/**
 * Creates custom menus in the Google Sheets UI. 
 * The first menu is called "Script Menu" and has a single option to "Update Changes" which triggers the "updateChanges" function.
 * The second menu is a sub-menu of the first one called "Sort Sheet2" and has several sorting options for Sheet2.
 * 
 * @return {void}
 */
function onOpen() {
    // Define sheet names.
    var sheet1 = 'Sheet1';
    var sheet2 = 'Sheet2';
    sortByNumRatings();
    // Apply conditional formatting and center text in each sheet.
    applyConditionalFormatting(sheet1);
    applyConditionalFormatting(sheet2);
    centerTextInRange(sheet1);
    centerTextInRange(sheet2);

    // Get the spreadsheet UI.
    var ui = SpreadsheetApp.getUi();

    // Create the "Script Menu" with the "Update Changes" option and "Sort Sheet2" sub-menu.
    ui.createMenu('Script Menu')
        .addItem('Update Changes (Run Script Manually)', 'updateChanges')
        .addSeparator()
        .addSubMenu(ui.createMenu('Sort Sheet2')
            .addItem('Sort By # of Rating Changes (Squibs Sessions)', 'sortByNumRatings')
            .addItem('Sort By Names', 'sortByNames')
            .addItem('Sort By Rating', 'sortByRatings')
            .addItem('Sort By Latest Change', 'sortByLatestChange')
            .addItem('Sort By First Change', 'sortByFirstChange')
            .addItem('Reset Sorting', 'resetSorting')
        )
        .addToUi();
}

  


// This function returns a string containing a timestamp of when the script was last ran in Eastern Standard Time (EST)
function timeStamp() {
    // The variable estTimeZoneOffset is set to the number of minutes between the user's local time zone and EST (which is -5 hours behind UTC)
    var estTimeZoneOffset = -5 * 60; 
    // The variable timestamp is set to a string containing the current date and time in EST format
    var timestamp = Utilities.formatDate(new Date(new Date().getTime() + estTimeZoneOffset * 60 * 1000), "EST", 'yyyy-MM-dd HH:mm:ss');
    // The function returns a string containing the timestamp and the time zone abbreviation "EST"
    return "Script last ran: " + timestamp + ' EST';
}

function sortByNumRatings() {
  sortByColumn(2,false);
}

function sortByRatings() {
  sortByColumn(3,false);
}

// This function takes a sheet name as an optional parameter.
// If the sheet name is not provided, it defaults to "Sheet2".
// The function then calls another function called sortByColumn
// with the arguments 1 (the column index), true (to sort in ascending order),
// and the sheet name if provided or "Sheet2" if not provided.
function sortByNames(sheet) {
    sheet = sheet === undefined ? sheet = "Sheet2" : sheet;
    sortByColumn(1, true, sheet);
    
} 

function sortByLatestChange(){
  sortByColumn(4,false);
}
function sortByFirstChange(){
  sortByColumn(5);
}

// This function resets the sorting of the 'Sheet2' sheet in the active spreadsheet.
function resetSorting() {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName('Sheet2');
    var range = sheet.getRange('A2:E');
    range.sort({column: 1, ascending: true});
  }
  
  
// This function takes a sheet name as an argument and centers the text alignment of the cells in the range A1:F of that sheet
function centerTextInRange(sheetName) {
    // Get the active spreadsheet and then get the sheet with the specified name
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    // Set the horizontal alignment of the cells in the range A1:F to center
    sheet.getRange('A1:F').setHorizontalAlignment('center');
}

  


// This function logs a string to the console, if debugConsole is true or if the enable parameter is true
function debugOut(string, enable = false) {
    if (debugConsole || enable) {
        console.log(string);
    }
}

  

/**
 * Sorts a given sheet by the values in a specific column.
 * 
 * @param {number} col - The column index to sort by.
 * @param {boolean} [asc=true] - Whether to sort in ascending or descending order.
 * @param {string} [sheetName='Sheet2'] - The name of the sheet to sort.
 */
function sortByColumn(col, asc, sheetName) {
    // If no sheet name is provided, default to 'Sheet2'.
    if (sheetName === undefined) {
      sheetName = 'Sheet2';
    }
    // If no sort order is provided, default to ascending.
    if (asc === undefined) {
      asc = true;
    }
    // Get the sheet by name from the active spreadsheet.
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(sheetName);
    // Get the range of columns A through E.
    var columnToSort = sheet.getRange("A2:E");
    // Sort the specified column in the specified order.
    columnToSort.sort({column: col, ascending: asc});
    // Apply conditional formatting to the sorted sheet.
    applyConditionalFormatting(sheetName);
    centerTextInRange(sheetName);
  }
  
    /**
   * Updates players' ratings in Sheet2 based on the ratings in Sheet1.
   *
   * @param None
   * @return None
   */
 /**
 * This function applies conditional formatting to a Google Sheets spreadsheet.
 *
 * @param {string} ss - the name of the sheet to apply the formatting to
 */
function applyConditionalFormatting(ss) {
    var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(ss);
  
    var lastColumn = sheet.getLastColumn();
    var numRows = sheet.getLastRow();
  
    // Find the last non-empty row in column C
    var lastNonBlankRow = numRows;
    var columnCRange = sheet.getRange("C1:C" + numRows);
    var values = columnCRange.getValues();
    for (var i = numRows; i > 0; i--) {
      if (values[i - 1][0] !== "") {
        lastNonBlankRow = i;
        break;
      }
    }
  
    // Clear existing conditional formatting rules
    var totalRowRange = sheet.getRange(1, 1, numRows, lastColumn);
    totalRowRange.clearFormat();
  
    // Define the alternating background colors
    var color1 = "#ffffff"; // white
    var color2 = "#f2f2f2"; // light gray
  
    var rules = [];
    for (var i = 1; i <= lastNonBlankRow; i++) {
      var rowRange = sheet.getRange(i, 1, 1, lastColumn - 1);
      var rule = SpreadsheetApp.newConditionalFormatRule()
        .whenFormulaSatisfied('MOD(ROW(), 2) = 0')
        .setBackground(color1)
        .setRanges([rowRange])
        .build();
      rules.push(rule);
  
      if (i % 2 === 1) {
        rowRange.setBackground(color2);
      }
    }
  
    sheet.setConditionalFormatRules(rules);
  }


    /**
   * Updates players' ratings in Sheet2 based on the ratings in Sheet1.
   *
   * @param None
   * @return None
   */

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
  
    var targetRange = targetSheet.getRange(1, 1, targetSheet.getLastRow(), 5);
    var targetValues = targetRange.getValues();
    var changedRatings = 0;
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
  
            if (count === 0) {
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
  
    
    debugOut('Number of changed ratings: ' + changedRatings, true);
    debugOut(timeStamp(),true);
    // Update the cell with the timestamp
    targetSheet.getRange(1, 6).setValue(timeStamp());
    
    targetRange.setValues(targetValues);
    sortByNumRatings();
}