const crawler = require('./crawler.js');

//Load page, login to account, buy 5 random items, then checkout.
async function initialize() {
    var page = await crawler.loadPage();

    await crawler.loginToAccount(page, 'userfoo', 'passbar');

    var amountToBuy = 5;
    for(var i = 0; i < amountToBuy; i++) {
        await crawler.addRandomItemToCart(page);
    }

    //Add a Mirror, if one already exists it'll just add an extra
    await crawler.addMirrorToCart(page);

    await crawler.checkoutCart(page);
}


initialize();