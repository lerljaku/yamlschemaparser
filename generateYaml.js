function generateYaml(){
    var textBox = document.getElementById("yamlTextArea")
    var isValid = validateInputs()
    // if (isValid)
    // {
    //     alert("validation error")
    // }
    var data = collectData();
    var txt = jsyaml.safeDump(data)
    textBox.value = txt
}

function collectData(){
    var elements = selectInputElements()

    elements.sort(compare)

    var filteredElements = []
    for (var elementIndex in elements)
    {
        var element = elements[elementIndex]
        var value = element.value
        var validatorId = element.getAttribute("data-validatorid")
        var validator = validators[validatorId]

        if (element.type =="checkbox"){
            value = element.checked
        }

        if (!validator.required && isEmptyOrSpaces(value))
        {
            continue
        }

        filteredElements.push(element)       
    }

    return parse(filteredElements)
}

function parse(elements)
{    
    var yaml = {}
    var indexMap = {}
    for (var elNameIndex in elements)
    {
        var element = elements[elNameIndex]
        var elementName = element.getAttribute("name").replace(/\$\d+/g, mId => document.getElementById(mId).value)
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

        var value = element.value
        if (element.type =="checkbox"){
            value = element.checked
        }
        if (yamlPart instanceof Array)
        {
            yamlPart.push(element.value)
        }
        else
        {
            var lastpart = parts[parts.length - 1]
            yamlPart[lastpart] = element.value
        }     
    }

    return yaml
}

function validateInputs(){
    var valid = true
    var elements = selectInputElements()
    for (var elementIndex in elements){
        var element = elements[elementIndex]
        var validatorId = element.getAttribute("data-validatorid")
        var validator = validators[validatorId]
        var isValid = validator.validate(element.value)
        if (isValid){
            element.style.borderColor = "green"
        }
        else{
            element.style.borderColor = "red"
            valid = false
        }
    }
    return valid
}

function selectInputElements(){
    var guiElements = document.getElementById("generateGuiDiv")
    var selects = [...guiElements.querySelectorAll("select")]
    var inputs = [...guiElements.querySelectorAll("input")]

    var elements = selects.concat(inputs).filter(e => e.name.startsWith('/') && e.offsetParent !== null)

    return elements
}

function compare(a, b) {
    var nameA = a.name.toUpperCase()
    var nameB = b.name.toUpperCase()

    if (nameA < nameB) 
    {
      return -1;
    }

    if (nameA > nameB) 
    {
      return 1;
    }
    
    // names must be equal
    return 0;
}
