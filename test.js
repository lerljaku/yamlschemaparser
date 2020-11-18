// const jsyaml = require('js-yaml')
// const fs = require('fs')

// console.log(jsyaml.safeLoadAll(fs.readFileSync('./test.yml', 'utf8')))

function parse(elementNames)
{    
    var yaml = {}
    for (var elNameIndex in elementNames)
    {
        var elementName = elementNames[elNameIndex]    
        var parts = elementName.split('/').slice(1)
        var yamlPart = yaml
        for (var partIndex in parts)
        {
            var part = parts[partIndex]
            
            if (yamlPart[part] === undefined)
            {
                if (part.startsWith('['))
                {
                    yamlPart[part] = []                     
                }
                else
                {
                    yamlPart[part] = {}
                }
            }
    
            yamlPart = yamlPart[part]
        }
    }

    return yaml
}

console.log(parse([
    "/account/aws/cloudtrail_data_resources/[106]/type",
    "/account/alias",
    "/account/aws/access_to_billing",
    // "/name/[114]",
    // "/account/aws/cloudtrail_data_resources/[114]/type",
    // "/account/aws/cloudtrail_data_resources/[114]/values/[122]",
    // "/account/aws/cloudtrail_data_resources/[114]/values/[123]",
]))
