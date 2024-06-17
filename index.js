import express from 'express';
import axios from 'axios';
import cheerio from 'cheerio';

const app = express();

async function scrapeExchangeRates() {
    const url = 'https://www.hsbc.com.my/investments/products/foreign-exchange/currency-rate/';
    
    try {
        console.log('Sending request to:', url);
        const response = await axios.get(url);
        
        console.log('Response status:', response.status);

        if (response.status !== 200) {
            throw new Error(`Failed to load page, status code: ${response.status}`);
        }
        const { data } = response;
        const $ = cheerio.load(data);
        
        console.log('HTML content loaded successfully.');

        const rows = [];
        $('table.desktop tbody tr').each((index, element) => {
            const countryName = $(element).find('td').eq(0).text().trim();
            const ttSell = $(element).find('td').eq(1).text().trim();
            const ttBuy = $(element).find('td').eq(2).text().trim();

            console.log(`Country Name: ${countryName}, TT Sell: ${ttSell}, TT Buy: ${ttBuy}`);

            if (countryName && ttSell && ttBuy) {
              rows.push({ countryName, buyRate: ttBuy, sellRate: ttSell });
            }
        });

        const timestamp = new Date().toISOString();
        console.log('Scraping completed successfully.');
        return { rows, timestamp };
    } catch (error) {
        console.error('Error scraping exchange rates:', error.message);
        return { rows: [], timestamp: new Date().toISOString() };
    }
}

app.get('/api/exchange-rates', async (req, res) => {
    const { rows, timestamp } = await scrapeExchangeRates();
    res.json({ data: rows, timestamp });
});

app.use(express.static('public'));

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
