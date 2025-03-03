```markdown
# Gemini API Guide

The Gemini API can generate text output when provided text, images, video, and audio as input. This guide shows you how to generate text using the `generateContent` and `streamGenerateContent` methods. For information on Gemini's vision and audio capabilities, refer to the [Vision and Audio guides](#).

---

## Generate Text from Text-Only Input

The simplest way to generate text using the Gemini API is to provide the model with a single text-only input. In this example, the prompt `"Explain how AI works"` is used in a zero-shot approach.

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const result = await model.generateContent(prompt);
console.log(result.response.text());
```

*Note: For some use cases, a one-shot or few-shot prompt might produce output that's more aligned with user expectations. You can also provide system instructions to guide the model.*

---

## Generate Text from Text-and-Image Input

The Gemini API supports multimodal inputs that combine text with media files. The example below shows how to generate text using a text prompt and an image input.

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
import * as fs from 'node:fs';

const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

function fileToGenerativePart(path, mimeType) {
  return {
    inlineData: {
      data: Buffer.from(fs.readFileSync(path)).toString("base64"),
      mimeType,
    },
  };
}

const prompt = "Describe how this product might be manufactured.";
const imagePart = fileToGenerativePart("/path/to/image.png", "image/png");

const result = await model.generateContent([prompt, imagePart]);
console.log(result.response.text());
```

---

## Generate a Text Stream

By default, the model returns a response after completing the entire text generation process. You can achieve faster interactions by using streaming to handle partial results. The example below demonstrates how to implement streaming with the `streamGenerateContent` method for a text-only input.

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const prompt = "Explain how AI works";

const result = await model.generateContentStream(prompt);

for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

---

## Create a Chat Conversation

The Gemini SDK allows you to collect multiple rounds of questions and responses, enabling a conversational interface. This feature tracks conversation history while using the same `generateContent` method to create responses.

### Chat Conversation Example

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });
const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessage("I have 2 dogs in my house.");
console.log(result.response.text());
let result2 = await chat.sendMessage("How many paws are in my house?");
console.log(result2.response.text());
```

### Chat Conversation with Streaming

You can also use streaming with chat to handle partial responses as they are generated.

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");
const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const chat = model.startChat({
  history: [
    {
      role: "user",
      parts: [{ text: "Hello" }],
    },
    {
      role: "model",
      parts: [{ text: "Great to meet you. What would you like to know?" }],
    },
  ],
});

let result = await chat.sendMessageStream("I have 2 dogs in my house.");
for await (const chunk of result.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
let result2 = await chat.sendMessageStream("How many paws are in my house?");
for await (const chunk of result2.stream) {
  const chunkText = chunk.text();
  process.stdout.write(chunkText);
}
```

---

## Configure Text Generation

Every prompt you send to the model includes parameters that control how the model generates responses. You can use `GenerationConfig` to configure these parameters. If not configured, the model uses default options, which may vary by model.

```javascript
import { GoogleGenerativeAI } from "@google/generative-ai";
const genAI = new GoogleGenerativeAI("GEMINI_API_KEY");

const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash" });

const result = await model.generateContent({
    contents: [
        {
          role: 'user',
          parts: [
            {
              text: "Explain how AI works",
            }
          ],
        }
    ],
    generationConfig: {
      maxOutputTokens: 1000,
      temperature: 0.1,
    }
});

console.log(result.response.text());
```

---

## Add System Instructions

System instructions allow you to steer the model's behavior to meet specific needs. These instructions provide additional context and guidelines separate from user prompts. You can set system instructions during model initialization.

```javascript
// Set the system instruction during model initialization
const model = genAI.getGenerativeModel({
  model: "gemini-1.5-flash",
  systemInstruction: "You are a cat. Your name is Neko.",
});
```

After initialization, you can send requests to the model as usual.
```