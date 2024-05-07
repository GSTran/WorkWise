const api_url = "https://zenquotes.io/api/today/";

async function getQuote() {
  const today = new Date().toISOString().slice(0, 10); 
  
  const cachedData = localStorage.getItem('quoteData');
  if (cachedData) {
    const { quote, date } = JSON.parse(cachedData);

    if (date === today) {
      document.getElementById("quote").innerHTML = quote;
      return;
    }
  }

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
      localStorage.setItem('quoteData', JSON.stringify({ quote: data[0].h, date: today }));
    } else {
      throw new Error('Invalid quote data');
    }
  } catch (error) {
    console.error(error);
  }
}

getQuote();
