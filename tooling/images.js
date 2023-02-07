// 11ty helper functionality
const Image = require('@11ty/eleventy-img');

async function imageShortcode(src, alt = '', sizes = '100vw', options = {}) {
  let metadata = await Image(src, {
    widths: [null, 1280, 1024, 600],
    formats: ['webp', 'jpg'],
    outputDir: './_site/static/img/',
    urlPath: '/static/img/',
  });

  // console.log("\n\nMETADATA:", metadata, "\n\n");

  // Wy can't we generate the "sizes" part here? or default to "100%" or "100vw"
  const attributes = {
    alt,
    sizes,
    loading: 'lazy',
    decoding: 'async',
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
  let attrHtml = Object.entries(attrs)
    .map((entry) => {
      let [key, value] = entry;
      // hack: remove width/height on img to allow 100% width...
      if (key === 'width' || key === 'height') {
        return '';
      }
      return `${key}="${value}"`;
    })
    .join(' ');

  return `<${tagName}${attrHtml ? ` ${attrHtml}` : ''}>`;
}

// The exported Image.generateHTML does not provide a means to tweak the
// elements much... this adds that.
function generateBetterHTML(metadata, attributes, options = {}) {
  // let isInline = options.whitespaceMode !== "block";
  const isInline = true;
  let markup = [];

  const obj = Image.generateObject(metadata, attributes, options);

  // obj is either { img: {...} }, or { picture: [...] }; we apply top-level
  // options either way.
  for (let tag in obj) {
    if (!Array.isArray(obj[tag])) {
      const attrs = { ...obj[tag] };
      if (options?.class) {
        attrs.class = `${attrs.class}${attrs.class ? ' ' : ''}${options.class}`;
      }
      if (options?.style) {
        attrs.style = `${attrs.style}${attrs.style ? ' ' : ''}${options.style}`;
      }
      markup.push(mapObjectToHTML(tag, obj[tag]));
    } else {
      markup.push(
        `<${tag}${options?.class ? ` class="${options.class}"` : ''}${
          options?.style ? ` style="${options.style}"` : ''
        }>`
      );
      for (let child of obj[tag]) {
        let childTagName = Object.keys(child)[0];
        markup.push(
          (!isInline ? '  ' : '') +
            mapObjectToHTML(childTagName, child[childTagName])
        );
      }
      markup.push(`</${tag}>`);
    }
  }
  return markup.join(!isInline ? '\n' : '');
}

async function backgroundImageShortcode(src, quote = "'") {
  let metadata = await Image(src, {
    widths: [1280],
    formats: ['webp', 'jpeg'],
    outputDir: './_site/static/img/',
    urlPath: '/static/img/',
  });

  const formats = Object.keys(metadata);

  const imageSet = formats
    .map((format) => {
      const url = metadata[format][0].url;
      return `url(${quote}${url}${quote}) type(${quote}image/${format}${quote})`;
    })
    .join(', ');

  // Many browsers don't support the "by type", so we include non-image-set as
  // well...
  const bgImageKinds = [
    `url(${metadata.jpeg[0].url})`,
    `-webkit-image-set(${imageSet})`,
    `image-set(${imageSet})`,
  ];

  return bgImageKinds.map((kind) => `background-image: ${kind};`).join(' ');
}

module.exports = {
  imageShortcode,
  backgroundImageShortcode,
};
