const fs = require('fs')
const promisify = require('util').promisify
const read = promisify(fs.readFile)
const write = promisify(fs.writeFile)

const pairs = async (input, output = './previous.json') => {
  if (!input) return new Error('missing input data')

  const { seniors, juniors, r } = input

  if (!seniors || !juniors) {
    return new Error('missing a group to pair with')
  }

  if (r) await write('./previous.json', '')

  let division, color, iteratee, opposite
  const junLen = juniors.length
  const senLen = seniors.length
  if (junLen > senLen) {
    division = junLen / senLen
    color = '\x1b[32m'
    iteratee = seniors
    opposite = juniors
  } else {
    division = senLen / junLen
    color = '\x1b[33m'
    iteratee = juniors
    opposite = seniors
  }

  const previous = await read(output)
    .then(res => JSON.parse(res))
    .catch(() => iteratee.reduce((acc, el) => {
      acc[el] = []
      return acc
    }, {}))

  const matched = new Set()

  const newPairs = shuffle(iteratee).reduce((acc, el) => {
    const matches = opposite.reduce((curr,pot) => {
      if (!matched.has(pot) && curr.length < division && !previous[el].includes(pot)) {
        curr.push(pot)
        matched.add(pot)
      }
      return curr
    }, [])
    acc[el] = matches
    previous[el].push(...matches)
    return acc
  }, {})

  write(output, JSON.stringify(previous))

  const single = Object.keys(newPairs).find(el => newPairs[el].length < division)

  let loggingFormat = newPairs

  if (single) {
    const pairedIt = shuffle(Object.keys(newPairs)).reduce((acc, el) => !acc && el !== single ? el : acc, '')
    loggingFormat = Object.keys(newPairs).reduce((acc, el) => {
      return el !== pairedIt && el !== single
        ? {...acc, [el] : newPairs[el]}
        : acc
    } ,{[`${pairedIt} & ${single}`]: newPairs[pairedIt]})
  }

  return JSON.stringify(loggingFormat)
}

const shuffle = (a) => {
  for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

module.exports = pairs