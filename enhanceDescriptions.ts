#!/usr/bin/env bun

import { generateDescription } from "./generateDescriptions";
import { parse } from "csv-parse/sync";
import { stringify } from "csv-stringify/sync";
import * as fs from "fs";

async function enhanceDescriptions(inputFile: string, outputFile: string) {
  console.log(`📖 Reading ${inputFile}...`);
  const csvContent = fs.readFileSync(`public/${inputFile}`, "utf-8");
  const records = parse(csvContent, {
    columns: true,
    skip_empty_lines: true,
  });

  console.log(`✨ Found ${records.length} locations to process...`);
  const enhancedRecords = [];

  // Create a copy of records and shuffle them
  const shuffledRecords = [...records];
  for (let i = shuffledRecords.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffledRecords[i], shuffledRecords[j]] = [
      shuffledRecords[j],
      shuffledRecords[i],
    ];
  }

  for (const record of shuffledRecords) {
    try {
      const enhanced = await generateDescription({
        type: record.type as "building" | "sidewalk",
        biome: record.biome,
        x: parseInt(record.x),
        y: parseInt(record.y),
        blockId: parseInt(record.blockId),
      });

      const enhancedRecord = {
        ...record,
        revision: "2",
        description: enhanced.description,
        name: enhanced.name || "",
        businessType: enhanced.businessType || "",
      };

      enhancedRecords.push(enhancedRecord);

      // Show the enhanced description
      console.log("\n----------------------------------------");
      if (enhanced.name) {
        console.log(`🏪 ${enhanced.name}`);
      }
      if (enhanced.businessType) {
        console.log(`📝 ${enhanced.businessType}`);
      }
      console.log(`\n${enhanced.description}`);
      console.log("----------------------------------------");
      console.log(`Progress: ${enhancedRecords.length}/${records.length}\n`);

      // Save progress after each record
      const output = stringify(enhancedRecords, {
        header: true,
        columns: Object.keys(enhancedRecords[0]),
      });
      fs.writeFileSync(`public/${outputFile}`, output);
    } catch (error) {
      console.error(`Error processing location:`, error);
      // Save what we have so far
      const output = stringify(enhancedRecords, {
        header: true,
        columns: Object.keys(enhancedRecords[0]),
      });
      fs.writeFileSync(`public/${outputFile}`, output);
      throw error;
    }
  }

  console.log("\n✅ All done! Final results saved to", outputFile);
}

// Get input and output files from command line arguments
const args = process.argv.slice(2);
if (args.length < 2) {
  console.error(
    "Usage: bun run enhanceDescriptions.ts <input-csv> <output-csv>"
  );
  process.exit(1);
}

const [inputFile, outputFile] = args;
enhanceDescriptions(inputFile, outputFile).catch(console.error);
