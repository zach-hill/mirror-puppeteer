/*
    This was all written with minimal testing against the production page(didn't want to ACTUALLY break anything).
*/

const puppeteer = require('puppeteer');
const mainPageUrl = 'https://mirror.co';

async function loadPage() {
    const browser = await puppeteer.launch({headless: false});
    const page = await browser.newPage();
    await page.goto(mainPageUrl);

    return page;
}

var transitionEventSetup = false;
async function addRandomItemToCart(page) {
    //Setup an event to automatically close the cart when it opens.
    if(!transitionEventSetup) {
        await setupTransitionEventHandlers(page);
    }

    await browseToAccessoriesPage(page);

    await page.waitForSelector('#accessories .accessory footer>button');
    await page.evaluate(async () => {
        var accessories = Array.from(document.querySelectorAll('#accessories .accessory footer>button'));
        let randomIndex = Math.floor(Math.random()*(accessories.length+1));
        if(randomIndex >= accessories.length) {
            return -1;
        } else {
            return randomIndex;
        }
    }).then(index => {
        if(index === -1) {
            return addMirrorToCart(page);
        } else {
            return addAccessoryAtIndexToCart(page, index);
        }
    });
}

async function addAccessoryAtIndexToCart(page, index) {
    if(!transitionEventSetup) {
        await setupTransitionEventHandlers(page);
    }

    await browseToAccessoriesPage(page);

    await page.waitForSelector('#accessories .accessory footer>button');
    await page.evaluate(async (index) => {
        var accessories = Array.from(document.querySelectorAll('#accessories .accessory footer>button'));
        return Promise.resolve(accessories[index].click());
    }, index);

    return await page.mainFrame().waitFor(500); //Slight delay for transition animation
}

async function setupTransitionEventHandlers(page) {
    await page.evaluate(() => {
        window.mirrorUtils = {
            clickOverlay: function(event) {
                var cartOverlay = document.getElementById('cart-overlay');
                cartOverlay.click();
            },

            registerTransitionEvent: function() {
                var cartModal = document.getElementById('cart-modal');
                cartModal.addEventListener('transitionend', this.clickOverlay, false);
            },

            unregisterTransitionEvent: function() {
                var cartModal = document.getElementById('cart-modal');
                cartModal.removeEventListener('transitionend', this.clickOverlay, false);
            }
        };
    });

    await registerTransitionEvent(page);

    transitionEventSetup = true;
}

async function registerTransitionEvent(page) {
    await page.evaluate(() => {
        mirrorUtils.registerTransitionEvent();
    });
}

async function unregisterTransitionEvent(page) {
    await page.evaluate(() => {
        mirrorUtils.unregisterTransitionEvent();
    });
}

async function addMirrorToCart(page) {
    await browseToShopPage(page);
    await page.waitForSelector('#product-detail footer > button');
    return await page.click('#product-detail footer > button');
}

async function browseToAccessoriesPage(page) {
    await setMenuVisible(page, true);
    return await page.click('nav ul>li:nth-child(3)>a');
}

async function browseToShopPage(page) {
    await setMenuVisible(page, true);
    return await page.click('.shop');
}

async function checkoutCart(page) {
    await unregisterTransitionEvent(page);
    await page.click('a.cart');
    await page.waitForSelector('#cart-modal > .has-items');
    await page.click('#cart-modal > .has-items > footer > button');
    
    await page.waitForSelector('#order-subscription .plan a.button.expanded.inverted');
    await page.click('#order-subscription .plan a.button.expanded.inverted');

    await fillOrderForm(page);
}

async function fillOrderForm(page) {
    //I guess this is where I stop
}

async function loginToAccount(page, user, pass) {
    await setMenuVisible(page, true);
    await page.click('div.sign-in li.mobile > button');

    await page.waitForSelector('div.sign-in input[type="email"]', {visible: true});
    await page.type('div.sign-in input[type="email"]', user);
    await page.type('div.sign-in input[type="password"]', pass);
    return await page.click('div.sign-in input[type="submit"]');
}

async function setMenuVisible(page, visibility) {
    var isVisible = await isMenuVisible(page);
    if(isVisible !== visibility) {
        return await page.click('.menu-toggle');
    } else {
        return false;
    }
}

async function isMenuVisible(page) {
    var menuOpenClass = await page.$('.menu-open');
    return menuOpenClass !== null;
}


module.exports = {
    loadPage: loadPage,
    addRandomItemToCart: addRandomItemToCart,
    addAccessoryAtIndexToCart: addAccessoryAtIndexToCart,
    checkoutCart: checkoutCart
};