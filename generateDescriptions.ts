#!/usr/bin/env bun

import { OpenAI } from "openai";
import * as dotenv from "dotenv";

// Load environment variables from .env file
dotenv.config();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
});

type DescriptionRequest = {
  type: "building" | "sidewalk";
  biome: string;
  x: number;
  y: number;
  blockId: number;
};

type DescriptionResponse = {
  description: string;
  name?: string;
  businessType?: string;
};

const businessTypes = [
  "cafe",
  "restaurant",
  "bakery",
  "grocery store",
  "bookstore",
  "clothing store",
  "pharmacy",
  "hardware store",
  "coffee shop",
  "art gallery",
  "music store",
  "jewelry store",
  "antique shop",
  "flower shop",
  "toy store",
  "pet store",
  "stationery store",
  "gift shop",
  "sports store",
  "electronics store",
  "furniture store",
];

const openingPhrases = [
  "Standing proudly",
  "Rising from the street",
  "Emerging from the urban landscape",
  "Carved into the cityscape",
  "Breaking the skyline",
  "Defining this corner",
  "Marking this intersection",
  "Claiming its space",
  "Drawing attention",
  "Commanding presence",
  "Settling into the block",
  "Anchoring the neighborhood",
  "Shaping the streetscape",
  "Framing the view",
  "Setting the scene",
  "Creating atmosphere",
  "Establishing character",
  "Defining the area",
  "Enriching the block",
  "Enhancing the street",
  "Contributing to the scene",
  "Adding to the character",
  "Blending with surroundings",
  "Complementing the area",
  "Harmonizing with the block",
  "Integrating into the street",
  "Merging with the landscape",
  "Fitting into the scene",
  "Belonging to the block",
  "Finding its place",
  "Taking its position",
  "Occupying its space",
  "Holding its ground",
  "Maintaining its presence",
  "Asserting its identity",
  "Expressing its character",
  "Revealing its nature",
  "Showing its face",
  "Displaying its features",
  "Presenting its facade",
  "Unfolding its story",
  "Telling its tale",
  "Sharing its history",
  "Revealing its past",
  "Unveiling its secrets",
  "Opening its doors",
  "Welcoming visitors",
  "Inviting exploration",
  "Encouraging discovery",
  "Promising adventure",
];

const writingStyles = [
  "Write in a poetic, flowing style",
  "Use vivid sensory details",
  "Focus on architectural elements",
  "Emphasize historical significance",
  "Highlight unique features",
  "Describe the atmosphere",
  "Paint a picture of daily life",
  "Capture the essence of the place",
  "Evoke a sense of wonder",
  "Create a mood",
  "Tell a story",
  "Share a moment",
  "Reveal a secret",
  "Uncover a mystery",
  "Explore a theme",
  "Develop a character",
  "Set a scene",
  "Build anticipation",
  "Create intrigue",
  "Spark curiosity",
  "Inspire imagination",
  "Stir emotions",
  "Trigger memories",
  "Evoke nostalgia",
  "Suggest possibilities",
  "Hint at stories",
  "Whisper secrets",
  "Share wisdom",
  "Offer insights",
  "Provide context",
  "Give perspective",
  "Show contrast",
  "Highlight differences",
  "Emphasize uniqueness",
  "Celebrate character",
  "Honor tradition",
  "Embrace change",
  "Welcome innovation",
  "Preserve history",
  "Look to the future",
  "Bridge past and present",
  "Connect with community",
  "Serve the neighborhood",
  "Enrich the area",
  "Enhance the block",
  "Improve the street",
  "Better the city",
  "Shape the future",
  "Make a difference",
  "Leave a mark",
];

async function generateDescription(
  request: DescriptionRequest
): Promise<DescriptionResponse> {
  const { type, biome } = request;

  // Determine description style
  const style = Math.random();
  let length = "brief";
  if (style < 0.8) {
    length = "brief"; // 80% chance of brief (1-2 sentences)
  } else if (style < 0.95) {
    length = "standard"; // 15% chance of standard (3-4 sentences)
  } else {
    length = "detailed"; // 5% chance of detailed (5+ sentences)
  }

  // Pick random opening and style
  const opening =
    openingPhrases[Math.floor(Math.random() * openingPhrases.length)];
  const styleGuide =
    writingStyles[Math.floor(Math.random() * writingStyles.length)];

  let prompt = "";
  if (type === "building") {
    if (biome === "commercial" || biome === "mixed-use") {
      const includeName = Math.random() < 0.85;
      const businessType =
        businessTypes[Math.floor(Math.random() * businessTypes.length)];

      prompt = `${
        length === "brief"
          ? `Describe this ${businessType} building in a ${biome} area in 1-2 simple, utilitarian sentences. Focus on the building itself - its appearance, structure, and unique architectural features.`
          : length === "standard"
          ? `${opening}, ${styleGuide}. Describe this ${businessType} building in a ${biome} area in 3-4 sentences. Focus on the building's architecture and what makes it stand out.`
          : `${opening}, ${styleGuide}. Create a rich, detailed description of this ${businessType} building in a ${biome} area in 5+ sentences. Focus on the building's architecture, history, and unique features.`
      }
      ${
        includeName
          ? "Include a creative, memorable name for the business."
          : "Do not include a business name."
      }
      Do not mention time of day or weather.
      Avoid using the word "nestled" or similar phrases.
      Focus on the building itself, not the surrounding area.`;

      const response = await openai.chat.completions.create({
        model: "gpt-4-turbo-preview",
        messages: [{ role: "user", content: prompt }],
        temperature: 0.8,
      });

      const description = response.choices[0].message.content || "";
      return {
        description,
        name: includeName ? extractBusinessName(description) : undefined,
        businessType,
      };
    } else if (biome === "park") {
      // Park buildings get more subtle descriptions
      prompt = `${
        length === "brief"
          ? `Describe this structure in the park in 1-2 simple sentences. Focus on its purpose and how it fits into the natural surroundings.`
          : length === "standard"
          ? `${opening}, ${styleGuide}. Describe this park structure in 3-4 sentences. Focus on how it complements the natural environment.`
          : `${opening}, ${styleGuide}. Create a rich, detailed description of this park structure in 5+ sentences. Focus on its harmony with nature and its role in the park.`
      }
      Do not mention time of day or weather.
      Avoid using the word "nestled" or similar phrases.`;
    } else {
      // Residential or other building types
      prompt = `${
        length === "brief"
          ? `Describe this building in a ${biome} area in 1-2 simple, utilitarian sentences. Focus on the building itself - its appearance, structure, and unique architectural features.`
          : length === "standard"
          ? `${opening}, ${styleGuide}. Describe this building in a ${biome} area in 3-4 sentences. Focus on the building's architecture and what makes it stand out.`
          : `${opening}, ${styleGuide}. Create a rich, detailed description of this building in a ${biome} area in 5+ sentences. Focus on the building's architecture, history, and unique features.`
      }
      Do not mention time of day or weather.
      Avoid using the word "nestled" or similar phrases.
      Focus on the building itself, not the surrounding area.`;
    }
  } else {
    // Sidewalk description
    if (biome === "park") {
      prompt = `${
        length === "brief"
          ? `Describe this path in the park in 1-2 simple sentences. Focus on the natural features you can see from here.`
          : length === "standard"
          ? `${opening}, ${styleGuide}. Describe this park path in 3-4 sentences. Focus on the natural elements and small details.`
          : `${opening}, ${styleGuide}. Create a rich, detailed description of this park path in 5+ sentences. Focus on the natural beauty and subtle features.`
      }
      Do not mention time of day or weather.
      Avoid using the word "nestled" or similar phrases.
      Occasionally include a small, interesting detail like a squirrel, a unique plant, or an unusual feature.`;
    } else {
      prompt = `${
        length === "brief"
          ? `Describe this sidewalk in a ${biome} area in 1-2 simple, utilitarian sentences. Focus on the building you're looking at, not the sidewalk itself.`
          : length === "standard"
          ? `${opening}, ${styleGuide}. Describe this sidewalk in a ${biome} area in 3-4 sentences. Focus on the building you're looking at and its features.`
          : `${opening}, ${styleGuide}. Create a rich, detailed description of this sidewalk in a ${biome} area in 5+ sentences. Focus on the building you're looking at and its architectural details.`
      }
      Do not mention time of day or weather.
      Avoid using the word "nestled" or similar phrases.
      Focus on the building you're looking at, not the sidewalk itself.`;
    }
  }

  const response = await openai.chat.completions.create({
    model: "gpt-4-turbo-preview",
    messages: [{ role: "user", content: prompt }],
    temperature: 0.8,
  });

  return {
    description: response.choices[0].message.content || "",
  };
}

function extractBusinessName(description: string): string | undefined {
  const namePatterns = [
    /named "([^"]+)"/,
    /called "([^"]+)"/,
    /"([^"]+)" (?:is|was) a/,
    /"([^"]+)" (?:is|was) the/,
  ];

  for (const pattern of namePatterns) {
    const match = description.match(pattern);
    if (match && match[1]) {
      return match[1];
    }
  }

  return undefined;
}

export {
  generateDescription,
  type DescriptionRequest,
  type DescriptionResponse,
};
