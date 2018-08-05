const { json } = require('micro')
const pair = require('./pairer.js')

module.exports = async (req, res) => {
  const students = await json(req)

  const result = await pair(students)

  res.end(result)
}