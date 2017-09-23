const desktopper = require('./index');
const path = require('path');
const del = require('del')

test(
    'it returns a correct path',
    () => desktopper('https://quizlet.com') // maybe some other website to test with?
        .then(res => expect(res).toBe(path.join(__dirname, 'Quizlet.app')))
        .then(() => del('Quizlet.app'))
);
