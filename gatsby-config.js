module.exports = {
  pathPrefix: "extensions.io",

  siteMetadata: {
    title: `Welcome to the Quarkiverse`,
    author: {
      name: `The Quarkus Team`,
      summary: `who are nice.`,
    },
    description: `A prototype extensions cataloge.`,
    siteUrl: `http://hollycummins.com/extensions.io`,
    social: {
      twitter: `quarkusio`,
    },
  },
  plugins: [
    `gatsby-plugin-image`,
    {
      resolve: `gatsby-source-filesystem`,
      options: {
        name: `images`,
        path: `${__dirname}/src/images`,
      },
    },
    {
      resolve: `gatsby-transformer-remark`,
      options: {
        plugins: [
          {
            resolve: `gatsby-remark-images`,
            options: {
              maxWidth: 630,
            },
          },
          {
            resolve: `gatsby-remark-responsive-iframe`,
            options: {
              wrapperStyle: `margin-bottom: 1.0725rem`,
            },
          },
          `gatsby-remark-prismjs`,
          `gatsby-remark-copy-linked-files`,
          `gatsby-remark-smartypants`,
        ],
      },
    },
    `gatsby-transformer-sharp`,
    `gatsby-plugin-sharp`,
    {
      resolve: `gatsby-plugin-feed`,
      options: {
        query: `
          {
            site {
              siteMetadata {
                title
                description
                siteUrl
                site_url: siteUrl
              }
            }
          }
        `,
        feeds: [
          {
            serialize: ({ query: { site, allExtension } }) => {
              return allExtension.nodes.map(node => {
                return Object.assign({}, node.name, {
                  description: node.excerpt,
                  url: site.siteMetadata.siteUrl + node.slug,
                  guid: site.siteMetadata.siteUrl + node.slug,
                  custom_elements: [{ "content:encoded": node.html }],
                })
              })
            },
            query: `
              {
                allExtension(
                  sort: { order: DESC, fields: [name] },
                ) {
                  nodes {
                    slug
                    name
                    description
                  }                  
                }
              }
            `,
            output: "/rss.xml",
            title: "Quarkus Extensions RSS Feed",
          },
        ],
      },
    },
    {
      resolve: `gatsby-plugin-manifest`,
      options: {
        name: `Quarkus Extensions`,
        short_name: `Extensions`,
        start_url: `/`,
        background_color: `#ffffff`,
        // This will impact how browsers show your PWA/website
        // https://css-tricks.com/meta-theme-color-and-trickery/
        // theme_color: `#663399`,
        display: `minimal-ui`,
        icon: `src/images/quarkus-logo-black-background.png`, // This path is relative to the root of the site.
      },
    },
    `gatsby-plugin-fontawesome-css`,
    "gatsby-plugin-styled-components",
  ],
}
