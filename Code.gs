/**
 * TODO: 
 * CUSTOMIZECOVERSLIDE() <-- DONE!
 * CREATETABLES() <-- DONE!
 * INSERTWORKSPACESLIDES() <-- DONE!
 * INSERTRMCONTACTINFO() <-- DONE!
 * CREATEDECK(prospectName, companyName, spaces, site, lang, workspaceType, longTermPct, longTermLength, rm) <-- DONE!
 */

const sitesSS = SpreadsheetApp.openById('1U9KbmYkQaK0d56jlHwYOkZG2qYFE8eEI5Hnfa3g97S4');

function include(fileName) {
  return HtmlService.createHtmlOutputFromFile(fileName).getContent();
}

function doGet() {
  
  let sheets = sitesSS.getSheets().filter(sheet => sheet.isSheetHidden() === false);
  let template = HtmlService.createTemplateFromFile('Index');
  template.sheets = sheets;
  // template.spaces = fetchSpaces();
  return template.evaluate()
    .setTitle("CIC Deck Generator 2.0");
}

function getTodayDate() {
  const today = new Date();
  const year = today.getFullYear();
  const month = String(today.getMonth() + 1).padStart(2, '0'); // Months are zero-based
  const day = String(today.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}


function getSheets(){
  let ss = SpreadsheetApp.openById('1U9KbmYkQaK0d56jlHwYOkZG2qYFE8eEI5Hnfa3g97S4');
  let sheets = ss.getSheets();

  sheets.forEach(sheet => {
    Logger.log(sheet.getName())
  })
}

function getRM(sheet){
  if (!sheet){
    throw new Error(`Sheet ${sheet} not found.`)
  }
  let site = sitesSS.getSheetByName(sheet)
  const rms = site.getRange("A2:D").getValues().filter(row => row[0] !== "");
  return rms;
}

function fetchSpaces(siteName) {
  
  const siteData = {
    'ber': { 
      siteID: 12, 
      siteFullName: 'Berlin'
      },
    'bos': { 
      siteID: 1, 
      siteFullName: 'Boston'
      },
    'cam': { 
      siteID: 2, 
      siteFullName: 'Cambridge'
      },
    'fuk': { 
      siteID: 13, 
      siteFullName: 'Fukuoka'
      },
    'phl': { 
      siteID: 4, 
      siteFullName: 'Philadelphia'
      },
    'pvd': { 
      siteID: 5, 
      siteFullName: 'Providence'
      },
    'stl': { 
      siteID: 7, 
      siteFullName: 'St. Louis'
      },
    'tok': { 
      siteID: 9, 
      siteFullName: 'Tokyo'
      },
    'waw': { 
      siteID: 10, 
      siteFullName: 'Warsaw'
      },
    'rdm': {
      siteID: 6,
      siteFullName: 'Rotterdam'
    }

  }


  
  
  const baseUrl = PropertiesService.getScriptProperties().getProperty('BASE_URL')
  const API_KEY = PropertiesService.getScriptProperties().getProperty('API_KEY')

  const headers = {
    'Authorization': `Token ${API_KEY}`
  };

  const options = {
    method: 'get',
    headers: headers,
    muteHttpExceptions: true
  };
  
  let combinedData = [];

  // const params = {
  //   anticipatedMoveInDate: getTodayDate(), 
  //   site: siteIDs[siteName],
  //   type: "reservable",
  //   // type: ["reservable","shared_space"],
    
  // };


  //  const queryString = Object.keys(params)
  //   .map(key => {
  //     if (Array.isArray(params[key])) {
  //       return params[key].map(value => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
  //     } else {
  //       return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
  //     }
  //   })
  //   .join("&");

  // const url = `${baseUrl}?${queryString}`;

  

  
  try {
    if (siteData[siteName]) {
      const siteID = siteData[siteName].siteID;
      const siteFullName = siteData[siteName].siteFullName; // e.g., "Philadelphia"

      // Query parameters for memberships (no site ID required, filter by site name)
      const membershipParams = {
        anticipatedMoveInDate: getTodayDate()
      };
      const membershipQueryString = buildQueryString(membershipParams);
      const membershipsUrl = `${baseUrl}/memberships/?${membershipQueryString}`;
      const membershipsResponse = UrlFetchApp.fetch(membershipsUrl, options);
      const membershipsData = JSON.parse(membershipsResponse.getContentText());

      // Filter memberships by site name (e.g., "Philadelphia")
      const filteredMemberships = membershipsData.filter(membership => {
        if (siteFullName === "St. Louis"){
          return membership.site === siteFullName
          && (
              membership.name === "Sarah Street Coworking"
            || membership.name === "STL 4220 coworking"
            );
        } else {

          return membership.site === siteFullName && membership.name === `${siteFullName} Coworking`
        }
      });
      combinedData = combinedData.concat(filteredMemberships);

      // Query parameters for spaces (requires numeric site ID)
      const spaceParams = {
        anticipatedMoveInDate: getTodayDate(),
        site: siteID,
        type: "reservable"
      };
      const spaceQueryString = buildQueryString(spaceParams);
      const spacesUrl = `${baseUrl}/spaces/?${spaceQueryString}`;
      const spacesResponse = UrlFetchApp.fetch(spacesUrl, options);
      const spacesData = JSON.parse(spacesResponse.getContentText());

      combinedData = combinedData.concat(spacesData);
    }
    
    return combinedData;
  } catch (error) {
    Logger.log('Error fetching data: ' + error);
    return { error: 'Failed to retrieve data' };
  }

  // try {
  //   const response = UrlFetchApp.fetch(url, options);
  //   const responseData = JSON.parse(response.getContentText());
  //   return responseData;
    
    
  // } catch (error) {
  //   Logger.log('Error fetching data: ' + error);
  //   return 'Error fetching data: ' + error
  // }
}

function buildQueryString(params) {
  return Object.keys(params)
    .map(key => {
      if (Array.isArray(params[key])) {
        return params[key].map(value => `${encodeURIComponent(key)}=${encodeURIComponent(value)}`).join("&");
      } else {
        return `${encodeURIComponent(key)}=${encodeURIComponent(params[key])}`;
      }
    })
    .join("&");
}

function customizeCoverSlide(deck, companyName){
  deck = SlidesApp.openById(deck.getId());
  let slides = deck.getSlides();
  
  
  slides[0].getShapes().forEach(shape => shape.getText().replaceAllText("COMPANY NAME", companyName))
  
}

function createTables(spaces, slideDeck, site, longTermPct, longTermLength, lang, workspaceType = "office") {

  
  let deck = SlidesApp.openById(slideDeck.getId())
  let slide;
  if (workspaceType === "office"){
    site === "waw" ? slide = deck.getSlides()[deck.getSlides().length - 6] : slide = deck.getSlides()[deck.getSlides().length - 9];
  } else if (workspaceType === "lab"){
    slide = deck.getSlides()[deck.getSlides().length - 14]
  }
  
  //MAKE `currencyFormatter` DYNAMIC BY `site` TO ACCOUNT FOR DIFFERENT CURRENCIES
  let currencyMap = {
    bos: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    cam: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    pvd: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    phl: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    stl: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    rdm: { locale: 'en-US', currency: 'EUR',   minFrac: 0, maxFrac: 0, style: 'currency' },
    ber: { locale: 'de-DE', currency: 'EUR',   minFrac: 0, maxFrac: 0, style: 'currency' },
    waw: { locale: 'en-US', currency: 'PLN',   minFrac: 0, maxFrac: 2, style: 'decimal'  },
    tok: { locale: 'ja-JP', currency: 'JPY',   minFrac: 0, maxFrac: 0, style: 'currency' },
    fuk: { locale: 'ja-JP', currency: 'JPY',   minFrac: 0, maxFrac: 0, style: 'currency' },
  }
  //make `baseFormatter` dynamic by `site` to account for different currencies
  let { locale, currency, minFrac, maxFrac, style } = currencyMap[site]

  const baseFormatter = new Intl.NumberFormat(locale, {
    style,               // 'decimal' for waw, 'currency' for everything else
    currency,            // ignored when style==='decimal'
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  });

  // helper to format amounts
  function formatMoney(amount) {
    let formatted = baseFormatter.format(amount);
    // if waw, append the ISO code as a suffix
    if (site === 'waw') {
      formatted += ' PLN';
    }
    return formatted;
  }
  
  let fetchedSpaces = fetchSpaces(site)
  
  

  let filteredResults = fetchedSpaces.filter(item => {
    return spaces.includes(item.spaceName) || spaces.includes(item.name)
  });

  filteredResults = filteredResults.sort((a, b) => {
    return (spaces.indexOf(a.spaceName) !== -1 ? spaces.indexOf(a.spaceName) : spaces.indexOf(a.name)) - (spaces.indexOf(b.spaceName) !== -1 ? spaces.indexOf(b.spaceName) : spaces.indexOf(b.name));
});


  function insertRows(workSpaces) {
      function clearTable(table) {
        for (let i = 0; i < table.getNumRows() - 1; i++) {
          for (let j = 0; j < table.getNumColumns(); j++) {
            table.getCell(i + 1, j).getText().clear();
          }
        }
      }

      function populateTable(table, units) {
        switch (lang) {
          case "en":
          table.getCell(0, 4).getText().setText(`${longTermLength}-month rate`);
          break;

          case "nl":
          table.getCell(0, 4).getText().setText(`${longTermLength}-maanden prijs*`);
          break;

          case "pl":
          table.getCell(0, 4).getText().setText(`Opłata za ${longTermLength}-miesięczny okres najmu`);
          break

          default:
          table.getCell(0, 4).getText().setText(`${longTermLength}-month rate`);
          break;

        }
        units.forEach((unit, index) => {
          if (unit.spaceName){ //spaces
            let { building, spaceName, reservable: { minDesks, maxDesks }, listPrice: { amount } } = unit;

            // Asset/Building
            table.getCell(index + 1, 0).getText().setText(building);

            // Office
            table.getCell(index + 1, 1).getText().setText(spaceName);

            // Number of people
            table.getCell(index + 1, 2).getText().setText(minDesks === maxDesks ? `${minDesks}` : `${minDesks}-${maxDesks}`);

            // Monthly Rate
            table.getCell(index + 1, 3).getText().setText(formatMoney(amount));


            // Term Rate
            if (longTermPct > 0) {
              let termRate = Math.round(amount - (amount * longTermPct));
              table.getCell(index + 1, 4).getText().setText(formatMoney(termRate));
            } else {
              table.getNumColumns() > 4 && table.getColumn(4).remove();
            }
          } else if (unit.name) { //memberships
              let { site, name, listPrice: { amount } } = unit;

              switch (site) {
                case "Rotterdam":
                table.getCell(index + 1, 0).getText().setText("NL GHG");
                break;

                // Site instead of Asset/Building
                default:
                table.getCell(index + 1, 0).getText().setText(site);
                break;

              }

              // Coworking Membership
              table.getCell(index + 1, 1).getText().setText(name);

              // Number of people (TODO: FIND OUT FROM TEAM)
              table.getCell(index + 1, 2).getText().setText("1");

              // Monthly Rate
              table.getCell(index + 1, 3).getText().setText(formatMoney(amount));

              // Term Rate
              if (longTermPct > 0) {
                table.getCell(index + 1, 4).getText().setText("--");
              } else {
                table.getNumColumns() > 4 && table.getColumn(4).remove();
              } 
          }
        });
      }

      if (workSpaces.length <= 4) {
        const table = slide.getTables()[0];
        clearTable(table); // Clears only the first slide's table
        populateTable(table, workSpaces);
        if (workspaceType === "office"){
          site === "waw" ? slide.move(deck.getSlides().length - 5) : slide.move(deck.getSlides().length - 8);
        } else if (workspaceType === "lab"){
          slide.move(deck.getSlides().length - 13)
        }
      } else {
        let newSlide = slide.duplicate(); // Duplicating the slide
        let newTable = newSlide.getTables()[0]; // Getting the table from the new slide

        clearTable(newTable); // Clears only the table on the new duplicated slide
        populateTable(newTable, workSpaces.slice(0, 4));

        if (workspaceType === "office"){
          site === "waw" ? slide.move(deck.getSlides().length - 6) : slide.move(deck.getSlides().length - 9);
        } else if (workspaceType === "lab"){
          slide.move(deck.getSlides().length - 14)
        }
        insertRows(workSpaces.slice(4)); // Recursively handle remaining spaces
      }
  }


  return insertRows(filteredResults)
}


function insertWorkspaceSlides(spaces, slideDeck, site, longTermPct, longTermLength, lang, workspaceType = "office"){  
  let deck = SlidesApp.openById(slideDeck.getId());
  let slide;
  if (workspaceType === "office"){
    site === "waw" ? slide = deck.getSlides()[deck.getSlides().length - 5] : slide = deck.getSlides()[deck.getSlides().length - 8]
  } else if (workspaceType === "lab"){
    slide = deck.getSlides()[deck.getSlides().length - 13]
  }


  const folderIDMap = {
    bos: {
      en: '11YuqyCJTzZvS3zkwfIA4fuMBs-re1PWX'
    },
    cam: {
      en: '1EA9ouJczT_BgS3yI9vZkeztz_AhHhQQl'
    },
    pvd: {
      en: '1AAHo5Rsb7mWTnPFM3Ck-U99_D-nY8gpr'
    },
    phl: {
      en: '1HQewMkR1tbydl-PNRZGbMNPxs2Sfg8S1'
    }, //Offices
    stl: {
      en: '1n8ffpdu2fIQy0ZutxowYR_T70_xx-NMD'
    }, //Offices - need to update to new template
    rdm: {
      en: '1WMOS67NV-_Hnr3LAcIgzrlgx_TiFNob5',
      nl: '19Lz8S1VNKA4sKciu2JyOskgC1H2kw66n'
    },
    ber: {
      en: '1Juc-KqqFfPVlGQPEnHXrJQmdQ_9oJ0EG'
      // de: 'ID HERE'
    },
    waw: {
      en: '16wKTnjmIcQgInH_YLjIQWXf3z6JEkNB3',
      pl: '1UlM5Ho_naifw-L-_nvbgpo-LkabWbf36'
    } , // - need to update to new template
    tok: {
      en: '1b6OFeJlri9eXfrQLxo8yCQVJVJ0USHMX'
      // jp: "ID HERE"
    },
    fuk: {
      en: '1FWwVntx3WW8ppd1NO9SiM4SVrS_qWeZH'
      // jp: "ID HERE"
    },
  }

  //make `folder` dynamic by `site`
  let folderId = folderIDMap[site][lang];
  let folder = DriveApp.getFolderById(folderId)

  let currencyMap = {
    bos: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    cam: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    pvd: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    phl: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    stl: { locale: 'en-US', currency: 'USD',   minFrac: 0, maxFrac: 0, style: 'currency' },
    rdm: { locale: 'en-US', currency: 'EUR',   minFrac: 0, maxFrac: 0, style: 'currency' },
    ber: { locale: 'de-DE', currency: 'EUR',   minFrac: 0, maxFrac: 0, style: 'currency' },
    waw: { locale: 'en-US', currency: 'PLN',   minFrac: 0, maxFrac: 2, style: 'decimal'  },
    tok: { locale: 'ja-JP', currency: 'JPY',   minFrac: 0, maxFrac: 0, style: 'currency' },
    fuk: { locale: 'ja-JP', currency: 'JPY',   minFrac: 0, maxFrac: 0, style: 'currency' },
  }
  //make `currencyFormatter` dynamic by `site` to account for different currencies
  let { locale, currency, minFrac, maxFrac, style } = currencyMap[site]

  const baseFormatter = new Intl.NumberFormat(locale, {
    style,               // 'decimal' for waw, 'currency' for everything else
    currency,            // ignored when style==='decimal'
    minimumFractionDigits: minFrac,
    maximumFractionDigits: maxFrac,
  });

  // helper to format amounts
  function formatMoney(amount) {
    let formatted = baseFormatter.format(amount);
    // if waw, append the ISO code as a suffix
    if (site === 'waw') {
      formatted += ' PLN';
    }
    return formatted;
  }

  let localDescriptions = {
    en: {
          cwDesc: "Unassigned, hot-desk membership in an open community",
          monthToMonth: "Month-to-month pricing",
          longTerm: `${longTermLength} month pricing`
      },
    nl: {
          cwDesc: "Niet toegewezen, hot desk-lidmaatschap in een open gemeenschap",
          monthToMonth: "Maand tot maand prijs",
          longTerm: `${longTermLength} maanden prijs`
      },
    pl: {
          cwDesc: "Elastyczne rozwiązanie typu “hot desk” na przestrzeni wspólnej",
          monthToMonth: "Miesięczna opłata",
          longTerm: `Opłata za ${longTermLength}-miesięczny okres najmu`
      },
  }


  let fetchedSpaces = fetchSpaces(site);
  let files = folder.getFiles();
  let filesArr = [];
  
  while (files.hasNext()){
    let file = files.next();
    spaces.forEach(space => `${space}.png` === file.getName() && filesArr.push(file))
  }

  let fileNames = filesArr.map(file => file.getName())

  let filteredSpaces = fetchedSpaces.filter(fetchedSpace => 
    // filesArr.some(file => file.getName() === `${fetchedSpace.spaceName}.png` || `${fetchedSpace.name}.png`)
    fileNames.includes(`${fetchedSpace.spaceName}.png`) || fileNames.includes(`${fetchedSpace.name}.png`)
  );
  
  
  // Sort both arrays
  let sortedFilteredSpaces = filteredSpaces.sort((a, b) => {
    let indexA = spaces.indexOf(a.spaceName) >= 0 ? spaces.indexOf(a.spaceName) : spaces.indexOf(a.name);
    let indexB = spaces.indexOf(b.spaceName) >= 0 ? spaces.indexOf(b.spaceName) : spaces.indexOf(b.name);
    return indexA - indexB;
});



  let sortedFilesArr = filesArr.sort((a, b) => {
    let indexA = spaces.findIndex(space => `${space}.png` === a.getName());
    let indexB = spaces.findIndex(space => `${space}.png` === b.getName());
    return indexA - indexB;
});


  filteredSpaces = sortedFilteredSpaces;
  filesArr = sortedFilesArr;
  
  filesArr.forEach((file, i) => {

    if (file.getName()) {
      
      // Remove existing images and insert the new one
      slide.getImages().forEach(image => image.remove());
      slide.insertImage(file.getBlob());

      // Helper function to replace text in shapes
      const replaceTextInShape = (filterText, newText) => {
        const shape = slide.getShapes().find(shape => shape.getText().asString().includes(filterText));
        if (shape) shape.getText().replaceAllText(shape.getText().asString(), newText);
      };



      function formatDeskRange(min, max) {
        return min === max ? `${min}` : `${min}-${max}`;
      }


      // Update text for the first iteration
      if (i === 0) {
        
        // let { building, spaceName, reservable: { minDesks, maxDesks }, listPrice: { amount }, spaceDescription, spaceDescriptionLocalLanguage } = filteredSpaces[i];
        let {
          building = site,
          spaceName = filteredSpaces[i].name || "Unknown name",
          reservable: { minDesks = 1, maxDesks = 1 } = {},
          listPrice: { amount = "N/A" } = {},
          spaceDescription = filteredSpaces[i].name ? localDescriptions[lang].cwDesc || localDescriptions["en"].cwDesc : "--",
          spaceDescriptionLocalLanguage = spaceDescription
        } = filteredSpaces[i]

        spaceDescription === "" ? spaceDescription = "--" : null;
        spaceDescriptionLocalLanguage === "" ? spaceDescriptionLocalLanguage = "--" : null;
        replaceTextInShape("DESKS", formatDeskRange(minDesks, maxDesks))
        replaceTextInShape("MONTHLY RATE", `${localDescriptions[lang].monthToMonth}: ${formatMoney(amount)}`);
        lang === 'en' ? replaceTextInShape(
          "DESCRIPTION",
          spaceDescription
        ) : replaceTextInShape(
          "DESCRIPTION",
          spaceDescriptionLocalLanguage
          );
        
        //Doesn't apply long term rates for coworking
        if (longTermPct > 0 && filteredSpaces[i].spaceName && !filteredSpaces[i].name) {
          const minFeesShape = slide.getShapes().find(shape => shape.getText().asString().includes(formatMoney(amount)));
          if (minFeesShape) {
            minFeesShape.getText().appendText(
              `\n${localDescriptions[lang].longTerm}:\n${formatMoney(
                amount - amount * longTermPct
              )}`
            );
          }
        }

        slide.getImages()[0].sendToBack();
        slide = slide.duplicate();
      } else {
        let {
          building = site,
          spaceName = filteredSpaces[i].name || "Unknown name",
          reservable: { minDesks = 1, maxDesks = 1 } = {},
          listPrice: { amount = "N/A" } = {},
          spaceDescription = filteredSpaces[i].name ? localDescriptions[lang].cwDesc || localDescriptions["en"].cwDesc : "--",
          spaceDescriptionLocalLanguage = spaceDescription
        } = filteredSpaces[i]

        spaceDescription === "" ? spaceDescription = "--" : null;

        // let { building : prevBuilding, spaceName : prevSpaceName, reservable: { minDesks : prevMinDesks, maxDesks : prevMaxDesks }, listPrice: { amount : prevAmount }, spaceDescription : prevSpaceDescription, spaceDescriptionLocalLanguage : prevSpaceDescriptionLocalLanguage } = filteredSpaces[i - 1];
        let prevItem = filteredSpaces[i-1];
        let {
          building: prevBuilding = site,
          spaceName: prevSpaceName = prevItem.name || "Unknown name",
          reservable: { minDesks: prevMinDesks = 1, maxDesks: prevMaxDesks = 1 } = {},
          listPrice: { amount: prevAmount = "N/A" } = {},
          spaceDescription: prevSpaceDescription = prevItem.name ? localDescriptions[lang].cwDesc || localDescriptions["en"].cwDesc : "--",
          spaceDescriptionLocalLanguage: prevSpaceDescriptionLocalLanguage = prevSpaceDescription
        } = prevItem;
        
        prevSpaceDescription === "" ? prevSpaceDescription = "--" : null;
        // Update text for subsequent iterations
        replaceTextInShape(formatDeskRange(prevMinDesks, prevMaxDesks), formatDeskRange(minDesks, maxDesks))
        replaceTextInShape(formatMoney(prevAmount), `${localDescriptions[lang].monthToMonth}: ${formatMoney(amount)}`);
        lang === 'en' ? replaceTextInShape(prevSpaceDescription, spaceDescription) : replaceTextInShape(prevSpaceDescriptionLocalLanguage, spaceDescriptionLocalLanguage) ;

        if (longTermPct > 0 && filteredSpaces[i].spaceName && !filteredSpaces[i].name) {
          const minFeesShape = slide.getShapes().find(shape => shape.getText().asString().includes(formatMoney(amount)));
          if (minFeesShape) {
            minFeesShape.getText().appendText(
              `\n${localDescriptions[lang].longTerm}:\n${formatMoney(
                amount - amount * longTermPct
              )}`
            );
          }
        }

        slide.getImages()[0].sendToBack();
        slide = slide.duplicate();
        }
      }
    });
  slide.remove()
}


function setContactInfo(slideDeck,site,rm){
  const deck = SlidesApp.openById(slideDeck.getId());
  // const site = 'pvd' 
  // const rm = 'Colleen Kwedor'
  const rmInfoArray = getRM(site).filter(row => row.includes(rm)).flat();
  const rmInfo = {
    fullName: rmInfoArray[0],
    title: rmInfoArray[1],
    email: rmInfoArray[2],
    phone: rmInfoArray[3]
  }
  let contactSlide = deck.getSlides()[deck.getSlides().length - 1];
  let contactInfoShape = contactSlide.getShapes().find(shape => shape.getText().asString().includes("@cic.com"))
  contactInfoShape.getText().replaceAllText("FULL NAME", rmInfo.fullName)
  contactInfoShape.getText().replaceAllText("TITLE", rmInfo.title)
  contactInfoShape.getText().replaceAllText("EMAIL", rmInfo.email)
  contactInfoShape.getText().replaceAllText("PHONE NUMBER", rmInfo.phone)

  
  
}


function createDeck(prospectName, companyName, spaces, site, lang, workspaceType, longTermPct, longTermLength, rm) {
  //TODO: FOR PHL AND STL, INCLUDE NESTED OBJECT FOR TYPE "OFFICE" OR "LAB"
  const deckIDMap = {
    cam: { 
      en: { office: "161A7n_g1taNXtNugnLWPp_Hgx7v8Sz07ew-e50tay5E" }, 
      archive: '1yu5mIhz8_2IRd2Ops_BtAvbqpSWTlVfK',
      fullSiteName: 'Cambridge'
    },
    bos: { 
      en: { office: "1qLGNtA6MaEdXCs4kievB4bJLsJeETLM7TAwxDHmZNKs" }, 
      archive: '1jWk_Mw9qhjLZXMf5c3XzIRsh2ykkV6WD',
      fullSiteName: 'Boston'
    },
    pvd: { 
      en: { office: "1tnIHxMrRG27usc-HFTLo9ispP74ZOLX2YCLNqLg_EeE" }, 
      archive: '1xKwssE0kurx12tqCx_mVZS3Y2C3f_jqk',
      fullSiteName: 'Providence'
    },
    phl: { 
      en: { 
        office: "1XrjE93YuEaRzhhtnAfUUyEl-vd5TFZ54ONCBL2019U8",
        lab: "1Fa_cbNbw9KSixX1e1b5100NSO_LhfdmrYHAsfNt8UTI"
      },
      archive: '1MqQT0EXPeUMt_bXgyLO6J7wfcyTa_dUa',
      fullSiteName: 'Philadelphia'
    },
    stl: { 
      en: { 
        office: "1KW3Ekh9Uze2r-CuQtevHIRwPJHIJrww7ItQ7fTZLp1A",
        lab: "1scZV3Mrgpvl2Dp7H8OfxM1_obdtVAp-VKdapPkTOFoc"
      },
      archive: '1iOSTl6MSzcBiIxxMEJE6WjAcu0kfdzPo',
      fullSiteName: 'St. Louis'
    },
    rdm: { 
      nl: { 
        office: "1U5rjnuwJ7e5Q6hiFELSmNHsw15o3jP8J7wh-XOtm3oc",
        localTitle: "Werkplekopties"
      },
      en: { office: "1K9eCZhmBUHtaTTZxsPZIk5qobH1q6RiVfB5L3TyoPQM" },
      archive: '1pbdfiitXWW0mOtbJ1cG4lh-KTvYga1bf',
      fullSiteName: 'Rotterdam'
    },
    ber: { 
      // de: { office: "ID_SITE7_LOCAL_OFFICE" }, // TODO: ADD WHEN READY
      en: { office: "1MwryquxKFEoChhspRYytrIoj2KyYymOyOWmhuIBQRyg" },
      archive: '1qjrQ_kSsr89SuZ28KwGR0meI0fyoSIy7',
      fullSiteName: 'Berlin'
    },
    waw: { 
      pl: { 
        office: "1qn2L5Csva0LB44nPPnELY9XS0Tn4NxK7TnXl_gE3xsI",
        localTitle: "Rodzaje przestrzeni"
        },
      en: { office: "1r6p7y1YYB-GSRb7eeANL5lqqC8sWdhCrrv0FXL2NLBc" },
      archive: '1_MAZynysGUJv9qYYS8qJraUWXfM1uXxR',
      fullSiteName: 'Warsaw'
    }
    // tok: { 
    //   english: { office: "ID_SITE9_EN_OFFICE" },
    //   local: { office: "ID_SITE9_LOCAL_OFFICE" }
    // },
    // fuk: { 
    //   english: { office: "ID_SITE10_EN_OFFICE" },
    //   local: { office: "ID_SITE10_LOCAL_OFFICE" }
    // }

  }
  
  
  const deckID = deckIDMap[site][lang][workspaceType]
  const deckArchiveID = deckIDMap[site].archive
  const fullSiteName = deckIDMap[site].fullSiteName
  let workspaceOptions;
  lang === "en" ? workspaceOptions = "Workspace Options" : workspaceOptions = deckIDMap[site][lang].localTitle;
  
  
  let deck = DriveApp.getFileById(deckID).makeCopy().setName(`${prospectName} (${companyName}): ${workspaceOptions} | CIC ${fullSiteName}`).moveTo(DriveApp.getFolderById(deckArchiveID))
  customizeCoverSlide(deck, companyName)
  createTables(spaces, deck, site, longTermPct, longTermLength, lang, workspaceType)
  insertWorkspaceSlides(spaces, deck, site, longTermPct, longTermLength, lang, workspaceType)
  site !== "waw" ? setContactInfo(deck,site,rm) : null;

  return deck.getUrl()
  
}



