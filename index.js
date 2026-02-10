import express from "express";
import cors from "cors";
import axios from "axios";

const app = express();
app.use(cors());
app.use(express.json());

const PORT = 3000;
const OFFICIAL_EMAIL = "sunidhi1300.be23@chitkara.edu.in";

/* ---------------- HEALTH API ---------------- */

app.get("/health", (req, res) => {
  res.status(200).json({
    is_success: true,
    official_email: OFFICIAL_EMAIL
  });
});

/* ---------------- LOGIC FUNCTIONS ---------------- */

function fibonacci(n) {
  if (!Number.isInteger(n) || n < 0) return null;
  let a = 0, b = 1;
  const res = [];
  for (let i = 0; i < n; i++) {
    res.push(a);
    [a, b] = [b, a + b];
  }
  return res;
}

function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2; i * i <= num; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

function gcd(a, b) {
  return b === 0 ? a : gcd(b, a % b);
}

function hcf(arr) {
  return arr.reduce((a, b) => gcd(a, b));
}

function lcm(a, b) {
  return (a * b) / gcd(a, b);
}

function lcmArray(arr) {
  return arr.reduce((a, b) => lcm(a, b));
}

/* ---------------- AI FUNCTION ---------------- */

async function askAI(question) {
  const GEMINI_API_KEY = process.env.GEMINI_API_KEY;

  if (!GEMINI_API_KEY) {
    throw "AI API key not configured";
  }

  const url =
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key=${GEMINI_API_KEY}`;

  const response = await axios.post(url, {
    contents: [{ parts: [{ text: question }] }]
  });

  return response.data.candidates[0].content.parts[0].text
    .trim()
    .split(" ")[0];
}

/* ---------------- POST /bfhl ---------------- */

app.post("/bfhl", async (req, res) => {
  try {
    const keys = Object.keys(req.body);

    if (keys.length !== 1) {
      return res.status(400).json({
        is_success: false,
        message: "Exactly one key is required"
      });
    }

    const key = keys[0];
    let data;

    switch (key) {
      case "fibonacci":
        data = fibonacci(req.body[key]);
        if (!data) throw "Invalid Fibonacci input";
        break;

      case "prime":
        if (!Array.isArray(req.body[key])) throw "Prime expects array";
        data = req.body[key].filter(isPrime);
        break;

      case "lcm":
        if (!Array.isArray(req.body[key])) throw "LCM expects array";
        data = lcmArray(req.body[key]);
        break;

      case "hcf":
        if (!Array.isArray(req.body[key])) throw "HCF expects array";
        data = hcf(req.body[key]);
        break;

      case "AI":
        if (typeof req.body[key] !== "string") throw "AI expects string";
        data = await askAI(req.body[key]);
        break;

      default:
        throw "Invalid key";
    }

    return res.status(200).json({
      is_success: true,
      official_email: OFFICIAL_EMAIL,
      data
    });

  } catch (err) {
    return res.status(400).json({
      is_success: false,
      message: err.toString()
    });
  }
});

/* ---------------- START SERVER ---------------- */

app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
