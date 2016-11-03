import { Angular2BabylonjsPage } from './app.po';

describe('angular2-babylonjs App', function() {
  let page: Angular2BabylonjsPage;

  beforeEach(() => {
    page = new Angular2BabylonjsPage();
  });

  it('should display message saying app works', () => {
    page.navigateTo();
    expect(page.getParagraphText()).toEqual('app works!');
  });
});
