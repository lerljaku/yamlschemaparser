// const jsyaml = require('js-yaml')
// const fs = require('fs')

// console.log(jsyaml.safeLoadAll(fs.readFileSync('./test.yml', 'utf8')))

function parse(elementNames)
{    
    var yaml = {}
    var indexMap = {}
    for (var elNameIndex in elementNames)
    {
        var elementName = elementNames[elNameIndex]    
        var parts = elementName.split('/').slice(1)
        var yamlPart = yaml
        var tmpNamespace = ``
        for (var partIndex in parts.slice(0, -1))
        {
            partIndex = parseInt(partIndex)

            var part = parts[partIndex]
            var nextPart = parts[partIndex + 1]

            if (part.startsWith('['))
            {
                if (indexMap[tmpNamespace] === undefined)
                {
                    indexMap[tmpNamespace] = {}
                }
                if (indexMap[tmpNamespace][part] === undefined)
                {
                    indexMap[tmpNamespace][part] = Object.keys(indexMap[tmpNamespace]).length                     
                } 

                part = indexMap[tmpNamespace][part]
            }

            tmpNamespace += `/${part}`

            if (yamlPart[part] === undefined)
            {
                var dict = undefined
                if (nextPart.startsWith('['))
                {
                    dict = []                   
                }
                else
                {
                    dict = {}
                }

                if (yamlPart instanceof Array)
                {
                    yamlPart.push(dict)
                }
                else
                {
                    yamlPart[part] = dict 
                }                
            }
            yamlPart = yamlPart[part]
        }

        if (yamlPart instanceof Array)
        {
            yamlPart.push( "xxx")
        }
        else
        {
            var lastpart = parts[parts.length - 1]
            yamlPart[lastpart] = "xxx"
        }     
    }

    return yaml
}

console.log(parse([
    // "/account/aws/cloudtrail_data_resources/[106]/type",
    "/account/aws/cloudtrail_data_resources/[106]/name",
    "/account/aws/cloudtrail_data_resources/[114]/type",
    "/account/aws/cloudtrail_data_resources/[114]/name",
    "/account/alias",
    "/account/notes/[114]",
    "/account/notes/[106]",
    // "/name/[114]",
    // "/account/aws/cloudtrail_data_resources/[114]/type",
    // "/account/aws/cloudtrail_data_resources/[114]/values/[122]",
    // "/account/aws/cloudtrail_data_resources/[114]/values/[123]",
]))
