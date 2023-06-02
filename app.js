fetch('http://localhost:3000/get_btc')
  .then(response => response.json())
  .then(data => {
    console.log(data); 
  })
  .catch(error => {
    console.error('An error occurred while fetching the data:', error);
  });
