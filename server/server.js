require('dotenv').config();
const express = require('express');
const cors = require('cors');
const app = express();
const cookieParser = require('cookie-parser');
const axios = require('axios');
const { load } = require('cheerio');
const { MongoClient } = require('mongodb');

app.use(cors({
    credentials: true,
    origin: 'http://localhost:3000'
  }));
app.use(express.json(), express.urlencoded({extended: true}));
app.use(cookieParser());

const mongoClient = new MongoClient(process.env.MONGODB_ATLAS_URI);

const port = 8000;

app.get('/api/recipes/search', async (req, res) => {
  try {
    const { ingredients, number } = req.query;

    const ingredientsQuery = ingredients.join(',');

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/findByIngredients?ingredients=${encodeURIComponent(
        ingredientsQuery
      )}&number=${number}&addRecipeNutrition=true&addRecipeInformation=true&apiKey=${process.env.REACT_APP_API_KEY}`
    );

    const recipes = response.data;
    res.json(recipes);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

app.get('/api/recipes/:id/information', async (req, res) => {
  try {
    const { id } = req.params;

    const response = await axios.get(
      `https://api.spoonacular.com/recipes/${id}/information?apiKey=${process.env.REACT_APP_API_KEY}`
    );

    const recipeInfo = response.data;
    res.json(recipeInfo);
  } catch (error) {
    console.log(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});

const websiteConfigs = [
  {
    name: 'Farmhouse on Boone',
    domain: 'www.farmhouseonboone.com',
    selectors: {
      title: 'h2.mv-create-title.mv-create-title-primary',
      ingredients: 'div.mv-create-ingredients ul li',
      instructions: 'div.mv-create-instructions.mv-create-instructions-slot-v2 ol li'
    }
  },
  {
    name: 'All Recipes',
    domain: 'www.allrecipes.com',
    selectors: {
      title: '.loc.article-post-header h1.article-heading',
      ingredients: '#mntl-structured-ingredients_1-0 ul li',
      instructions: '#recipe__steps-content_1-0 ol li p.mntl-sc-block-html'
    }
  },
  {
    name: 'The Kitchn',
    domain: 'www.thekitchn.com',
    selectors: {
      title: 'h2.jsx-2125538254.Recipe__title',
      ingredients: 'section.jsx-2125538254.Recipe__ingredientsSection ul.Recipe__ingredients li.Recipe__ingredient',
      instructions: 'section.jsx-2125538254.Recipe__instructionsSection ol.Recipe__instructions li.Recipe__instructionStep div.Recipe__instructionStepContent span p',
    }
  }
  
];

// API route to handle recipe scraping
app.post('/scrape-recipe', async (req, res) => {
  try {
    const { url } = req.body;

    // Fetch the HTML content of the provided URL
    const response = await axios.get(url, {
      headers: {
        'User-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36', 
      }
    });
    const html = response.data;

    // Use Cheerio to parse the HTML content
    const $ = load(html);

    // Implement your scraping logic here to extract recipe data
    const hostname = new URL(url).hostname;
    const websiteConfig = websiteConfigs.find(config => config.domain === hostname);

    if (!websiteConfig) {
      return res.status(400).json({ error: 'Unsupported website' })
    }

    // For now, let's just send back the title of the page
    const title = $(websiteConfig.selectors.title).text();
    const ingredients = [];
    const instructions = [];

    $(websiteConfig.selectors.ingredients).each((index, element) => {
      const ingredient = $(element).text().trim();
      ingredients.push(ingredient);
    });

    $(websiteConfig.selectors.instructions).each((index, element) => {
      const instruction = $(element).text().trim();
      instructions.push(instruction);
    });
    
    res.json({ title, ingredients, instructions });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: 'An error occurred' });
  }
});


require('./config/mongoose.config');
require('./routes/recipe.routes')(app);
require('./routes/user.routes')(app);

app.listen(port, async () => {
    try {
      await mongoClient.connect();
      database = mongoClient.db("recipesDB");
      userCollection = database.collection("users");
      recipeCollection = database.collection("recipes");
    } catch (error) {
        console.error(error);
    }
    console.log(`Listening on port: ${port}`)
  });
