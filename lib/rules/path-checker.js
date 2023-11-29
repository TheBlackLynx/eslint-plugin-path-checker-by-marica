/**
 * @fileoverview feature sliced relative path checker
 * @author marica
 */
"use strict";
const { log } = require('console');
const path = require('path');
const { isRelativePath } = require('./helpers/index');
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem', 
    docs: {
      description: "feature sliced relative path checker",
      recommended: false,
      url: null, 
    },
    fixable: 'code', 
    schema: [{
      type: 'object',
      properties: {
          alias: {
            type: 'string'
          }
      }
    }], 
    messages: {
      avoidName: "All pathes should  be relative in one slice"
  }
  },

  create(context) {
    const alias = context.options[0]?.alias || '';

    return {
      ImportDeclaration(node) {
        //example app/entity/Article
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value ;
        //example C:\Users\marica......Article.tsx
        const filename = context.getFilename();
        if (shouldBeRelative(filename, importTo)) {
          context.report({
            node,
            messageId: "avoidName",
            fix: (fixer) => {
              const normalizedPath = getNormalizeCurrentFilePath(filename)
              .split('/')
              .slice(0, -1)
              .join('/');

              let relativePath = path.relative(normalizedPath, `/${importTo}`);
              
              try {
                relativePath.split('\\').join('/');
              }
              catch{}

              if (!relativePath.startsWith('.')) {
                relativePath = './' + relativePath;
              }
              return fixer.replaceText(node.source, `'${relativePath}'`)
            }
        });
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
 function getNormalizeCurrentFilePath(currentPath) {
  const normalizedPath = path.toNamespacedPath(currentPath);
  const projectFrom = normalizedPath.split('src')[1];
  
  try {
    projectFrom.split('\\').join('/')
  }
  catch {

  }
  return projectFrom;
 }

function shouldBeRelative(from, to) {
  if(isRelativePath(to)) {
    return false;
  }

  // example entities/Article
  const toArray = to.split('/')
  const toLayer = toArray[0]; // entities
  const toSlice = toArray[1]; // Article

  if(!toLayer || !toSlice || !layers[toLayer]) {
    return false;
  }


  const projectFrom = getNormalizeCurrentFilePath(from);
  const fromArray = projectFrom.split('/')

  const fromLayer = fromArray[1];
  const fromSlice = fromArray[2];

  if(!fromLayer || !fromSlice || !layers[fromLayer]) {
    return false;
  }

  return fromSlice === toSlice && toLayer === fromLayer;
}
console.log(shouldBeRelative('C:\\Users\\tim\\Desktop\\javascript\\production_project\\src\\entities\\Article', '../../model/slices/addCommentFormSlice'))