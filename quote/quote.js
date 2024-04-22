const api_url = "https://zenquotes.io/api/today/";

async function getQuote() {
  try {
    const response = await fetch(api_url);
    if (!response.ok) {
      throw new Error('Failed to fetch quote');
    }
    const data = await response.json();
    console.log(data);
    
    const quoteElement = document.getElementById("quote");
    if (data && data.length > 0 && data[0].h) {
      quoteElement.innerHTML = data[0].h;
    } else {
      throw new Error('Invalid quote data');
    }
  } catch (error) {
    console.error(error);
  }
}

getQuote();
