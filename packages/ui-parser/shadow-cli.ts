#!/usr/bin/env bun

import {
  analyzeDomComponents,
  mergeAnalysisResults,
  generateCSS,
  transformComponents,
  loadClassObject
} from './shadow-analyzer';

// Обрабатываем аргументы командной строки
const command = process.argv[2];

async function main() {
  switch (command) {
    case 'analyze':
      console.log('Analyzing components via Shadow DOM...');
      try {
        const results = await analyzeDomComponents();
        console.log(`Analyzed ${results.length} class occurrences from components`);
      } catch (error) {
        console.error('Error during analysis:', error);
      }
      break;
      
    case 'merge':
      console.log('Merging analysis results...');
      try {
        const mergedObject = mergeAnalysisResults();
        console.log(`Updated class object with ${Object.keys(mergedObject).length} unique class entries`);
      } catch (error) {
        console.error('Error during merge:', error);
      }
      break;
      
    case 'generate':
      console.log('Generating CSS from class object...');
      try {
        const classObject = loadClassObject();
        const css = generateCSS(classObject);
        console.log(`Generated CSS for ${Object.keys(classObject).length} classes`);
      } catch (error) {
        console.error('Error during CSS generation:', error);
      }
      break;
      
    case 'transform':
      console.log('Transforming components with semantic and quark classes...');
      try {
        transformComponents();
        console.log('Components transformation completed');
      } catch (error) {
        console.error('Error during component transformation:', error);
      }
      break;
      
    case 'all':
      console.log('Running full analysis and transformation pipeline...');
      try {
        console.log('\n[Step 1/4] Analyzing components via Shadow DOM...');
        const results = await analyzeDomComponents();
        console.log(`Analyzed ${results.length} class occurrences from components`);
        
        console.log('\n[Step 2/4] Merging analysis results...');
        const mergedObject = mergeAnalysisResults();
        console.log(`Updated class object with ${Object.keys(mergedObject).length} unique class entries`);
        
        console.log('\n[Step 3/4] Generating CSS from class object...');
        const css = generateCSS(mergedObject);
        console.log(`Generated CSS for ${Object.keys(mergedObject).length} classes`);
        
        console.log('\n[Step 4/4] Transforming components...');
        transformComponents();
        console.log('Components transformation completed');
        
        console.log('\nAll steps completed successfully!');
      } catch (error) {
        console.error('Error during pipeline execution:', error);
      }
      break;
      
    default:
      console.log(`
Shadow DOM Analyzer and Transformer

Commands:
  analyze    - Analyze components via Shadow DOM and extract classes
  merge      - Merge analysis results with existing class object
  generate   - Generate CSS from class object
  transform  - Transform components with semantic and quark classes
  all        - Run the full analysis and transformation pipeline
      `);
  }
}

main().catch(console.error); 