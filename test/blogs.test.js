const Page = require('./helpers/page');

let page;

beforeEach(async () => {
    page = await Page.build();
    await page.goto('http://localhost:3000/');
});

afterEach(async () => {
    await page.close();
});

describe('When logged in', async () => {
    beforeEach(async () => {
        await page.login();
        await page.click('a.btn-floating');
    });

    test('can see blog create form', async () => {
        const text = await page.getContentsOf('form label');
    
        expect(text).toEqual('Blog Title');
    });

    describe('and using valid inputs and submitting', async () => {
        beforeEach(async () => {
            await page.waitFor('.title input');
            await page.waitFor('.content input');
            await page.type('.title input', 'My title');
            await page.type('.content input', 'My content');
            await page.click('form button');
        });

        test('takes user to review screen', async () => {
            await page.waitFor('h5');
            const text = await page.getContentsOf('h5');

            expect(text).toEqual('Please confirm your entries');
        });

        test('then saving adds blog to index page', async () => {
            await page.waitFor('button.green');
            await page.click('button.green');

            await page.waitFor('.card');
            
            const title = await page.getContentsOf('.card-title');
            const content = await page.getContentsOf('p');

            expect(title).toEqual('My title');
            expect(content).toEqual('My content');
        });
    });

    describe('and using invalid inputs', async () => {
        beforeEach(async () => {
            await page.waitFor('form button');
            await page.click('form button');
        });

        test('the form shows an error message', async () => {
            await page.waitFor('.title .red-text');
            await page.waitFor('.content .red-text');

            const titleError = await page.getContentsOf('.title .red-text');
            const contentError = await page.getContentsOf('.content .red-text');

            expect(titleError).toEqual('You must provide a value');
            expect(contentError).toEqual('You must provide a value');
        });
    });
});

describe('User is not logged in', async () => {

    /* test('User cannot create blog posts', async () => {

        const { error } = await page.post('/api/blogs', {
            title: 'My Title',
            content: 'My Content'
        });
        expect(error).toEqual('You must log in!');

    });

    test('User cannot view blog posts', async () => {

        const { error } = await page.get('/api/blogs');
        expect(error).toEqual('You must log in!');

    }); */

    const actions = [
        {
            method: 'get',
            path: '/api/blogs'
        },
        {
            method: 'post',
            path: '/api/blogs',
            data: {
                title: 'My Title',
                content: 'My Content'
            }
        }
    ];

    test('Blog related actions are prohibited', async () => {
        const results = await page.execRequests(actions);
        
        for (let result of results) {
            expect(result).toEqual({ error: 'You must log in!' });
        }
    })


});