fetch('https://sarkultechapi.onrender.com/api/v1/engineer?status=active')
  .then(res => res.json())
  .then(res => console.log(JSON.stringify(res, null, 2)))
  .catch(err => console.error(err.message));
