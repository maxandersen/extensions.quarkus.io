jest.setTimeout(5 * 60 * 1000)

const link = require("linkinator")
const status = require("http-status")
const { curly } = require("node-libcurl")
const promiseRetry = require("promise-retry")

const config = require("../gatsby-config.js")

describe("site links", () => {
  const deadExternalLinks = []
  const deadInternalLinks = []

  beforeAll(async () => {
    const path = "http://localhost:9000"

    // create a new `LinkChecker` that we'll use to run the scan.
    const checker = new link.LinkChecker()

    // After a page is scanned, check out the results!
    checker.on("link", async result => {
      if (result.state === "BROKEN") {
        // Don't stress about 403s from vimeo because humans can get past the paywall fairly easily and we want to have the link
        const isPaywalled =
          result.status === status.FORBIDDEN && result.url.includes("vimeo")

        let retryWorked
        if (result.url.includes("twitter")) {
          // Twitter gives 404s, I think if it feels bombarded, so let's try a retry
          retryWorked = await retryUrl(result.url)
        }
        if (!retryWorked && !isPaywalled) {
          const errorText =
            result.failureDetails[0].statusText || result.failureDetails[0].code
          const description = `${result.url} => ${result.status} (${errorText}) on ${result.parent}`
          if (result.url.includes(path)) {
            // This will still miss links where the platform uses the configured url to make it an absolute path, but hopefully we don't care
            // too much about the categorisation as long as *a* break happens
            if (!deadInternalLinks.includes(description)) {
              deadInternalLinks.push(description)
            }
          } else {
            if (!deadExternalLinks.includes(description)) {
              deadExternalLinks.push(description)
            }
          }
        }
      }
    })

    const linksToSkip = ["https://twitter.com/quarkusio"]

    // Go ahead and start the scan! As events occur, we will see them above.
    return await checker.check({
      path,
      recurse: true,
      linksToSkip,
      urlRewriteExpressions: [
        {
          pattern: config.siteUrl,
          replacement: "http://localhost:9000",
        },
        {
          pattern: config.pathPrefix,
          replacement: "",
        },
      ],
      concurrency: 100, // The twitter URLs seem to work better with a high concurrency, counter-intuitively
      timeout: 30 * 1000,
    })
  })

  it("internal links should all resolve", async () => {
    expect(deadInternalLinks).toEqual([])
  })

  it("external links should all resolve", async () => {
    expect(deadExternalLinks).toEqual([])
  })
})

const retryUrl = async url => {
  const hitUrl = async retry => {
    // Use a different client, which seems less affected by the 404s from twitter
    const { statusCode } = await curly.get(url)

    if (status[`${statusCode}_CLASS`] !== status.classes.SUCCESSFUL) {
      return retry(statusCode)
    }
  }
  return promiseRetry(hitUrl, { retries: 4, minTimeout: 4 * 1000 })
    .then(() => true)
    .catch(() => false)
}
