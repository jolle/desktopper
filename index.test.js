const desktopper = require('./index');
const path = require('path');
const del = require('del')

jest.setTimeout(3 * 60 * 1000);

test(
    'it returns a correct path',
    done => desktopper('https://quizlet.com') // maybe some other website to test with?
        .then(res => expect(res).toBe(path.join(__dirname, 'Quizlet.app')))
        .then(() => del('Quizlet.app'))
        .then(() => done())
);
