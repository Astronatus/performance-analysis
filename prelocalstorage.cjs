require('dotenv').config();

const config =  {
  ENV_KEY: process.env.LOCALSTORAGE_KEY,
  ENV_VALUE: process.env.LOCALSTORAGE_VALUE
}

module.exports = async function (context, commands) {

  const { ENV_KEY, ENV_VALUE } = config
  if (!ENV_KEY && !ENV_VALUE) throw new Error('Missing env variables.');
  
  const scriptToInject = `window.localStorage.setItem(${JSON.stringify(ENV_KEY)}, ${JSON.stringify(ENV_VALUE)});`;

  // For Chrome/Chromium 
  if (context.options && context.options.browser === 'chrome' && context.selenium && context.selenium.driver) {
    const driver = context.selenium.driver;
    await driver.sendDevToolsCommand('Page.addScriptToEvaluateOnNewDocument', { source: scriptToInject });

    // Disable cache for cleaner measurements
    await driver.sendDevToolsCommand('Network.setCacheDisabled', { cacheDisabled: true });
    await commands.measure.start();
    return;
  }

  // Fallback path for other browsers
  await commands.navigate('about:blank');
  await commands.js.run(scriptToInject);
  await commands.measure.start();
};
