const yaml = require('js-yaml');
const { DateTime } = require('luxon');
const htmlmin = require('html-minifier');
// const Image = require('@11ty/eleventy-img');
const markdownIt = require('markdown-it');

const {
  imageShortcode,
  backgroundImageShortcode,
} = require('./tooling/images');

// ======================================================================
// 11ty config!
// ======================================================================
module.exports = function (eleventyConfig) {
  // See
  // https://www.11ty.dev/docs/languages/markdown/#there-are-extra-and-in-my-output
  // and https://github.com/11ty/eleventy/issues/2438 regarding disabling
  // indented code blocks by default.  This *isn't* a code-rendering site, so
  // there's no value in the indented code support!
  eleventyConfig.setLibrary(
    'md',
    markdownIt({
      html: true,
      breaks: false,
      linkify: true,
    }).disable('code')
  );

  // Disable automatic use of your .gitignore
  eleventyConfig.setUseGitIgnore(false);

  // Merge data instead of overriding
  eleventyConfig.setDataDeepMerge(true);

  // human readable date
  eleventyConfig.addFilter('readableDate', (dateObj) => {
    return DateTime.fromJSDate(dateObj, { zone: 'utc' }).toFormat(
      'dd LLL yyyy'
    );
  });

  eleventyConfig.addShortcode('year', () =>
    new Date().getFullYear().toString()
  );

  // Allow YAML everywhere that JSON is supported.
  eleventyConfig.addDataExtension('yaml', (contents) => yaml.load(contents));

  // Set up image processing...
  eleventyConfig.addNunjucksAsyncShortcode('image', imageShortcode);
  eleventyConfig.addLiquidShortcode('image', imageShortcode);
  eleventyConfig.addJavaScriptFunction('image', imageShortcode);

  eleventyConfig.addNunjucksAsyncShortcode(
    'backgroundImage',
    backgroundImageShortcode
  );
  eleventyConfig.addLiquidShortcode(
    'backgroundImage',
    backgroundImageShortcode
  );
  eleventyConfig.addJavaScriptFunction(
    'backgroundImage',
    backgroundImageShortcode
  );

  // Netlify CMS gets transformed for local vs. production...
  const cmsConfig = `./src/admin/config${
    (process.env.NODE_ENV || 'development') === 'development' ? '.dev' : ''
  }.yml`;
  eleventyConfig.addPassthroughCopy({
    [cmsConfig]: './admin/config.yml',
  });

  // copy dependency files to /_site
  eleventyConfig.addPassthroughCopy({
    'node_modules/alpinejs/dist/cdn.min.js': 'static/js/alpine.js',
  });

  // copy media folder to /_site
  eleventyConfig.addPassthroughCopy('src/static/media');

  // copy favicon folder to /_site (and special copy for '/favicon.ico')
  eleventyConfig.addPassthroughCopy({
    'src/static/favicon/favicon.ico': 'favicon.ico',
  });
  eleventyConfig.addPassthroughCopy('src/static/favicon');

  // Copy favicon to route of /_site
  eleventyConfig.addPassthroughCopy('src/favicon.ico');

  // Minify HTML
  eleventyConfig.addTransform('htmlmin', function (content, outputPath) {
    // Eleventy 1.0+: use this.inputPath and this.outputPath instead
    if (outputPath.endsWith('.html')) {
      let minified = htmlmin.minify(content, {
        useShortDoctype: true,
        removeComments: true,
        collapseWhitespace: true,
      });
      return minified;
    }

    return content;
  });

  // Let Eleventy transform HTML files as nunjucks
  // So that we can use .html instead of .njk
  return {
    dir: {
      input: 'src',
    },
    // dataTemplateEngine: 'njk',
    htmlTemplateEngine: 'njk',
    markdownTemplateEngine: 'njk',
  };
};
