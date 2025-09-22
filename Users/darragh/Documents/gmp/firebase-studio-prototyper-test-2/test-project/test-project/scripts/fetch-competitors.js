// fetch-competitors.js
// Scrapes Amazon search results for your brand and saves competitor brands to Supabase

import { chromium } from "playwright";
import { createClient } from "@supabase/supabase-js";
import 'dotenv/config';

// Use the WEBSITE Supabase project credentials
const supabaseUrl = process.env.WEBSITE_SUPABASE_URL;
const supabaseServiceKey = process.env.WEBSITE_SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  throw new Error("Website Supabase URL or Service Key is not defined in your .env file. Please check your website application credentials.");
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fetchAmazonCompetitors(monitoredBrand, maxPages = 1) {
  console.log(`Starting scraper for brand: "${monitoredBrand}" on Amazon...`);
  const browser = await chromium.launch({ headless: true });
  const page = await browser.newPage({
    userAgent:
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/117.0.0.0 Safari/537.36",
  });

  const results = [];

  try {
    const searchUrl = `https://www.amazon.com/s?k=${encodeURIComponent(
      monitoredBrand
    )}`;
    await page.goto(searchUrl, { waitUntil: "domcontentloaded" });
    console.log(`Navigated to Amazon search results for "${monitoredBrand}".`);

    for (let p = 0; p < maxPages; p++) {
      await page.waitForTimeout(1500 + Math.floor(Math.random() * 1000));

      const cards = await page.$$(
        'div[data-component-type="s-search-result"]'
      );
      
      console.log(`Found ${cards.length} product cards on page ${p + 1}.`);

      for (const card of cards) {
        const title = await card
          .$eval("h2 a span", (el) => el.innerText)
          .catch(() => null);

        let brand = await card
          .$eval("div[data-cy='title-recipe'] .s-line-clamp-1 > .a-size-base", (el) => el.innerText)
          .catch(() => null);

        if (!brand && title) {
          brand = title.split(" ")[0]; // fallback
        }

        const urlPart = await card
          .$eval("h2 a", (a) => a.getAttribute("href"))
          .catch(() => null);
        const url = urlPart ? "https://www.amazon.com" + urlPart : null;

        const priceWhole = await card
          .$eval(".a-price .a-price-whole", (el) => el.innerText)
          .catch(() => null);
        const priceFraction = await card
          .$eval(".a-price .a-price-fraction", (el) => el.innerText)
          .catch(() => null);
        const price = priceWhole
          ? parseFloat(
              priceWhole.replace(/,/g, "") +
                (priceFraction ? "." + priceFraction : "")
            )
          : null;

        if (brand && brand.toLowerCase() !== monitoredBrand.toLowerCase()) {
          results.push({
            monitored_brand: monitoredBrand,
            competitor_brand: brand.trim(),
            product_title: title,
            source: "amazon_search",
            price,
            url,
            metric_json: { position: results.length + 1 },
          });
        }
      }

      const nextButton = await page.$("a.s-pagination-item.s-pagination-next");
      if (nextButton && p < maxPages - 1) {
        console.log("Navigating to the next page...");
        await Promise.all([
          page.waitForNavigation({ waitUntil: "domcontentloaded" }),
          nextButton.click(),
        ]);
      } else {
        console.log("No more pages to scrape or max pages reached.");
        break;
      }
    }
  } catch(e) {
    console.error(`An error occurred during scraping: ${e.message}`);
    // Re-throw the error so the server action can catch it
    throw e;
  } finally {
    await browser.close();
    console.log("Browser closed.");
  }

  return results;
}

async function saveToSupabase(rows) {
  if (!rows || rows.length === 0) {
    console.log("No new competitor data to save.");
    return { count: 0 };
  }
  const { error } = await supabase.from("brand_competitors").insert(rows);
  if (error) {
    console.error("❌ Supabase insert error:", error.message);
    throw error;
  } else {
    console.log(`✅ Inserted ${rows.length} rows into Supabase.`);
    return { count: rows.length };
  }
}

export async function runCompetitorScraper(brand) {
  console.log(`🔎 Fetching competitors for: ${brand}`);

  // Fetch 2 pages of results
  const rows = await fetchAmazonCompetitors(brand, 2);
  console.log(`📦 Scraped ${rows.length} competitor products.`);

  const result = await saveToSupabase(rows);
  return { count: result.count };
}