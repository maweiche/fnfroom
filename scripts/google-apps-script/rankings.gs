/**
 * Google Apps Script — Rankings JSON API
 *
 * Setup:
 *   1. Open the spreadsheet (ID: 14vRd9T1PronhADHdvvs1WLK83WNY5Z6i1X5ZMjiJ9h8)
 *   2. Rename "Sheet1" → "Lacrosse" (add "Basketball" / "Football" tabs later)
 *   3. Extensions > Apps Script > paste this file
 *   4. Deploy > New deployment > Web app
 *        Execute as: Me
 *        Who has access: Anyone
 *   5. Copy the URL → .env.local as GOOGLE_RANKINGS_SCRIPT_URL
 *
 * Sheet columns (row 1 = header):
 *   A: Rank | B: Team | C: Location | D: Record | E: Rating | F: Strength | G: +/-
 *
 * Usage:
 *   ?sport=lacrosse   → single sport
 *   ?sport=all         → all sports
 */

function doGet(e) {
  var sportParam = (e && e.parameter && e.parameter.sport) || "all";
  sportParam = sportParam.toLowerCase().trim();

  var ss = SpreadsheetApp.getActiveSpreadsheet();

  if (sportParam === "all") {
    var allSports = {};
    var sheets = ss.getSheets();
    for (var i = 0; i < sheets.length; i++) {
      var tabName = sheets[i].getName();
      var sportKey = tabName.toLowerCase();
      if (["basketball", "football", "lacrosse"].indexOf(sportKey) === -1) continue;
      allSports[sportKey] = readTab(sheets[i], sportKey);
    }
    return jsonResponse(allSports);
  }

  // Single sport
  var tabName = sportParam.charAt(0).toUpperCase() + sportParam.slice(1);
  var sheet = ss.getSheetByName(tabName);

  if (!sheet) {
    return jsonResponse({ error: "Tab not found: " + tabName, sport: sportParam, rankings: [] });
  }

  var result = readTab(sheet, sportParam);
  return jsonResponse(result);
}

function readTab(sheet, sportKey) {
  var data = sheet.getDataRange().getValues();
  var rankings = [];

  // Skip header row (index 0)
  for (var i = 1; i < data.length; i++) {
    var row = data[i];
    var rank = row[0];

    // Skip empty rows
    if (!rank && rank !== 0) continue;
    rank = Number(rank);
    if (isNaN(rank) || rank <= 0) continue;

    var team = String(row[1] || "").trim();
    var location = String(row[2] || "").trim();
    var record = String(row[3] || "").trim();
    var rating = row[4] !== "" && row[4] != null ? Number(row[4]) : null;
    var strength = row[5] !== "" && row[5] != null ? Number(row[5]) : null;
    var changeRaw = String(row[6] || "").trim();

    // Parse +/- column
    var movement = "steady";
    var movementValue = 0;
    if (changeRaw && changeRaw !== "--" && changeRaw !== "—" && changeRaw !== "-") {
      var num = parseInt(changeRaw, 10);
      if (!isNaN(num)) {
        if (num > 0) {
          movement = "up";
          movementValue = num;
        } else if (num < 0) {
          movement = "down";
          movementValue = Math.abs(num);
        }
      } else if (changeRaw.toLowerCase() === "new") {
        movement = "new";
        movementValue = 0;
      }
    }

    rankings.push({
      rank: rank,
      team: team,
      location: location,
      record: record,
      rating: rating,
      strength: strength,
      movement: movement,
      movementValue: movementValue
    });
  }

  return {
    sport: sportKey,
    updatedAt: new Date().toISOString(),
    count: rankings.length,
    rankings: rankings
  };
}

function jsonResponse(data) {
  return ContentService
    .createTextOutput(JSON.stringify(data))
    .setMimeType(ContentService.MimeType.JSON);
}
