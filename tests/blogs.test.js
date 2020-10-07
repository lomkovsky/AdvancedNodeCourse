const Page = require('./helpers/page');
const mongoose = require('mongoose');
const User = mongoose.model('User');
const Blog = mongoose.model('Blog');


let page;
beforeEach(async() => {  
  page = await Page.build();
  await page.goto('localhost:3000');
});

afterEach(async() => {
  await page.close();
});

afterAll(async() => {
  await User.deleteMany({googleId: {$exists: false}});
  await Blog.deleteMany({title: 'Test title'});
});

describe('When logged in', async () => {
  beforeEach(async () => {
    await page.login();
    await page.click('a.btn-floating');
  });
  test('Can see blog create form', async () => {
    const label = await page.getContentsOf('form label');
    expect(label).toEqual('Blog Title');
  });
  describe('And using valid inputs', async () => {
    beforeEach(async () => {
      await page.type('.title input', 'Test title');
      await page.type('.content input', 'Test content');
      await page.click('form button');
    });
    test('Submitting takes user to review screen', async () => {
      const text = await page.getContentsOf('h5');
      expect(text).toEqual('Please confirm your entries');
    });
    test('Submitting then saving adds blog to index page', async () => {
      await page.click('button.green');
      await page.waitFor('.card');
      const title = await page.getContentsOf('.card-title');
      const content = await page.getContentsOf('p');
      expect(title).toEqual('Test title');
      expect(content).toEqual('Test content');
    });
  });
  describe('And using invalid inputs', async () => {
    beforeEach(async () => {
      await page.click('form button');
    });
    test('The form shows an error message', async () => {
      const titleError = await page.getContentsOf('.title .red-text'); 
      const contentError = await page.getContentsOf('.content .red-text'); 
      expect(titleError).toEqual('You must provide a value');
      expect(contentError).toEqual('You must provide a value');
    });
  });
});

describe('When is not logged in', async () => {
  test('User cannot create blog posts', async () => {
    const result = await page.evaluate(
      () => {
        const response = fetch('/api/blogs', {
          method: 'POST',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            title: 'My title',
            content: 'My content'
          }),
        }).then(res => res.json());
        return response;
      }
    );
    expect(result.error).toEqual('You must log in!');
  });
  test('User cannot get blogs', async () => {
    const result = await page.evaluate(
      () => {
        const response = fetch('/api/blogs', {
          method: 'GET',
          credentials: 'same-origin',
          headers: {
            'Content-Type': 'application/json'
          },
        }).then(res => res.json());
        return response;
      }
    );
    expect(result.error).toEqual('You must log in!');
  });
});
