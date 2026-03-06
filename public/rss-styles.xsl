<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet version="3.0" xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
  xmlns:atom="http://www.w3.org/2005/Atom">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml" lang="en">
      <head>
        <title><xsl:value-of select="/rss/channel/title"/> - RSS Feed</title>
        <meta charset="utf-8"/>
        <meta name="viewport" content="width=device-width, initial-scale=1"/>
        <style>
          * { box-sizing: border-box; margin: 0; padding: 0; }
          body {
            font-family: "Inter", system-ui, sans-serif;
            background: #120a2a;
            color: #e8e0f4;
            line-height: 1.7;
            padding: 2rem 1rem;
          }
          .container {
            max-width: 700px;
            margin: 0 auto;
          }
          .banner {
            background: linear-gradient(135deg, #241544, #3b0f3f);
            border: 1px solid rgba(255, 79, 163, 0.3);
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin-bottom: 2rem;
            font-size: 0.9rem;
            color: #c4b5d9;
          }
          .banner strong { color: #ff4fa3; }
          .banner a { color: #ff4fa3; text-decoration: underline; }
          h1 {
            font-size: 1.8rem;
            margin-bottom: 0.25rem;
            color: #fff;
          }
          .description {
            color: #a89cc4;
            margin-bottom: 2rem;
          }
          .post {
            background: rgba(36, 21, 68, 0.6);
            border: 1px solid rgba(255, 255, 255, 0.08);
            border-radius: 8px;
            padding: 1.25rem 1.5rem;
            margin-bottom: 1rem;
            transition: border-color 0.2s;
          }
          .post:hover { border-color: rgba(255, 79, 163, 0.4); }
          .post-title {
            font-size: 1.15rem;
            font-weight: 600;
            margin-bottom: 0.3rem;
          }
          .post-title a {
            color: #fff;
            text-decoration: none;
          }
          .post-title a:hover { color: #ff4fa3; }
          .post-date {
            font-size: 0.8rem;
            color: #8a7da6;
            margin-bottom: 0.5rem;
          }
          .post-description {
            font-size: 0.95rem;
            color: #c4b5d9;
          }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="banner">
            <strong>This is an RSS feed.</strong> Subscribe by copying the URL into your reader.
          </div>
          <h1><xsl:value-of select="/rss/channel/title"/></h1>
          <p class="description"><xsl:value-of select="/rss/channel/description"/></p>
          <xsl:for-each select="/rss/channel/item">
            <div class="post">
              <div class="post-title">
                <a><xsl:attribute name="href"><xsl:value-of select="link"/></xsl:attribute><xsl:value-of select="title"/></a>
              </div>
              <div class="post-date"><xsl:value-of select="pubDate"/></div>
              <div class="post-description"><xsl:value-of select="description"/></div>
            </div>
          </xsl:for-each>
        </div>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet>
