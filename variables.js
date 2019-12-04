const fs = require('fs')
const request = require('sync-request')
const xlsx = require('node-xlsx')

let variables = {}

const path = 'variables.json'
if (fs.existsSync(path)) {
    variables = JSON.parse(fs.readFileSync(path))
} else {
    for (let year = 2006; year <= 2009; year++) {
        let url = `https://www2.census.gov/programs-surveys/acs/summary_file/${year}/`
        if (year === 2006) {
            url += 'documentation/merge_5_6_final.xls'
        } else if (year === 2007) {
            url += 'documentation/1_year/merge_5_6_final.xls'
        } else {
            url += 'documentation/1_year/user_tools/merge_5_6.xls'
        }

        const res = request('GET', url)
        if (res.statusCode !== 200) {
            continue
        }

        const buffer = Buffer.from(res.getBody())
        const ws = JSON.parse(JSON.stringify(xlsx.parse(buffer)))
        const yearVariables = {}
        for (let i = 1; i < ws[0].data.length; i++) {
            const row = ws[0].data[i]
            if (!row[3] || row[3] === '.') continue
            yearVariables[`${row[1]}_${('00' + row[3]).slice(-3)}E`] = {
                label: row[7].toString()
            }
        }
        variables[year] = yearVariables
    }

    for (let year = 2010; year <= new Date().getFullYear(); year++) {
        const res = request(
            'GET',
            `https://api.census.gov/data/${year}/acs/acs1/variables.json`)
        if (res.statusCode === 404) {
            continue
        }
        variables[year] = JSON.parse(res.getBody()).variables
    }

    fs.writeFileSync(path, JSON.stringify(variables))
}

module.exports = variables
