/**
 * @fileoverview control of public api imports
 * @author marica
 */
"use strict";

const { isRelativePath } = require('./helpers');
const micromatch = require("micromatch");


const PUBLIC_ERROR = 'PUBLIC_ERROR';
const TESTING_PUBLIC_ERROR = 'TESTING_PUBLIC_ERROR';
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------
const layers = {
  'entities': 'entities',
  'widgets': 'widgets',
  'pages': 'pages',
  'features': 'features'
}
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
          },
          testFilePattens: {
            type: 'array'
          },
      }
    }], 
    messages: {
      [PUBLIC_ERROR]: "Absolute import has been is allowed from public api",
      [TESTING_PUBLIC_ERROR]: "Testing data import has been is allowed from testing public api",
  }
  },

  
  create(context) {
    const {alias = '', testFilePattens = [] } = context.options[0] ?? {};

    return {
      ImportDeclaration(node) {
        //example app/entity/Article
        const value = node.source.value;
        const importTo = alias ? value.replace(`${alias}/`, '') : value ;
        if (isRelativePath(importTo)) {
          return;
        }

        const segments = importTo.split('/');

        const layer = segments[0];
        const slice = segments[1];
        const isImportNotFromublicApi = segments.length > 2;

        const isTesting = segments[2] === 'testing' && segments.length < 4;
        //example C:\Users\marica......Article.tsx
        const currentFilename = context.getFilename();

        const isCurrentFileTesting = testFilePattens.some(
          pattern => micromatch.isMatch(currentFilename, pattern)
      )
        if (!layers[segments[0]]){
          return
        }
        if (isImportNotFromublicApi && !isTesting) {
          context.report({
            node,
            messageId: PUBLIC_ERROR,
            fix: (fixer) => {
              return fixer.replaceText(node.source, `'${alias}/${layer}/${slice}`)
            }
        });
        }
        if (isTesting) {
          if (!isCurrentFileTesting) {
            context.report({
              node,
              messageId: TESTING_PUBLIC_ERROR,
          });
          }
        }
       
      
       

      }
    };
  },
}




