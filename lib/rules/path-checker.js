/**
 * @fileoverview feature sliced relative path checker
 * @author marica
 */
"use strict";
const path = require('path');

//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: null, // `problem`, `suggestion`, or `layout`
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, // URL to the documentation page for this rule
    },
    fixable: null, // Or `code` or `whitespace`
    schema: [], // Add a schema if the rule has options
  },

  create(context) {

    return {
      ImportDeclaration(node) {
        //example app/entity/Article
        const importTo = node.source.value;
        //example C:\Users\marica......Article.tsx
        const filename = context.getFilename();
        if (!shouldBeRelative(importTo, filename)) {
          context.report(node, 'All pathes should  be relative in one slice')
        }

      }
    };
  },
};
const layers = {
  'entities': 'entities',
  'widgets': 'widgets',
  'shared': 'shared',
  'pages': 'pages',
  'features': 'features'
}
function isRelativePath(path) {
  return path === '.' || path.startsWith('./') || path.startsWith('../')
}

function shouldBeRelative(to, from) {
  try {
    if (isRelativePath(to)) {
      return false;
    }
    const toArray = to.split(path.sep);
    const toLayer = toArray[0];
    const toSlice = toArray[1];

    if (!toLayer || !toSlice || !layers[toLayer]) {
      return false;
    }

    const normalizePath = path.toNamespacedPath(from);
    const projectFrom = normalizePath.split('src')[1];
    const fromArray = projectFrom.split(path.sep);
    const fromLayer = fromArray[1];
    const fromSlice = fromArray[2];
    if (!fromLayer || !fromSlice || !layers[fromLayer]) {
      return false;
    }
    return fromLayer === toLayer && fromSlice === toSlice;
  }
  catch (e) {
    console.log(e);
  }

}
console.log(shouldBeRelative('entities/Article/ui/ArticleImageBlockComponent/ArticleImageBlockComponent', '/Users/marica/Documents/frontend/react_proj/src/entities/Article/ui/ArticleDetails/ArticleDetails.tsx'));
