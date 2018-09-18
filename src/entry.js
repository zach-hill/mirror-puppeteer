const crawler = require('./crawler.js');

//Load page, login to account, buy 5 random items, then checkout.
async function initialize() {
    var page = await crawler.loadPage('https://mirror.co', true);

    await crawler.loginToAccount(page, 'userfoo@fakeemail.com', 'passbar');

    var amountToBuy = 5;
    for(var i = 0; i < amountToBuy; i++) {
        await crawler.addRandomItemToCart(page);
    }

    //Add a Mirror, if one already exists it'll just add an extra
    await crawler.addMirrorToCart(page);

    await crawler.checkoutCart(page);
}


initialize();