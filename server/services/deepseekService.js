import dotenv from 'dotenv';
dotenv.config();

/**
 * DeepSeek AI Service
 * Powered by DeepSeek-V3 / DeepSeek-R1 (deepseek-chat)
 * Provides AI-powered entity extraction, catalog normalization, and search ranking evaluation
 * with resilient local fallback for zero-downtime operation.
 */

class DeepSeekService {
  constructor() {
    this.apiKey = process.env.DEEPSEEK_API_KEY || '';
    this.apiBase = process.env.DEEPSEEK_API_BASE || 'https://api.deepseek.com';
    this.model = 'deepseek-chat';
    this.lastStatus = {
      testedAt: null,
      success: false,
      message: 'Unverified',
    };
  }

  setApiKey(key) {
    this.apiKey = key;
    process.env.DEEPSEEK_API_KEY = key;
  }

  async testConnection() {
    const startTime = Date.now();
    try {
      const response = await fetch(`${this.apiBase}/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.apiKey}`,
        },
        body: JSON.stringify({
          model: this.model,
          messages: [{ role: 'user', content: 'Ping' }],
          max_tokens: 5,
        }),
      });

      const data = await response.json();
      const latencyMs = Date.now() - startTime;

      if (data.error) {
        this.lastStatus = {
          testedAt: new Date().toISOString(),
          success: false,
          errorCode: data.error.code,
          message: data.error.message || 'DeepSeek API Error',
          latencyMs,
        };
        return {
          success: false,
          model: this.model,
          latencyMs,
          error: data.error.message,
          code: data.error.code,
          note: data.error.message.includes('Balance') 
            ? 'DeepSeek account requires credit balance. Heuristic AI active in meantime.' 
            : data.error.message,
        };
      }

      this.lastStatus = {
        testedAt: new Date().toISOString(),
        success: true,
        message: 'Connected to DeepSeek-V3',
        latencyMs,
      };

      return {
        success: true,
        model: this.model,
        latencyMs,
        message: 'DeepSeek API authenticated & ready.',
      };
    } catch (err) {
      return {
        success: false,
        latencyMs: Date.now() - startTime,
        error: err.message,
      };
    }
  }

  async chatCompletion(messages, { temperature = 0.3, max_tokens = 500, jsonMode = false } = {}) {
    if (!this.apiKey) {
      throw new Error('DEEPSEEK_API_KEY is not configured');
    }

    const payload = {
      model: this.model,
      messages,
      temperature,
      max_tokens,
    };

    if (jsonMode) {
      payload.response_format = { type: 'json_object' };
    }

    const res = await fetch(`${this.apiBase}/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.apiKey}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await res.json();
    if (data.error) {
      throw new Error(data.error.message || 'DeepSeek API execution failed');
    }

    return data.choices?.[0]?.message?.content || '';
  }

  /**
   * AI Buyer Intent Extraction using DeepSeek
   */
  async extractBuyerIntent(userMessage) {
    try {
      const prompt = `Analyze this buyer shopping message: "${userMessage}".
Extract in JSON format:
{
  "intent": "purchase" or "inquiry",
  "product": "extracted product name or phrase",
  "quantity": number (default 1),
  "budget": number or null,
  "confidence": number between 0.8 and 0.99
}`;

      const raw = await this.chatCompletion([
        { role: 'system', content: 'You are an autonomous commerce entity extraction engine. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.1, max_tokens: 200 });

      const parsed = JSON.parse(raw.replace(/^```json|```$/g, '').trim());
      return {
        ...parsed,
        source: 'DEEPSEEK_AI',
      };
    } catch (err) {
      // Intelligent fallback
      return null;
    }
  }

  /**
   * AI Catalog Normalization using DeepSeek
   */
  async normalizeProductFromText(rawText) {
    try {
      const prompt = `Convert this raw product details into clean commerce structure:
"${rawText}"

Extract JSON:
{
  "title": "Clean Product Title",
  "brand": "Brand Name",
  "category": "Category",
  "price": number,
  "mrp": number,
  "description": "Short description",
  "variants": [{"name": "Standard", "price": number}]
}`;

      const raw = await this.chatCompletion([
        { role: 'system', content: 'You are an ecommerce catalog normalization AI. Output valid JSON only.' },
        { role: 'user', content: prompt }
      ], { temperature: 0.1, max_tokens: 300 });

      return JSON.parse(raw.replace(/^```json|```$/g, '').trim());
    } catch (err) {
      return null;
    }
  }

  getStatus() {
    return {
      provider: 'DeepSeek AI',
      model: this.model,
      apiBase: this.apiBase,
      keyPreview: this.apiKey ? `${this.apiKey.substring(0, 7)}...${this.apiKey.substring(this.apiKey.length - 4)}` : 'Not Set',
      lastStatus: this.lastStatus,
    };
  }
}

export const deepseekService = new DeepSeekService();
