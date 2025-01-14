jest.setTimeout(15 * 1000)

const { port } = require("../jest-puppeteer.config").server

const siteRoot = `http://localhost:${port}`

describe("main site", () => {
  beforeAll(async () => {
    await page.goto(siteRoot)
  })

  it("should have Quarkus on it somewhere", async () => {
    await expect(
      page.waitForXPath(`//*[text()="Quarkus"]`)
    ).resolves.toBeTruthy()
  })

  it("should have Quarkiverse on it somewhere", async () => {
    await expect(
      page.waitForXPath(`//*[text()="Welcome to the Quarkiverse"]`)
    ).resolves.toBeTruthy()
  })

  describe("extensions list", () => {
    it("should have a well-known non-platform extension", async () => {
      await expect(
        page.waitForXPath('//*[text()="RabbitMQ Client"]')
      ).resolves.toBeTruthy()
    })

    it("should have more than one well-known non-platform extension", async () => {
      await expect(
        page.waitForXPath('//*[text()="GitHub App"]')
      ).resolves.toBeTruthy()
    })

    xit("should have a well-known platform extension", async () => {
      await expect(
        page.waitForXPath('//*[text()="RESTEasy Reactive"]')
      ).resolves.toBeTruthy()
    })

    xit("should have more than one well-known platform extension", async () => {
      await expect(
        page.waitForXPath('//*[text()="gRPC"]')
      ).resolves.toBeTruthy()
    })

    describe("filters", () => {
      it("should should filter out extensions when the search bar is used", async () => {
        // Sense check - is the thing we wanted there to start with
        await expect(
          page.waitForXPath('//*[text()="RabbitMQ Client"]')
        ).resolves.toBeTruthy()
        await expect(
          page.waitForXPath('//*[text()="GitHub App"]')
        ).resolves.toBeTruthy()

        await page.focus('input[name="search-regex"]')
        await page.keyboard.type("Rabbit")

        // RabbitMQ should still be there ...
        await expect(
          page.waitForXPath('//*[text()="RabbitMQ Client"]')
        ).resolves.toBeTruthy()
        // ... but others should be gone
        let visible = true
        await page
          .waitForXPath('//*[text()="GitHub App"]', { timeout: 2000 })
          .catch(() => {
            visible = false
          })
        expect(visible).toBeFalsy()
      })
    })

    describe("header navigation bar", () => {
      it("should have a Guides option", async () => {
        await expect(
          page.waitForXPath('//*[text()="Guides"]')
        ).resolves.toBeTruthy()
      })

      it("should have a Support option", async () => {
        await expect(
          page.waitForXPath('//*[text()="Support"]')
        ).resolves.toBeTruthy()
      })
    })
  })
})
