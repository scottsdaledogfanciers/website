const yaml = require('js-yaml');
const { DateTime } = require('luxon');
const htmlmin = require('html-minifier');
const Image = require('@11ty/eleventy-img');

async function imageShortcode(src, alt, sizes, options={}) {
  let metadata = await Image(src, {
    widths: [null, 1280, 1024, 600],
    formats: ["webp", "jpg"],
    outputDir: './_site/static/img/',
    urlPath: '/static/img/'
  });

  // console.log("\n\nMETADATA:", metadata, "\n\n");

  // Wy can't we generate the "sizes" part here? or default to "100%" or "100vw"
  const attributes = {
    alt,
    sizes,
    loading: "lazy",
    decoding: "async",
  };

  // console.log("\n\nIMAGE INFO:", imageAttributes, "\n\n");
  // const imgObj = Image.generateObject(metadata, imageAttributes)

  // console.log("\n\nIMAGE OBJ:", imgObj, "\n\n");

  // You bet we throw an error on missing alt in `imageAttributes` (alt="" works okay)
  // return Image.generateHTML(metadata, imageAttributes);
  // return htmlFromObject(imgObj);
  return generateBetterHTML(metadata, attributes, options);
}

// lifted from 11ty/image
function mapObjectToHTML(tagName, attrs = {}) {
  let attrHtml = Object.entries(attrs).map(entry => {
    let [key, value] = entry;
    // hack: remove width/height on img to allow 100% width...
    if (key === 'width' || key === 'height') { return ''; }
    return `${key}="${value}"`;
  }).join(" ");

  return `<${tagName}${attrHtml ? ` ${attrHtml}` : ""}>`;
}

// The exported Image.generateHTML does not provide a means to tweak the
// elements much... this adds that.
function generateBetterHTML(metadata, attributes, options={}) {
  // let isInline = options.whitespaceMode !== "block";
  const isInline = true;
  let markup = [];

  const obj = Image.generateObject(metadata, attributes, options);

  // obj is either { img: {...} }, or { picture: [...] }; we apply top-level
  // options either way.
  for(let tag in obj) {
    if(!Array.isArray(obj[tag])) {
      const attrs = { ...obj[tag] };
      if (options?.class) {
        attrs.class = `${attrs.class}${attrs.class ? ' ' : ''}${options.class}`
      }
      if (options?.style) {
        attrs.style = `${attrs.style}${attrs.style ? ' ' : ''}${options.style}`
      }
      markup.push(mapObjectToHTML(tag, obj[tag]));
    } else {
      markup.push(`<${tag}${options?.class ? ` class="${options.class}"` : ''}${options?.style ? ` style="${options.style}"` : ''}>`);
      for(let child of obj[tag]) {
        let childTagName = Object.keys(child)[0];
        markup.push((!isInline ? "  " : "") + mapObjectToHTML(childTagName, child[childTagName]));
      }
      markup.push(`</${tag}>`);
    }
  }
  return markup.join(!isInline ? "\n" : "");
}

async function backgroundImageShortcode(src, quote="'") {
  let metadata = await Image(src, {
    widths: [1280],
    formats: ["webp", "jpeg"],
    outputDir: './_site/static/img/',
    urlPath: '/static/img/'
  });

  const formats = Object.keys(metadata);

  const imageSet = formats.map(format => {
    const url = metadata[format][0].url
    return `url(${quote}${url}${quote}) type(${quote}image/${format}${quote})`
  }).join(", ");

  // Many browsers don't support the "by type", so we include non-image-set as
  // well...
  const bgImageKinds = [
    `url(${metadata.jpeg[0].url})`,
    `-webkit-image-set(${imageSet})`,
    `image-set(${imageSet})`,
  ];

  return bgImageKinds.map(kind => `background-image: ${kind};`).join(" ");
}


module.exports = function (eleventyConfig) {
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

  eleventyConfig.addShortcode('year', () => new Date().getFullYear().toString());

  // eleventyConfig.addNunjucksGlobal('year', new Date().getFullYear().toString());

  // Allow YAML everywhere that JSON is supported.
  eleventyConfig.addDataExtension('yaml', (contents) => yaml.load(contents));

  // Set up image processing...
  eleventyConfig.addNunjucksAsyncShortcode("image", imageShortcode);
  eleventyConfig.addLiquidShortcode("image", imageShortcode);
  eleventyConfig.addJavaScriptFunction("image", imageShortcode);

  eleventyConfig.addNunjucksAsyncShortcode("backgroundImage", backgroundImageShortcode);
  eleventyConfig.addLiquidShortcode("backgroundImage", backgroundImageShortcode);
  eleventyConfig.addJavaScriptFunction("backgroundImage", backgroundImageShortcode);

  // Copy Static Files to /_Site

  eleventyConfig.addPassthroughCopy({
    './node_modules/alpinejs/dist/cdn.min.js': './static/js/alpine.js',
    './node_modules/prismjs/themes/prism-tomorrow.css':
      './static/css/prism-tomorrow.css',
  });

  // Netlify CMS gets transformed for local vs. production...
  const cmsConfig = `./src/admin/config${(process.env.NODE_ENV || 'development') === 'development' ? '.dev' : ''}.yml`;
  eleventyConfig.addPassthroughCopy(
    {
      [cmsConfig]: './admin/config.yml',
    }
  );

  // Copy Image Folder to /_site
  eleventyConfig.addPassthroughCopy('./src/static/media');

  // Copy favicon to route of /_site
  eleventyConfig.addPassthroughCopy('./src/favicon.ico');

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
