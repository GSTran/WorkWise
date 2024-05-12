// Quote javascript code used for the Welcome/Quote page
// Quote data is cached to increase load times and decrease API requests to 
// zenquotes.io which are limited
const api_url = "https://zenquotes.io/api/today/";  // No API key needed

async function getQuote() {
  const today = new Date().toISOString().slice(0, 10); 
  
  // Checks the cached quote, if the date isn't today continue, if the date is
  // today, get the cached quote
  const cachedData = localStorage.getItem('quoteData');
  if (cachedData) {
    const { quote, date } = JSON.parse(cachedData); // Parse JSON quote data

    if (date === today) {
      document.getElementById("quote").innerHTML = quote;
      return;
    }
  }

  // Retrieves quote from zenquotes.io
  try {
    const response = await fetch(api_url);
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    const data = await response.json();
    console.log(data);

    const quoteElement = document.getElementById("quote");
    // Checks if data returned from the fetch is valid
    if (data && data.length > 0 && data[0].h) {
      quoteElement.innerHTML = data[0].h;
      // Sets the quoteData item to the quote and today's date
      localStorage.setItem('quoteData', JSON.stringify({ quote: data[0].h, date: today }));
    } else {
      throw new Error('Invalid quote data');
    }
  } catch (error) {
    console.error(error);
  }
}

// Calls the function to output quote wherever used
getQuote();
