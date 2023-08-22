/**
 * @fileoverview feature sliced relative path checker
 * @author marica
 */
"use strict";
const { log } = require('console');
const path = require('path');
const { isRelativePath } = require('./helpers/index');
const micromatch = require('micromatch')
//------------------------------------------------------------------------------
// Rule Definition
//------------------------------------------------------------------------------

/** @type {import('eslint').Rule.RuleModule} */
module.exports = {
  meta: {
    type: 'problem',
    docs: {
      description: "control for using ",
      recommended: false,
      url: null,
    },
    fixable: null,
    schema: [{
      type: 'object',
      properties: {
        alias: {
          type: 'string'
        },
        ignoreImportPatterns: {
          type: 'array'
        }
      }
    }],
    messages: {
      layerImportError: "Layer can be import inside only underlaying layers (shared, entities, features, widgets, pages, app)"
    }
  },

  create(context) {
    const { alias = '', ignoreImportPatterns = [] } = context.options[0] ?? {};
    const layers = {
      'app': ['pages', 'widgets', 'features', 'shared', 'entities'],
      'pages': ['widgets', 'features', 'shared', 'entities'],
      'widgets': ['features', 'shared', 'entities'],
      'features': ['shared', 'entities'],
      'entities': ['shared', 'entities'],
      'shared': ['shared'],
    }

    const availableLayers = {
      'app': 'app',
      'entities': 'entities',
      'features': 'features',
      'shared': 'shared',
      'pages': 'pages',
      'widgets': 'widgets',
    }


    const getCurrentFileLayer = () => {
      const currentFilePath = context.getFilename();

      const normalizedPath = path.toNamespacedPath(currentFilePath);
      const projectPath = normalizedPath?.split('src')[1];
      const segments = projectPath?.split('/');
      return segments?.[1]
    }

    const getImportLayer = (value) => {
      const importPath = alias ? value.replace(`${alias}/`, '') : value;
      const segments = importPath?.split('/');
      return segments?.[0];
    }

    return {
      ImportDeclaration(node) {
        //example app/entity/Article
        const importPath = node.source.value;

        const currentFileLayer = getCurrentFileLayer();
        const importLayer = getImportLayer(importPath);

        if (isRelativePath(importLayer)) {
          return;
        }

        if (!availableLayers[importLayer] || !availableLayers[currentFileLayer]) {
          return;
        }

        const isIgnored = ignoreImportPatterns.some(pattern => {
          return micromatch.isMatch(importPath, pattern)
        })

        if (isIgnored) {
          return;
        }
        if(!layers[currentFileLayer]?.includes(importLayer)) {
          context.report(node, 'Слой может импортировать в себя только нижележащие слои (shared, entities, features, widgets, pages, app)');
        }
        // if (!layers[currentFileLayer]?.includes(importLayer)) {
        //   context.report({
        //     node,
        //     messageId: "layerImportError",
        //   });
        // }
      }
    };
  }
}
