import * as React from "react"
import { StaticImage } from "gatsby-plugin-image"
import styled from "styled-components"

const Element = styled.div`
  width: 224px;
  padding-top: 36px;
  display: flex;
  flex-direction: column;
  justify-content: flex-start;
  align-items: center;
`

const PlatformFilter = () => {
  return (
    <Element>
      <StaticImage
        className="fake-content"
        layout="constrained"
        formats={["auto", "webp", "avif"]}
        src="../../images/platformfilter.png"
        width={282}
        alt="A filter"
      />
    </Element>
  )
}

export default PlatformFilter