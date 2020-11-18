function generateYaml(){
    var textBox = document.getElementById("yamlTextArea")
    var isValid = validateInputs()
    // if (isValid)
    // {
    //     alert("validation error")
    // }
    
    textBox.value = formatYaml()
}

function collectData(){
    var elements = selectInputElements()

    elements.sort(compare)

    var yaml = {}
    
    for (var elementIndex in elements)
    {
        var element = elements[elementIndex]
        var elementName = element.getAttribute("name").replace(/\$\d+/g, mId => document.getElementById(mId).value)
        var parts = elementName.split('/').slice(1)
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

        var yamlPart = undefined
        var arrayIndexMap = {}
        var tmpNamespace = ``
        
        for (var partIndex in parts.slice(0, -1))
        {
            var part = parts[partIndex]
            
            if (!yaml.includes(part))
            {
                if (part.startsWith('['))
                {
                    yaml[part] = []                     
                }
                else
                {
                    yaml[part] = {}
                }
            }

            yamlPart = yaml[part]
            tmpNamespace += `/${part}`
        }

        var lastPart = parts[parts.length - 1]
    }
}

function formatYaml(){
    var elements = selectInputElements()

    elements.sort(compare)

    var yamlText = ``
    var namespaces = []
    var skipNextIdentation = false
    for (var elementIndex in elements)
    {
        var element = elements[elementIndex]
        var elementName = element.getAttribute("name").replace(/\$\d+/g, mId => document.getElementById(mId).value)
        console.log(elementName)
        var parts = elementName.split('/').slice(1)
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
        var tmpNamespace = ``
        for (var partIndex in parts)
        {
            var part = parts[partIndex]
            tmpNamespace += `/${part}`

            if (!namespaces.includes(tmpNamespace))
            {
                namespaces.push(tmpNamespace)
                
                if (!skipNextIdentation)
                {
                    yamlText += "  ".repeat(partIndex)
                }

                if (part.startsWith('['))
                {
                    yamlText += `-`
                    skipNextIdentation = true
                }
                else
                {
                    yamlText += `${part}:`
                    
                    if (partIndex < (parts.length - 1))
                    {
                        yamlText += "\n"
                    }
                }
            }
            if (partIndex == (parts.length - 1))
            {                 
                if (validator instanceof RegexValidator ||
                    validator instanceof StringValidator ||
                    validator instanceof EnumValidator)
                {
                    yamlText += ` "${value}"`
                }
                else
                {
                    yamlText += ` ${value}`
                }
            }
        }

        yamlText += `\n`
    }

    return yamlText
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
