import React from "react"
import { fireEvent, render, screen } from "@testing-library/react"
import userEvent from "@testing-library/user-event"
import ExtensionsList from "./extensions-list"
import selectEvent from "react-select-event"

describe("extension list", () => {
  const category = "jewellery"
  const displayCategory = "Jewellery"
  const otherCategory = "snails"

  const ruby = {
    name: "JRuby",
    sortableName: "ruby",
    slug: "jruby-slug",
    metadata: { categories: [category] },
    platforms: ["bottom of the garden"],
  }
  const diamond = {
    name: "JDiamond",
    sortableName: "diamond",
    slug: "jdiamond-slug",
    metadata: { categories: [category] },
    platforms: ["a mine"],
  }

  const molluscs = {
    name: "Molluscs",
    sortableName: "mollusc",
    slug: "molluscs-slug",
    metadata: { categories: [otherCategory] },
    platforms: ["bottom of the garden"],
  }

  const extensions = [ruby, diamond, molluscs]
  const user = userEvent.setup()

  beforeEach(() => {
    render(<ExtensionsList extensions={extensions} />)
  })

  it("renders the extension name", () => {
    expect(screen.getByText(extensions[0].name)).toBeTruthy()
  })

  it("renders the correct link", () => {
    const link = screen.getAllByRole("link")[2] // Look at the third one - this is also testing the sorting
    expect(link).toBeTruthy()
    // Hardcoding the host is a bit risky but this should always be true in  test environment
    expect(link.href).toBe("http://localhost/jruby-slug")
  })

  describe("searching and filtering", () => {
    describe("searching", () => {
      it("filters out extensions which do not match the search filter", async () => {
        const searchInput = screen.getByRole("textbox")
        await user.click(searchInput)
        await user.keyboard("octopus")
        expect(screen.queryByText(ruby.name)).toBeFalsy()
      })

      it("leaves in extensions which match the search filter", async () => {
        const searchInput = screen.getByRole("textbox")
        await user.click(searchInput)
        await user.keyboard("Ruby")
        expect(screen.queryByText(ruby.name)).toBeTruthy()
      })

      it("is case insensitive in its searching", async () => {
        const searchInput = screen.getByRole("textbox")
        await user.click(searchInput)
        await user.keyboard("ruby")
        expect(screen.queryByText(ruby.name)).toBeTruthy()
      })
    })

    describe("category filter", () => {
      it("has a list of categories", async () => {
        expect(screen.queryAllByText(displayCategory)).toHaveLength(1) // One for the filter, and in the card the name is concatenated with something else
      })

      it("leaves in extensions which match category filter", async () => {
        fireEvent.click(screen.getByText(displayCategory))

        expect(screen.queryByText(ruby.name)).toBeTruthy()
        expect(screen.queryByText(diamond.name)).toBeTruthy()
      })

      it("filters out extensions which do not match the ticked category", async () => {
        fireEvent.click(screen.getByText(displayCategory))

        expect(screen.queryByText(molluscs.name)).toBeFalsy()
      })
    })

    describe("platform filter", () => {
      const label = "Platform"

      it("lists all the platforms in the menu", async () => {
        // Don't look at what happens, just make sure the options are there
        await selectEvent.select(screen.getByLabelText(label), "A Mine")
        await selectEvent.select(
          screen.getByLabelText(label),
          "Bottom Of The Garden"
        )
      })

      it("leaves in extensions which match search filter and filters out extensions which do not match", async () => {
        expect(screen.queryByText(ruby.name)).toBeTruthy()
        expect(screen.queryByText(diamond.name)).toBeTruthy()
        expect(screen.queryByText(molluscs.name)).toBeTruthy()

        expect(screen.getByTestId("platform-form")).toHaveFormValues({
          platform: "",
        })
        await selectEvent.select(screen.getByLabelText(label), "A Mine")

        expect(screen.queryByText(ruby.name)).toBeFalsy()
        expect(screen.queryByText(diamond.name)).toBeTruthy()
        expect(screen.queryByText(molluscs.name)).toBeFalsy()
      })
    })
  })
})
