const fetch = globalThis.fetch || require('node-fetch');

async function main(){
  const url = process.argv[2] || 'http://localhost:3001/api/intentions';
  const payload = {
    listingId: 'test-listing-789',
    listingName: 'Test send listing 3',
    listingImageUrl: 'https://via.placeholder.com/400',
    userEmail: 'joshuambiyu002@gmail.com',
    message: 'Third test to check SEND_FROM'
  };

  try{
    const res = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
    });
    const text = await res.text();
    console.log('Status:', res.status);
    console.log('Body:', text);
  }catch(err){
    console.error('Request failed:', err);
  }
}

main();
