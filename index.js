const fs = require('fs-extra')
 
// Async with promises:
fs.copy('./myfile', './mynewfile')
  .then(() => console.log('success!'))
  .catch(err => console.error(err))

