const settings = require('./settings.json');

const fs = require('fs'); // File System
const crypto = require('crypto');
const DAVClient = require('tsdav'); //Connects to CardDAV
const nodemailer = require('nodemailer'); //Send emails

//Vars
let newsletter = {};

newsletter.mailer = nodemailer.createTransport({
    host: 'smtp.fastmail.com',
    port: 465,
    secure: true, // true for 465, false for other ports
    auth: {
        user: settings.mailUser,
        pass: settings.mailPass,
    },
});

newsletter.client = new DAVClient.DAVClient({
    serverUrl: 'https://carddav.fastmail.com/',
    credentials: {
        username: settings.mailUser,
        password: settings.mailPass,
    },
    authMethod: 'Basic',
    defaultAccountType: 'carddav',
});

newsletter.vcard = 'BEGIN:VCARD\nVERSION:3.0\n';
newsletter.vcard += 'CATEGORIES:MailingList MK\n';
newsletter.vcard += 'UID:{uid}\n';
newsletter.vcard += 'FN:{name}\n';
newsletter.vcard += 'N:;{name};;;\n';
newsletter.vcard += 'EMAIL;TYPE=PREF;TYPE=home:{email}\n';
newsletter.vcard += 'REV:{date}\n';
newsletter.vcard += 'END:VCARD';

//Load the welcome HTML email
fs.readFile('./welcome-e-mail.html', (err, data) => {
    if (err) {
        console.log(err);
        return;
    }
    newsletter.welcomeEmail = data.toString();
});

setup();

async function setup() {
    await newsletter.client.login();
    const addressbooks = await newsletter.client.fetchAddressBooks();
    newsletter.addressbook = addressbooks[0];
}

//Functions
function go(req, res) {
    let action = req.query.action; // subscribe, unsubscribe
    let email = req.query.email;
    let name = req.query.name;

    switch (action) {
        case 'subscribe':
            sub(res, email, name);
            break;
        case 'unsubscribe':
            unsub(res, email);
            break;
        default:
            res.send("Subscribe or unsubscribe from Melon's Newsletter!");
    }
}

//Handle a subscribe!
async function sub(res, email, name) {
    //Stops duplicate emails as each email will also be the id
    let uid = makeUID(email);

    let newCard = '' + newsletter.vcard;
    newCard = newCard.replace('{name}', name);
    newCard = newCard.replace('{name}', name);
    newCard = newCard.replace('{email}', email);
    newCard = newCard.replace('{uid}', uid);
    newCard = newCard.replace('{date}', new Date().toISOString());

    res.send('Hello ' + name + "! You subscribed to Melon's Newsletter, check your email for a welcome note :^] (check your spam folder!)");

    const cardResult = await newsletter.client.createVCard({
        addressBook: newsletter.addressbook,
        filename: uid + '.vcf',
        vCardString: newCard,
    });

    const mailResult = await newsletter.mailer.sendMail({
        from: settings.mailSender, // sender address
        to: email, // list of receivers
        subject: "Melon's Newsletter - Welcome :^]",
        html: newsletter.welcomeEmail.replace('{name}', name),
    });
}

//Handle an unsubscribe :(
async function unsub(res, email) {
    let uid = makeUID(email);

    res.send('OK BYE!?! Your email has been removed from the newsletter list, if for some reason you still get newsletters, just reply to one and let me know!');

    const result = await newsletter.client.deleteVCard({
        vCard: {
            url: newsletter.addressbook.url + uid + '.vcf',
        },
    });
}

function makeUID(string) {
    return crypto.createHash('sha1').update(string, 'binary').digest('hex');
}

module.exports = {
    go: function (req, res) {
        return go(req, res);
    },
};
