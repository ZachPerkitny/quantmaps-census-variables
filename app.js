const express = require('express')
const paginate = require('express-paginate');

const variables = require('./variables')

const app = express()
const port = 3000

app.set('view engine', 'pug')

app.use(paginate.middleware(50, 50))

app.get('/', (req, res) => {
    res.render('index', {
        years: Object.keys(variables)
    })
})

app.get('/api/variable/:year/', (req, res) => {
    if (!req.query.query) {
        res.json([])
        return
    }
    const matches = []
    const year = req.params.year
    const query = req.query.query.toLowerCase()
    const limit = req.query.limit
    const skip = req.skip
    let skipped = 0
    for (const variable in variables[year]) {
        const variableProps = variables[year][variable]
        if (variable.toLowerCase().startsWith(query) ||
                (variableProps.label && variableProps.label.toLowerCase().indexOf(query) !== -1) ||
                (variableProps.concept && variableProps.concept.toLowerCase().indexOf(query) !== -1)) {
            if (skipped < skip) {
                skipped++
                continue
            }
            matches.push({
                description: variableProps.label,
                name: variable,
            })
        }
        if (matches.length >= limit) {
            break
        }
    }
    res.json(matches)
})

app.listen(port, () => console.log(`listening on port ${port}`))
