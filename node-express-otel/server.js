require("./telemetry");
require("dotenv").config();
const { trace, context } = require("@opentelemetry/api");
const express = require("express");

const app = express();
const port = process.env.PORT || 3000;
const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

if (!OPENAI_API_KEY) {
  console.error("Please set OPENAI_API_KEY in .env file");
  process.exit(1);
}

/**
 * Create own logger with trace id.
 */

function log(level, message, meta = {}) {
  const activeSpan = trace.getSpan(context.active());
  const traceId = activeSpan ? activeSpan.spanContext().traceId : "no-trace-id";

  const logEntry = {
    timestamp: new Date().toISOString(),
    level,
    message,
    trace_id: traceId,
    ...meta,
  };

  console.log(JSON.stringify(logEntry));
}

// Middleware to parse JSON bodies
app.use((req, _res, next) => {
  log("info", "Incoming request", {
    path: req.path,
    method: req.method,
  });
  next();
});
app.use(express.json());

// Serve static HTML
app.get("/", (_req, res) => {
  // console.log("Serving the chat interface...");
  log("info", "Serving the chat interface...");
  res.send(`<!DOCTYPE html>
<html>
<head>
    <title>ChatGPT Interface</title>
    <style>
        body {
            font-family: Arial, sans-serif;
            max-width: 800px;
            margin: 0 auto;
            padding: 20px;
        }
        .container {
            display: flex;
            flex-direction: column;
            gap: 20px;
        }
        textarea {
            width: 100%;
            height: 100px;
            padding: 10px;
        }
        button {
            padding: 10px 20px;
            background-color: #4CAF50;
            color: white;
            border: none;
            border-radius: 4px;
            cursor: pointer;
        }
        button:hover {
            background-color: #45a049;
        }
        #response {
            white-space: pre-wrap;
            padding: 20px;
            border: 1px solid #ddd;
            border-radius: 4px;
            display: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <h1>ChatGPT Interface</h1>
        <textarea id="prompt" placeholder="Enter your prompt here..."></textarea>
        <button onclick="sendPrompt()">Send to ChatGPT</button>
        <div id="response"></div>
    </div>
    <script>
        async function sendPrompt() {
            const promptText = document.getElementById('prompt').value;
            const responseDiv = document.getElementById('response');
            
            responseDiv.style.display = 'block';
            responseDiv.textContent = 'Loading...';
            
            try {
                const response = await fetch('/api/chat', {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                    },
                    body: JSON.stringify({ prompt: promptText }),
                });
                
                const data = await response.json();
                responseDiv.textContent = data.response;
            } catch (error) {
                responseDiv.textContent = 'Error: ' + error.message;
            }
        }
    </script>
</body>
</html>`);
});

// Chat API endpoint
app.post("/api/chat", async (req, res) => {
  try {
    const { prompt } = req.body;
    // console.log("Prompt:", prompt);
    log("info", `Prompt: ${prompt}`);

    // Add your hardcoded system prompt here
    const systemPrompt =
      "You are a helpful AI assistant. Please provide clear and concise responses.";

    // console.log("Sending request to OpenAI...");
    log("info", "Sending request to OpenAI...");
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${OPENAI_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "gpt-3.5-turbo",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: prompt },
        ],
      }),
    });

    // console.log("Received response from OpenAI");
    log("info", "Received response from OpenAI");
    const data = await response.json();

    res.json({
      response: data.choices[0].message.content,
    });
  } catch (error) {
    // console.error("Error:", error);
    log("info", `Error: ${error}`);
    res.status(500).json({
      error: error.message,
    });
  }
});

// Start the server
app.listen(port, () => {
  // console.log(`Server is running on http://localhost:${port}`);
  log("info", `Server is running on http://localhost:${port}`);
});
