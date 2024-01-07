const TEST_URL: string = "http:/localhost:5173";

describe('Webpage is Up', () => {
  it('finds homepage', () => {
    cy.visit(TEST_URL);
    cy.contains("ReShop");
  })
})