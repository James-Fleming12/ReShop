const TEST_URL = process.env.SITE_URL;

describe('Webpage is Up', () => {
  it('finds homepage', () => {
    cy.visit(TEST_URL);
    cy.contains("ReShop");
  })
})