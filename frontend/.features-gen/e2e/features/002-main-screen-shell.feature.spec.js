// Generated from: e2e/features/002-main-screen-shell.feature
import { test } from "../../../e2e/steps/fixtures.ts";

test.describe('Main screen shell', () => {

  test('The main screen opens on Conversation', { tag: ['@smoke'] }, async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the page shows the app name', null, { page }); 
    await And('the "Conversation" mode tab is the current page', null, { page }); 
    await And('the page title is "Conversation · Vaikhari"', null, { page }); 
  });

  test('The learner switches practice modes', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner picks the "Grammar" mode tab', null, { page }); 
    await Then('the "Grammar" mode tab is the current page', null, { page }); 
    await And('the address ends with "/grammar"', null, { page }); 
    await And('the page shows the heading "Grammar"', null, { page }); 
  });

  test('A mode can be opened directly by its address', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app at "/vocabulary"', null, { page }); 
    await Then('the "Vocabulary" mode tab is the current page', null, { page }); 
  });

  test('The learner chooses a language and level', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner picks the language "Examplish"', null, { page }); 
    await And('the learner picks the level "L2"', null, { page }); 
    await And('the learner closes the language picker', null, { page }); 
    await Then('the language button reads "Examplish · L2"', null, { page }); 
  });

  test('A language with a single level has it selected', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner picks the language "Samplese"', null, { page }); 
    await Then('the level "S1" is selected', null, { page }); 
  });

  test('A language with several levels starts at its easiest level', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner picks the language "Examplish"', null, { page }); 
    await Then('the level "L1" is selected', null, { page }); 
  });

  test('The level list belongs to the chosen language', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner picks the language "Examplish"', null, { page }); 
    await Then('the level group is labelled "Level (TEST)"', null, { page }); 
    await And('the levels offered are "L1, L2"', null, { page }); 
  });

  test('The chosen language is remembered after a reload', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the learner has chosen "Examplish" at level "L1"', null, { fakeApi, page }); 
    await When('the learner reloads the app', null, { page }); 
    await Then('the language button reads "Examplish · L1"', null, { page }); 
  });

  test('On a phone the mode tabs are a bottom bar', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner uses a phone-sized screen', null, { page }); 
    await And('the learner has chosen "Examplish" at level "L1"', null, { fakeApi, page }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the mode tabs are at the bottom of the screen', null, { page }); 
    await And('every mode tab is at least 44 pixels tall', null, { page }); 
    await And('the language button reads "XX · L1"', null, { page }); 
  });

  test('On a desktop the mode tabs are under the header', async ({ Given, When, Then, page }) => { 
    await Given('the learner uses a desktop-sized screen', null, { page }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the mode tabs are under the header', null, { page }); 
  });

  test('On a tablet the mode tabs are under the header', async ({ Given, When, Then, page }) => { 
    await Given('the learner uses a tablet-sized screen', null, { page }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the mode tabs are under the header', null, { page }); 
  });

  test('Escape closes the language picker', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner presses Escape', null, { page }); 
    await Then('the language picker is not shown', null, { page }); 
    await And('the language button has focus', null, { page }); 
  });

  test('An unknown address goes to Conversation', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app at "/no-such-page"', null, { page }); 
    await Then('the address ends with "/conversation"', null, { page }); 
  });

  test('A saved language that is no longer offered is ignored', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has chosen "Examplish" at level "L1"', null, { fakeApi, page }); 
    await And('the API no longer offers "Examplish"', null, { fakeApi }); 
    await When('the learner reloads the app', null, { page }); 
    await Then('the language button reads "Choose language"', null, { page }); 
  });

  test('The learner can retry when languages fail to load', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the languages request fails once', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the language button reads "Languages unavailable"', null, { page }); 
    await When('the learner picks "Try again"', null, { page }); 
    await Then('the language button reads "Choose language"', null, { page }); 
  });

  test('A damaged saved choice is ignored', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the saved language choice is not valid JSON', null, { fakeApi, page }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the language button reads "Choose language"', null, { page }); 
  });

  test('A language list with the wrong shape counts as a failure', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the languages request answers with the wrong shape', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the language button reads "Languages unavailable"', null, { page }); 
  });

  test('Without a chosen language the learner is asked to choose one', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the language button reads "Choose language"', null, { page }); 
    await And('the page shows "Choose the language you want to practise"', null, { page }); 
  });

  test('The language button waits while languages load', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the languages request is slow', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the language button reads "Loading languages"', null, { page }); 
    await And('the language button is disabled', null, { page }); 
  });

  test('With no languages on offer the learner is told so', async ({ Given, When, Then, fakeApi, page }) => { 
    await Given('the API offers no languages', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await Then('the language prompt says "No languages are available yet."', null, { page }); 
  });

  test('Keyboard focus stays in the open language picker', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner presses Tab from the "Done" button', null, { page }); 
    await Then('keyboard focus is inside the language picker', null, { page }); 
  });

  test('Levels are listed easiest first whatever order the API sends', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await And('the API sends the levels of "Examplish" in the order "L2, L1"', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner picks the language "Examplish"', null, { page }); 
    await Then('the levels offered are "L1, L2"', null, { page }); 
    await And('the level "L1" is selected', null, { page }); 
  });

  test('Levels are ordered by difficulty, not by name', async ({ Given, When, Then, And, fakeApi, page }) => { 
    await Given('the learner has not chosen a language', null, { fakeApi }); 
    await And('the API offers "Ordish" with level "Zed" at rank 1 and level "Alpha" at rank 2', null, { fakeApi }); 
    await When('the learner opens the app', null, { page }); 
    await And('the learner opens the language picker', null, { page }); 
    await And('the learner picks the language "Ordish"', null, { page }); 
    await Then('the levels offered are "Zed, Alpha"', null, { page }); 
    await And('the level "Zed" is selected', null, { page }); 
  });

});

// == technical section ==

test.use({
  $test: [({}, use) => use(test), { scope: 'test', box: true }],
  $uri: [({}, use) => use('e2e/features/002-main-screen-shell.feature'), { scope: 'test', box: true }],
  $bddFileData: [({}, use) => use(bddFileData), { scope: "test", box: true }],
});

const bddFileData = [ // bdd-data-start
  {"pwTestLine":6,"pickleLine":4,"tags":["@smoke"],"steps":[{"pwStepLine":7,"gherkinStepLine":5,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":8,"gherkinStepLine":6,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":9,"gherkinStepLine":7,"keywordType":"Outcome","textWithKeyword":"Then the page shows the app name","stepMatchArguments":[]},{"pwStepLine":10,"gherkinStepLine":8,"keywordType":"Outcome","textWithKeyword":"And the \"Conversation\" mode tab is the current page","stepMatchArguments":[{"group":{"start":4,"value":"\"Conversation\"","children":[{"start":5,"value":"Conversation","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":11,"gherkinStepLine":9,"keywordType":"Outcome","textWithKeyword":"And the page title is \"Conversation · Vaikhari\"","stepMatchArguments":[{"group":{"start":18,"value":"\"Conversation · Vaikhari\"","children":[{"start":19,"value":"Conversation · Vaikhari","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":14,"pickleLine":11,"tags":[],"steps":[{"pwStepLine":15,"gherkinStepLine":12,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":16,"gherkinStepLine":13,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":17,"gherkinStepLine":14,"keywordType":"Action","textWithKeyword":"And the learner picks the \"Grammar\" mode tab","stepMatchArguments":[{"group":{"start":22,"value":"\"Grammar\"","children":[{"start":23,"value":"Grammar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":18,"gherkinStepLine":15,"keywordType":"Outcome","textWithKeyword":"Then the \"Grammar\" mode tab is the current page","stepMatchArguments":[{"group":{"start":4,"value":"\"Grammar\"","children":[{"start":5,"value":"Grammar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":19,"gherkinStepLine":16,"keywordType":"Outcome","textWithKeyword":"And the address ends with \"/grammar\"","stepMatchArguments":[{"group":{"start":22,"value":"\"/grammar\"","children":[{"start":23,"value":"/grammar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":20,"gherkinStepLine":17,"keywordType":"Outcome","textWithKeyword":"And the page shows the heading \"Grammar\"","stepMatchArguments":[{"group":{"start":27,"value":"\"Grammar\"","children":[{"start":28,"value":"Grammar","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":23,"pickleLine":19,"tags":[],"steps":[{"pwStepLine":24,"gherkinStepLine":20,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":25,"gherkinStepLine":21,"keywordType":"Action","textWithKeyword":"When the learner opens the app at \"/vocabulary\"","stepMatchArguments":[{"group":{"start":29,"value":"\"/vocabulary\"","children":[{"start":30,"value":"/vocabulary","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":26,"gherkinStepLine":22,"keywordType":"Outcome","textWithKeyword":"Then the \"Vocabulary\" mode tab is the current page","stepMatchArguments":[{"group":{"start":4,"value":"\"Vocabulary\"","children":[{"start":5,"value":"Vocabulary","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":29,"pickleLine":24,"tags":[],"steps":[{"pwStepLine":30,"gherkinStepLine":25,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":31,"gherkinStepLine":26,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":32,"gherkinStepLine":27,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":33,"gherkinStepLine":28,"keywordType":"Action","textWithKeyword":"And the learner picks the language \"Examplish\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Examplish\"","children":[{"start":32,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":34,"gherkinStepLine":29,"keywordType":"Action","textWithKeyword":"And the learner picks the level \"L2\"","stepMatchArguments":[{"group":{"start":28,"value":"\"L2\"","children":[{"start":29,"value":"L2","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":35,"gherkinStepLine":30,"keywordType":"Action","textWithKeyword":"And the learner closes the language picker","stepMatchArguments":[]},{"pwStepLine":36,"gherkinStepLine":31,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Examplish · L2\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Examplish · L2\"","children":[{"start":27,"value":"Examplish · L2","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":39,"pickleLine":33,"tags":[],"steps":[{"pwStepLine":40,"gherkinStepLine":34,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":41,"gherkinStepLine":35,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":42,"gherkinStepLine":36,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":43,"gherkinStepLine":37,"keywordType":"Action","textWithKeyword":"And the learner picks the language \"Samplese\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Samplese\"","children":[{"start":32,"value":"Samplese","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":44,"gherkinStepLine":38,"keywordType":"Outcome","textWithKeyword":"Then the level \"S1\" is selected","stepMatchArguments":[{"group":{"start":10,"value":"\"S1\"","children":[{"start":11,"value":"S1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":47,"pickleLine":40,"tags":[],"steps":[{"pwStepLine":48,"gherkinStepLine":41,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":49,"gherkinStepLine":42,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":50,"gherkinStepLine":43,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":51,"gherkinStepLine":44,"keywordType":"Action","textWithKeyword":"And the learner picks the language \"Examplish\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Examplish\"","children":[{"start":32,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":52,"gherkinStepLine":45,"keywordType":"Outcome","textWithKeyword":"Then the level \"L1\" is selected","stepMatchArguments":[{"group":{"start":10,"value":"\"L1\"","children":[{"start":11,"value":"L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":55,"pickleLine":47,"tags":[],"steps":[{"pwStepLine":56,"gherkinStepLine":48,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":57,"gherkinStepLine":49,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":58,"gherkinStepLine":50,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":59,"gherkinStepLine":51,"keywordType":"Action","textWithKeyword":"And the learner picks the language \"Examplish\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Examplish\"","children":[{"start":32,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":60,"gherkinStepLine":52,"keywordType":"Outcome","textWithKeyword":"Then the level group is labelled \"Level (TEST)\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Level (TEST)\"","children":[{"start":29,"value":"Level (TEST)","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":61,"gherkinStepLine":53,"keywordType":"Outcome","textWithKeyword":"And the levels offered are \"L1, L2\"","stepMatchArguments":[{"group":{"start":23,"value":"\"L1, L2\"","children":[{"start":24,"value":"L1, L2","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":64,"pickleLine":55,"tags":[],"steps":[{"pwStepLine":65,"gherkinStepLine":56,"keywordType":"Context","textWithKeyword":"Given the learner has chosen \"Examplish\" at level \"L1\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Examplish\"","children":[{"start":24,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":44,"value":"\"L1\"","children":[{"start":45,"value":"L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":66,"gherkinStepLine":57,"keywordType":"Action","textWithKeyword":"When the learner reloads the app","stepMatchArguments":[]},{"pwStepLine":67,"gherkinStepLine":58,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Examplish · L1\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Examplish · L1\"","children":[{"start":27,"value":"Examplish · L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":70,"pickleLine":60,"tags":[],"steps":[{"pwStepLine":71,"gherkinStepLine":61,"keywordType":"Context","textWithKeyword":"Given the learner uses a phone-sized screen","stepMatchArguments":[]},{"pwStepLine":72,"gherkinStepLine":62,"keywordType":"Context","textWithKeyword":"And the learner has chosen \"Examplish\" at level \"L1\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Examplish\"","children":[{"start":24,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":44,"value":"\"L1\"","children":[{"start":45,"value":"L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":73,"gherkinStepLine":63,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":74,"gherkinStepLine":64,"keywordType":"Outcome","textWithKeyword":"Then the mode tabs are at the bottom of the screen","stepMatchArguments":[]},{"pwStepLine":75,"gherkinStepLine":65,"keywordType":"Outcome","textWithKeyword":"And every mode tab is at least 44 pixels tall","stepMatchArguments":[{"group":{"start":27,"value":"44"},"parameterTypeName":"int"}]},{"pwStepLine":76,"gherkinStepLine":66,"keywordType":"Outcome","textWithKeyword":"And the language button reads \"XX · L1\"","stepMatchArguments":[{"group":{"start":26,"value":"\"XX · L1\"","children":[{"start":27,"value":"XX · L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":79,"pickleLine":68,"tags":[],"steps":[{"pwStepLine":80,"gherkinStepLine":69,"keywordType":"Context","textWithKeyword":"Given the learner uses a desktop-sized screen","stepMatchArguments":[]},{"pwStepLine":81,"gherkinStepLine":70,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":82,"gherkinStepLine":71,"keywordType":"Outcome","textWithKeyword":"Then the mode tabs are under the header","stepMatchArguments":[]}]},
  {"pwTestLine":85,"pickleLine":73,"tags":[],"steps":[{"pwStepLine":86,"gherkinStepLine":74,"keywordType":"Context","textWithKeyword":"Given the learner uses a tablet-sized screen","stepMatchArguments":[]},{"pwStepLine":87,"gherkinStepLine":75,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":88,"gherkinStepLine":76,"keywordType":"Outcome","textWithKeyword":"Then the mode tabs are under the header","stepMatchArguments":[]}]},
  {"pwTestLine":91,"pickleLine":78,"tags":[],"steps":[{"pwStepLine":92,"gherkinStepLine":79,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":93,"gherkinStepLine":80,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":94,"gherkinStepLine":81,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":95,"gherkinStepLine":82,"keywordType":"Action","textWithKeyword":"And the learner presses Escape","stepMatchArguments":[]},{"pwStepLine":96,"gherkinStepLine":83,"keywordType":"Outcome","textWithKeyword":"Then the language picker is not shown","stepMatchArguments":[]},{"pwStepLine":97,"gherkinStepLine":84,"keywordType":"Outcome","textWithKeyword":"And the language button has focus","stepMatchArguments":[]}]},
  {"pwTestLine":100,"pickleLine":86,"tags":[],"steps":[{"pwStepLine":101,"gherkinStepLine":87,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":102,"gherkinStepLine":88,"keywordType":"Action","textWithKeyword":"When the learner opens the app at \"/no-such-page\"","stepMatchArguments":[{"group":{"start":29,"value":"\"/no-such-page\"","children":[{"start":30,"value":"/no-such-page","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":103,"gherkinStepLine":89,"keywordType":"Outcome","textWithKeyword":"Then the address ends with \"/conversation\"","stepMatchArguments":[{"group":{"start":22,"value":"\"/conversation\"","children":[{"start":23,"value":"/conversation","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":106,"pickleLine":91,"tags":[],"steps":[{"pwStepLine":107,"gherkinStepLine":92,"keywordType":"Context","textWithKeyword":"Given the learner has chosen \"Examplish\" at level \"L1\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Examplish\"","children":[{"start":24,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":44,"value":"\"L1\"","children":[{"start":45,"value":"L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":108,"gherkinStepLine":93,"keywordType":"Context","textWithKeyword":"And the API no longer offers \"Examplish\"","stepMatchArguments":[{"group":{"start":25,"value":"\"Examplish\"","children":[{"start":26,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":109,"gherkinStepLine":94,"keywordType":"Action","textWithKeyword":"When the learner reloads the app","stepMatchArguments":[]},{"pwStepLine":110,"gherkinStepLine":95,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Choose language\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Choose language\"","children":[{"start":27,"value":"Choose language","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":113,"pickleLine":97,"tags":[],"steps":[{"pwStepLine":114,"gherkinStepLine":98,"keywordType":"Context","textWithKeyword":"Given the languages request fails once","stepMatchArguments":[]},{"pwStepLine":115,"gherkinStepLine":99,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":116,"gherkinStepLine":100,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Languages unavailable\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Languages unavailable\"","children":[{"start":27,"value":"Languages unavailable","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":117,"gherkinStepLine":101,"keywordType":"Action","textWithKeyword":"When the learner picks \"Try again\"","stepMatchArguments":[{"group":{"start":18,"value":"\"Try again\"","children":[{"start":19,"value":"Try again","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":118,"gherkinStepLine":102,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Choose language\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Choose language\"","children":[{"start":27,"value":"Choose language","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":121,"pickleLine":104,"tags":[],"steps":[{"pwStepLine":122,"gherkinStepLine":105,"keywordType":"Context","textWithKeyword":"Given the saved language choice is not valid JSON","stepMatchArguments":[]},{"pwStepLine":123,"gherkinStepLine":106,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":124,"gherkinStepLine":107,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Choose language\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Choose language\"","children":[{"start":27,"value":"Choose language","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":127,"pickleLine":109,"tags":[],"steps":[{"pwStepLine":128,"gherkinStepLine":110,"keywordType":"Context","textWithKeyword":"Given the languages request answers with the wrong shape","stepMatchArguments":[]},{"pwStepLine":129,"gherkinStepLine":111,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":130,"gherkinStepLine":112,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Languages unavailable\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Languages unavailable\"","children":[{"start":27,"value":"Languages unavailable","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":133,"pickleLine":114,"tags":[],"steps":[{"pwStepLine":134,"gherkinStepLine":115,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":135,"gherkinStepLine":116,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":136,"gherkinStepLine":117,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Choose language\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Choose language\"","children":[{"start":27,"value":"Choose language","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":137,"gherkinStepLine":118,"keywordType":"Outcome","textWithKeyword":"And the page shows \"Choose the language you want to practise\"","stepMatchArguments":[{"group":{"start":15,"value":"\"Choose the language you want to practise\"","children":[{"start":16,"value":"Choose the language you want to practise","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":140,"pickleLine":120,"tags":[],"steps":[{"pwStepLine":141,"gherkinStepLine":121,"keywordType":"Context","textWithKeyword":"Given the languages request is slow","stepMatchArguments":[]},{"pwStepLine":142,"gherkinStepLine":122,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":143,"gherkinStepLine":123,"keywordType":"Outcome","textWithKeyword":"Then the language button reads \"Loading languages\"","stepMatchArguments":[{"group":{"start":26,"value":"\"Loading languages\"","children":[{"start":27,"value":"Loading languages","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":144,"gherkinStepLine":124,"keywordType":"Outcome","textWithKeyword":"And the language button is disabled","stepMatchArguments":[]}]},
  {"pwTestLine":147,"pickleLine":126,"tags":[],"steps":[{"pwStepLine":148,"gherkinStepLine":127,"keywordType":"Context","textWithKeyword":"Given the API offers no languages","stepMatchArguments":[]},{"pwStepLine":149,"gherkinStepLine":128,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":150,"gherkinStepLine":129,"keywordType":"Outcome","textWithKeyword":"Then the language prompt says \"No languages are available yet.\"","stepMatchArguments":[{"group":{"start":25,"value":"\"No languages are available yet.\"","children":[{"start":26,"value":"No languages are available yet.","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":153,"pickleLine":131,"tags":[],"steps":[{"pwStepLine":154,"gherkinStepLine":132,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":155,"gherkinStepLine":133,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":156,"gherkinStepLine":134,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":157,"gherkinStepLine":135,"keywordType":"Action","textWithKeyword":"And the learner presses Tab from the \"Done\" button","stepMatchArguments":[{"group":{"start":33,"value":"\"Done\"","children":[{"start":34,"value":"Done","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":158,"gherkinStepLine":136,"keywordType":"Outcome","textWithKeyword":"Then keyboard focus is inside the language picker","stepMatchArguments":[]}]},
  {"pwTestLine":161,"pickleLine":138,"tags":[],"steps":[{"pwStepLine":162,"gherkinStepLine":139,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":163,"gherkinStepLine":140,"keywordType":"Context","textWithKeyword":"And the API sends the levels of \"Examplish\" in the order \"L2, L1\"","stepMatchArguments":[{"group":{"start":28,"value":"\"Examplish\"","children":[{"start":29,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":53,"value":"\"L2, L1\"","children":[{"start":54,"value":"L2, L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":164,"gherkinStepLine":141,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":165,"gherkinStepLine":142,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":166,"gherkinStepLine":143,"keywordType":"Action","textWithKeyword":"And the learner picks the language \"Examplish\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Examplish\"","children":[{"start":32,"value":"Examplish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":167,"gherkinStepLine":144,"keywordType":"Outcome","textWithKeyword":"Then the levels offered are \"L1, L2\"","stepMatchArguments":[{"group":{"start":23,"value":"\"L1, L2\"","children":[{"start":24,"value":"L1, L2","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":168,"gherkinStepLine":145,"keywordType":"Outcome","textWithKeyword":"And the level \"L1\" is selected","stepMatchArguments":[{"group":{"start":10,"value":"\"L1\"","children":[{"start":11,"value":"L1","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
  {"pwTestLine":171,"pickleLine":147,"tags":[],"steps":[{"pwStepLine":172,"gherkinStepLine":148,"keywordType":"Context","textWithKeyword":"Given the learner has not chosen a language","stepMatchArguments":[]},{"pwStepLine":173,"gherkinStepLine":149,"keywordType":"Context","textWithKeyword":"And the API offers \"Ordish\" with level \"Zed\" at rank 1 and level \"Alpha\" at rank 2","stepMatchArguments":[{"group":{"start":15,"value":"\"Ordish\"","children":[{"start":16,"value":"Ordish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":35,"value":"\"Zed\"","children":[{"start":36,"value":"Zed","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":49,"value":"1"},"parameterTypeName":"int"},{"group":{"start":61,"value":"\"Alpha\"","children":[{"start":62,"value":"Alpha","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"},{"group":{"start":77,"value":"2"},"parameterTypeName":"int"}]},{"pwStepLine":174,"gherkinStepLine":150,"keywordType":"Action","textWithKeyword":"When the learner opens the app","stepMatchArguments":[]},{"pwStepLine":175,"gherkinStepLine":151,"keywordType":"Action","textWithKeyword":"And the learner opens the language picker","stepMatchArguments":[]},{"pwStepLine":176,"gherkinStepLine":152,"keywordType":"Action","textWithKeyword":"And the learner picks the language \"Ordish\"","stepMatchArguments":[{"group":{"start":31,"value":"\"Ordish\"","children":[{"start":32,"value":"Ordish","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":177,"gherkinStepLine":153,"keywordType":"Outcome","textWithKeyword":"Then the levels offered are \"Zed, Alpha\"","stepMatchArguments":[{"group":{"start":23,"value":"\"Zed, Alpha\"","children":[{"start":24,"value":"Zed, Alpha","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]},{"pwStepLine":178,"gherkinStepLine":154,"keywordType":"Outcome","textWithKeyword":"And the level \"Zed\" is selected","stepMatchArguments":[{"group":{"start":10,"value":"\"Zed\"","children":[{"start":11,"value":"Zed","children":[{}]},{"children":[{}]}]},"parameterTypeName":"string"}]}]},
]; // bdd-data-end